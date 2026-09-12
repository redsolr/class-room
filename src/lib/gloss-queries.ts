import { and, eq, inArray } from "drizzle-orm";
import { db, studyPackItems, studyPacks, studyVocab } from "@/db";
import type { GlossEntry } from "@/lib/gloss";

/**
 * The glossary a sentence can be glossed against, per language: the
 * learner's OWN words first (their meaning, their reading — the card
 * they will actually meet), then every official book in that language.
 * Dedup by lowercased term, learner's row winning.
 *
 * Loaded once per page for the languages actually on it, never per
 * card: a sentence session deals fifty cards and the glossary for a
 * language is a few hundred rows.
 */
export type GlossaryByLanguage = Record<string, GlossEntry[]>;

export async function loadGlossary(
  learnerId: string,
  languages: string[],
): Promise<GlossaryByLanguage> {
  const wanted = [...new Set(languages.filter(Boolean))];
  if (wanted.length === 0) return {};

  const [own, official] = await Promise.all([
    db
      .select({
        language: studyVocab.language,
        term: studyVocab.term,
        reading: studyVocab.reading,
        meaning: studyVocab.meaning,
      })
      .from(studyVocab)
      .where(
        and(eq(studyVocab.learnerId, learnerId), inArray(studyVocab.language, wanted)),
      ),
    db
      .select({
        language: studyPacks.language,
        term: studyPackItems.term,
        reading: studyPackItems.reading,
        meaning: studyPackItems.meaning,
      })
      .from(studyPackItems)
      .innerJoin(studyPacks, eq(studyPackItems.packId, studyPacks.id))
      .where(inArray(studyPacks.language, wanted)),
  ]);

  const result: GlossaryByLanguage = {};
  const seen = new Map<string, Set<string>>();
  const add = (row: { language: string } & GlossEntry) => {
    const key = row.term.trim().toLowerCase();
    if (!key) return;
    const set = seen.get(row.language) ?? new Set<string>();
    if (set.has(key)) return;
    set.add(key);
    seen.set(row.language, set);
    (result[row.language] ??= []).push({
      term: row.term,
      reading: row.reading,
      meaning: row.meaning,
    });
  };
  own.forEach(add);
  official.forEach(add);
  return result;
}
