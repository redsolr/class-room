"use server";

import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  studyPackItems,
  studyPacks,
  studyPaths,
  studyPathSteps,
  studyVocab,
} from "@/db";
import { requireLearner } from "@/lib/auth";
import {
  claimedSchedule,
  orderBooksForFastForward,
  type FastForwardBook,
} from "@/lib/fast-forward";
import { importPackForLearner, savedTermsFor } from "@/lib/pack-import";
import { revalidateDeck, revalidateWord } from "@/lib/study-revalidate";

/**
 * THE FAST-FORWARD — "skip what you know" on the first visit.
 *
 * Rules and the reasoning live in `lib/fast-forward.ts`. These two
 * actions are the only writes: load the catalog to walk, and save one
 * book's answers. A claim schedules a card; it never grades one, so no
 * `study_reviews` row is written here — the first real evidence is the
 * day the word comes back and the learner still has it.
 */

const languageSchema = z.string().trim().min(1).max(40);

/**
 * Every official book in the language, in path order, minus the words
 * the learner has already saved. Books with nothing left to ask are
 * dropped (`orderBooksForFastForward`).
 */
export async function loadFastForwardCatalog(
  language: string,
): Promise<FastForwardBook[]> {
  const learner = await requireLearner();
  const lang = languageSchema.parse(language);

  const [packs, saved, pathSlugs] = await Promise.all([
    db
      .select({
        packId: studyPacks.id,
        slug: studyPacks.slug,
        name: studyPacks.name,
      })
      .from(studyPacks)
      .where(eq(studyPacks.language, lang)),
    savedTermsFor(learner.id, lang),
    // The language's FIRST path decides the order — same path Home
    // would suggest to a learner with nothing yet.
    db
      .select({ packSlug: studyPathSteps.packSlug })
      .from(studyPathSteps)
      .innerJoin(studyPaths, eq(studyPathSteps.pathId, studyPaths.id))
      .where(eq(studyPaths.language, lang))
      .orderBy(asc(studyPaths.position), asc(studyPathSteps.position))
      .then((rows) =>
        rows.map((r) => r.packSlug).filter((s): s is string => !!s),
      ),
  ]);
  if (packs.length === 0) return [];

  const items = await db
    .select({
      id: studyPackItems.id,
      packId: studyPackItems.packId,
      term: studyPackItems.term,
      reading: studyPackItems.reading,
      meaning: studyPackItems.meaning,
    })
    .from(studyPackItems)
    .where(
      inArray(
        studyPackItems.packId,
        packs.map((p) => p.packId),
      ),
    )
    .orderBy(asc(studyPackItems.position));

  const books: FastForwardBook[] = packs.map((pack) => ({
    ...pack,
    items: items
      .filter(
        (i) => i.packId === pack.packId && !saved.has(i.term.toLowerCase()),
      )
      .map(({ id, term, reading, meaning }) => ({
        id,
        term,
        reading,
        meaning: meaning ?? "",
      })),
  }));
  return orderBooksForFastForward(books, pathSlugs);
}

const bookAnswersSchema = z.object({
  packId: z.string().uuid(),
  /** Pack ITEM ids the learner said they know. */
  knownItemIds: z.array(z.string().uuid()).max(500),
});

/**
 * Save one book: the whole book becomes the learner's deck (exactly what
 * the Official page's import does — words they said "not yet" to are
 * `new` and due now, which is what a deck to learn IS), and the words
 * they claimed get the four-day schedule.
 *
 * A card that already has a schedule is never touched: the learner
 * could only reach it by drilling it, and a drill is better evidence
 * than a claim.
 */
export async function fastForwardBook(input: {
  packId: string;
  knownItemIds: string[];
}): Promise<{ deckId: string; claimed: number; confirmAt: Date }> {
  const learner = await requireLearner();
  const { packId, knownItemIds } = bookAnswersSchema.parse(input);

  const imported = await importPackForLearner(learner.id, packId);

  let claimed = 0;
  const now = new Date();
  if (knownItemIds.length > 0) {
    // Only items that genuinely belong to THIS pack — an id from another
    // book cannot ride along on a claim.
    const claimedItems = await db
      .select({ term: studyPackItems.term })
      .from(studyPackItems)
      .where(
        and(
          eq(studyPackItems.packId, packId),
          inArray(studyPackItems.id, knownItemIds),
        ),
      );
    const vocabIds = claimedItems
      .map((i) => imported.vocabIdsByTerm[i.term.toLowerCase()])
      .filter((id): id is string => !!id);

    if (vocabIds.length > 0) {
      const updated = await db
        .update(studyVocab)
        .set({ ...claimedSchedule(now), updatedAt: now })
        .where(
          and(
            eq(studyVocab.learnerId, learner.id),
            inArray(studyVocab.id, vocabIds),
            // Never scheduled = never drilled and never claimed.
            sql`${studyVocab.srsDueAt} is null`,
          ),
        )
        .returning({ id: studyVocab.id });
      claimed = updated.length;
    }
  }

  revalidateDeck(imported.deckId);
  revalidateWord();
  return {
    deckId: imported.deckId,
    claimed,
    confirmAt: claimedSchedule(now).srsDueAt,
  };
}
