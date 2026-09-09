import { srsReviewPatch, type SrsReviewPatch } from "@/lib/srs";

/**
 * THE FAST-FORWARD — "skip what you know", offered once, on the first
 * visit. Pure rules only; the actions in `actions/fast-forward.ts` and
 * the client in `components/study/fast-forward.tsx` both read from here
 * so the stopping rules cannot drift between what the screen does and
 * what the test asserts.
 *
 * What it is NOT: a placement test. It prints no level, stores no
 * verdict, and writes no evidence. A learner walks the catalog's words
 * in path order and says "I know it" or "not yet"; a claim only
 * SCHEDULES the card — it comes back in a few days, and the first real
 * graded answer is the day it returns. Until then the word is
 * `learning`, counts nowhere on Progress, and lights no node on the
 * tree. Coverage is checkable; proficiency is a guess (FEATURES.md, the
 * "no AI-asserted levels" cut), and a self-report is a guess too.
 */

export type FastForwardItem = {
  id: string;
  term: string;
  reading: string | null;
  meaning: string;
};

export type FastForwardBook = {
  packId: string;
  slug: string;
  name: string;
  /** Words the learner has NOT already saved — a saved word is not asked. */
  items: FastForwardItem[];
};

/**
 * A book stops early once enough of it is unknown. Six answers before
 * judging: three misses in a row on a book of eighteen is a bad start,
 * not a verdict. Past that, seventy percent unknown means the book is
 * ahead of the learner, and every further card is a small humiliation
 * that teaches nothing — the rest of the book is left unasked and the
 * words are ready in the deck instead.
 */
export const MIN_ANSWERS_BEFORE_STOP = 6;
export const STOP_UNKNOWN_SHARE = 0.7;

/**
 * Two books in a row stopping early is the catalog saying "you are at
 * the start" — the fast-forward finishes rather than walking a beginner
 * through four more books of no.
 */
export const EARLY_STOPS_TO_FINISH = 2;

export function shouldStopBook(asked: number, unknown: number): boolean {
  if (asked < MIN_ANSWERS_BEFORE_STOP) return false;
  return unknown / asked >= STOP_UNKNOWN_SHARE;
}

export function shouldFinish(consecutiveEarlyStops: number): boolean {
  return consecutiveEarlyStops >= EARLY_STOPS_TO_FINISH;
}

/**
 * Books are asked in PATH order — the order the learner would meet them
 * anyway — then any book the path does not mention, by name. A book
 * with nothing left to ask (every word already saved) is dropped, so a
 * learner who imported one book by hand is not asked it again.
 */
export function orderBooksForFastForward<T extends { slug: string; name: string; items: unknown[] }>(
  books: T[],
  pathPackSlugs: string[],
): T[] {
  const rank = new Map<string, number>();
  for (const slug of pathPackSlugs) {
    if (!rank.has(slug)) rank.set(slug, rank.size);
  }
  return books
    .filter((b) => b.items.length > 0)
    .sort((a, b) => {
      const ra = rank.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
      const rb = rank.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
      return ra - rb || a.name.localeCompare(b.name);
    });
}

/**
 * The schedule a claimed word gets: exactly what a first "easy" grade
 * would give it (four days), computed by the one scheduler the whole app
 * uses — so the claim can never be more generous than an answer. What
 * it deliberately does NOT carry is `lastReviewedAt`: a claim is not a
 * review, and nothing that reads "last reviewed" should count it.
 */
export function claimedSchedule(
  now: Date,
): Omit<SrsReviewPatch, "lastReviewedAt"> {
  const patch = srsReviewPatch(
    { reps: 0, easeFactor: 2.5, intervalDays: 0 },
    "easy",
    now,
  );
  return {
    srsReps: patch.srsReps,
    srsEaseFactor: patch.srsEaseFactor,
    srsIntervalDays: patch.srsIntervalDays,
    srsDueAt: patch.srsDueAt,
    status: patch.status,
  };
}

/** When claimed words come back for confirmation. */
export function confirmationDate(now: Date): Date {
  return claimedSchedule(now).srsDueAt;
}
