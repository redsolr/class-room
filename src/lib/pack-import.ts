import { and, asc, eq } from "drizzle-orm";
import {
  db,
  studyDeckItems,
  studyDecks,
  studyPackItems,
  studyPacks,
  studyVocab,
} from "@/db";

/**
 * Copying an official book into a learner's own vocabulary.
 *
 * Lives outside `src/lib/actions/` on purpose: it takes a `learnerId`
 * and trusts it, so it must only ever be called by something that has
 * already resolved the caller (`importStudyPack` on the Official page,
 * `fastForwardBook` on the first-run fast-forward). Two surfaces copy a
 * book; the copy has to mean the same thing on both, which is why the
 * body is here once rather than in each action.
 */

/** The learner's saved terms in a language, lowercased for dedup. */
export async function savedTermsFor(
  learnerId: string,
  language: string,
): Promise<Set<string>> {
  const rows = await db
    .select({ term: studyVocab.term })
    .from(studyVocab)
    .where(
      and(eq(studyVocab.learnerId, learnerId), eq(studyVocab.language, language)),
    );
  return new Set(rows.map((r) => r.term.toLowerCase()));
}

export type PackImportResult = {
  added: number;
  list: string;
  deckId: string;
  /** Lowercased term → the learner's own vocab row id. */
  vocabIdsByTerm: Record<string, string>;
};

/**
 * Copy the WHOLE pack: every not-yet-saved item joins the learner's
 * vocabulary, and a personal deck named after the pack is created (or
 * refreshed) carrying the pack's curated order. The learner's deck is
 * theirs afterwards — reorder, prune, extend freely.
 *
 * Dedup is per language on the lowercased term, the same key the pack
 * page's ✓ is computed from, so someone who typed a word by hand before
 * finding the book keeps their own row.
 */
export async function importPackForLearner(
  learnerId: string,
  packId: string,
): Promise<PackImportResult> {
  const pack = await db.query.studyPacks.findFirst({
    where: eq(studyPacks.id, packId),
  });
  if (!pack) throw new Error("Pack not found");
  const items = await db
    .select()
    .from(studyPackItems)
    .where(eq(studyPackItems.packId, pack.id))
    .orderBy(asc(studyPackItems.position));

  const saved = await savedTermsFor(learnerId, pack.language);
  const fresh = items.filter((i) => !saved.has(i.term.toLowerCase()));
  if (fresh.length > 0) {
    await db.insert(studyVocab).values(
      fresh.map((item) => ({
        learnerId,
        language: pack.language,
        term: item.term,
        reading: item.reading,
        meaning: item.meaning,
        example: item.example,
        category: item.category,
      })),
    );
  }

  // The learner's copy of the pack as a deck, in pack order.
  const vocabRows = await db
    .select({ id: studyVocab.id, term: studyVocab.term })
    .from(studyVocab)
    .where(
      and(
        eq(studyVocab.learnerId, learnerId),
        eq(studyVocab.language, pack.language),
      ),
    );
  const byTerm = new Map(vocabRows.map((r) => [r.term.toLowerCase(), r.id]));
  const orderedIds = items
    .map((i) => byTerm.get(i.term.toLowerCase()))
    .filter((v): v is string => !!v);

  let list = await db.query.studyDecks.findFirst({
    where: and(eq(studyDecks.learnerId, learnerId), eq(studyDecks.name, pack.name)),
  });
  if (!list) {
    [list] = await db
      .insert(studyDecks)
      .values({ learnerId, name: pack.name })
      .returning();
  } else {
    await db.delete(studyDeckItems).where(eq(studyDeckItems.deckId, list.id));
  }
  await db.insert(studyDeckItems).values(
    orderedIds.map((vocabId, position) => ({
      deckId: list.id,
      vocabId,
      position,
    })),
  );

  return {
    added: fresh.length,
    list: pack.name,
    deckId: list.id,
    vocabIdsByTerm: Object.fromEntries(
      items
        .map((i) => [i.term.toLowerCase(), byTerm.get(i.term.toLowerCase())])
        .filter((pair): pair is [string, string] => !!pair[1]),
    ),
  };
}
