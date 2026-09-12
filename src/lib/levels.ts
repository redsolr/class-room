/**
 * LEVELS — the ladders a learner climbs (2026-09-12).
 *
 * Japanese climbs the JLPT (N5 → N1); English climbs the CEFR (A1 → C2).
 * The founder's goal is "the only app that takes you from nothing to
 * N1"; the first slice ships N5–N4 and A1–A2, and the ladder below is
 * the whole thing so a later level is a content job, not a code change.
 *
 * A level is CONTENT (vocabulary tagged by level, grammar points, later
 * readings and tests), never a judgement about a person. The standing
 * cut stays: the app prints no asserted level. "You are N4" is a claim;
 * "you know 412 of the 667 N4 words and passed the N4 mock at 78%" is a
 * receipt, and only receipts get shown.
 */

export type LevelLadder = "jlpt" | "cefr";

export type Level = {
  code: string;
  ladder: LevelLadder;
  language: string;
  /** 0 = the first rung. */
  rank: number;
  label: string;
};

export const LEVELS: Level[] = [
  { code: "N5", ladder: "jlpt", language: "Japanese", rank: 0, label: "JLPT N5" },
  { code: "N4", ladder: "jlpt", language: "Japanese", rank: 1, label: "JLPT N4" },
  { code: "N3", ladder: "jlpt", language: "Japanese", rank: 2, label: "JLPT N3" },
  { code: "N2", ladder: "jlpt", language: "Japanese", rank: 3, label: "JLPT N2" },
  { code: "N1", ladder: "jlpt", language: "Japanese", rank: 4, label: "JLPT N1" },
  { code: "A1", ladder: "cefr", language: "English", rank: 0, label: "CEFR A1" },
  { code: "A2", ladder: "cefr", language: "English", rank: 1, label: "CEFR A2" },
  { code: "B1", ladder: "cefr", language: "English", rank: 2, label: "CEFR B1" },
  { code: "B2", ladder: "cefr", language: "English", rank: 3, label: "CEFR B2" },
  { code: "C1", ladder: "cefr", language: "English", rank: 4, label: "CEFR C1" },
  { code: "C2", ladder: "cefr", language: "English", rank: 5, label: "CEFR C2" },
];

/** The rungs that ship content today. Everything above is a content job. */
export const SHIPPED_LEVELS = new Set(["N5", "N4", "A1", "A2"]);

export function levelByCode(code: string): Level | undefined {
  return LEVELS.find((l) => l.code === code);
}

/**
 * Words per unit. A unit is one sitting's worth on the path — the same
 * size as the curated books, so a level reads as a shelf of small books
 * rather than one 700-word wall. N5 ≈ 29 units, N4 ≈ 27.
 */
export const UNIT_SIZE = 25;

/** `jlpt-n5-unit-03` — stable, so a learner's deck keeps its name across
 * re-ingests and the path steps keep pointing at the same book. */
export function unitSlug(level: string, unit: number): string {
  const ladder = levelByCode(level)?.ladder ?? "level";
  return `${ladder}-${level.toLowerCase()}-unit-${String(unit).padStart(2, "0")}`;
}

export function unitName(level: string, unit: number): string {
  return `${levelByCode(level)?.label ?? level} · Unit ${unit}`;
}
