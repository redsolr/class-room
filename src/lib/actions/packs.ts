"use server";

import { revalidateDeck, revalidateWord } from "@/lib/study-revalidate";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  studyPackItems,
  studyPacks,
  studyVocab,
  studyDeckItems,
  studyDecks,
} from "@/db";
import { requireLearner } from "@/lib/auth";
import {
  importPackForLearner,
  type PackImportResult,
} from "@/lib/pack-import";
import { nextDeckPosition } from "@/lib/study-decks";
import { requireOwnDeck } from "@/lib/study-guards";

/**
 * Official books — copying our shipped content into a learner's own
 * vocabulary, one word or a whole pack at a time. The whole-pack copy
 * lives in `lib/pack-import.ts`, shared with the first-run fast-forward.
 */

// ---------------------------------------------------------------------------
// Curated packs — read-only shipped content; these actions COPY pack
// items into the learner's own vocabulary (dedup per language by term).
// ---------------------------------------------------------------------------

/**
 * Copy ONE pack item into the learner's vocabulary, optionally filing it
 * into a book at the same time.
 *
 * The vocabulary is the "liked songs" layer and books are playlists: a
 * word lives in the vocabulary once and appears in any number of books.
 * So an already-saved word is NOT a no-op when a book is named — it was
 * possibly added from another pack or by hand, and filing it still has
 * to work. Only the vocabulary insert is conditional.
 */
export async function addStudyPackItem(
  itemId: string,
  target?: { deckId?: string; newListName?: string },
): Promise<{
  added: boolean;
  vocabId: string;
  deckId: string | null;
  listName: string | null;
}> {
  const learner = await requireLearner();
  const id = z.string().uuid().parse(itemId);

  const [row] = await db
    .select({ item: studyPackItems, language: studyPacks.language })
    .from(studyPackItems)
    .innerJoin(studyPacks, eq(studyPackItems.packId, studyPacks.id))
    .where(eq(studyPackItems.id, id));
  if (!row) throw new Error("Pack item not found");

  // Same dedup key the pack page's ✓ is computed from: language + the
  // lowercased term.
  const existing = await db
    .select({ id: studyVocab.id })
    .from(studyVocab)
    .where(
      and(
        eq(studyVocab.learnerId, learner.id),
        eq(studyVocab.language, row.language),
        sql`lower(${studyVocab.term}) = ${row.item.term.toLowerCase()}`,
      ),
    )
    .limit(1);

  let vocabId = existing[0]?.id;
  const added = !vocabId;
  if (!vocabId) {
    const [created] = await db
      .insert(studyVocab)
      .values({
        learnerId: learner.id,
        language: row.language,
        term: row.item.term,
        reading: row.item.reading,
        meaning: row.item.meaning,
        example: row.item.example,
        category: row.item.category,
      })
      .returning({ id: studyVocab.id });
    vocabId = created.id;
  }

  let deckId: string | null = null;
  let listName: string | null = null;
  // No explicit target = the one-tap save. It always joins the
  // vocabulary; it ALSO files into the learner's default book when they
  // have set one, which is the whole point of having a default.
  if (target === undefined) {
    const fallback = await db.query.studyDecks.findFirst({
      where: and(
        eq(studyDecks.learnerId, learner.id),
        eq(studyDecks.isDefault, true),
      ),
      columns: { id: true, name: true },
    });
    if (fallback) target = { deckId: fallback.id };
  }
  if (target?.newListName !== undefined) {
    const name = z.string().trim().min(1).max(120).parse(target.newListName);
    const [list] = await db
      .insert(studyDecks)
      .values({ learnerId: learner.id, name })
      .returning();
    await db.insert(studyDeckItems).values({
      deckId: list.id,
      vocabId,
      position: await nextDeckPosition(list.id),
    });
    deckId = list.id;
    listName = list.name;
  } else if (target?.deckId) {
    const list = await requireOwnDeck(learner.id, target.deckId);
    await db
      .insert(studyDeckItems)
      .values({
        deckId: list.id,
        vocabId,
        position: await nextDeckPosition(list.id),
      })
      .onConflictDoNothing(); // already filed here = no-op
    deckId = list.id;
    listName = list.name;
  }

  revalidateWord();
  return { added, vocabId, deckId, listName };
}

/**
 * Copy the WHOLE pack: every not-yet-saved item joins the learner's
 * vocabulary, and a personal deck named after the pack is created (or
 * refreshed) carrying the pack's curated order. The learner's deck is
 * theirs afterwards — reorder, prune, extend freely.
 *
 * The copy itself lives in `lib/pack-import.ts`, shared with the
 * first-run fast-forward, which imports a book the same way and then
 * schedules the words the learner claimed.
 */
export async function importStudyPack(
  packId: string,
): Promise<PackImportResult> {
  const learner = await requireLearner();
  const id = z.string().uuid().parse(packId);

  const result = await importPackForLearner(learner.id, id);

  // An import makes a DECK and fills it with words — both moved.
  revalidateDeck(result.deckId);
  revalidateWord();
  // The pack page keeps its saved-state in React state, so hand back the
  // ids it needs to reflect the import without a reload (a reload would
  // also throw away the confirmation banner it just earned).
  return result;
}
