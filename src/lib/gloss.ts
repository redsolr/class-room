/**
 * GLOSSING A SENTENCE — which words inside it the learner can tap.
 *
 * A sentence card tests ONE word (the blank). The rest of the sentence
 * is written by a model in the target language, and a beginner meets
 * three words they don't know before they reach the one being tested.
 * The founder's ask (2026-09-12): tap a word, see what it means.
 *
 * Pure: takes text and a glossary, returns segments. The glossary is
 * whatever the caller knows — the learner's own vocabulary plus the
 * official catalog in that language (`lib/gloss-queries.ts`). No model
 * and no dictionary: a word is glossable because the app already has
 * a meaning for it, and the meaning shown is the one the learner will
 * meet on its card.
 *
 * Matching is longest-term-first from left to right, case-insensitive.
 * Terms written in a script with word boundaries (Latin, Cyrillic, Thai
 * is spaceless but rarely a term here) must sit on a boundary — "art"
 * must not light up inside "start". CJK terms have no spaces and match
 * anywhere, which is also right: 魔晄 inside 魔晄炉 IS the word 魔晄.
 */

export type GlossEntry = {
  term: string;
  reading: string | null;
  meaning: string | null;
};

export type GlossSegment = {
  text: string;
  /** Present when this span is a glossable term. */
  entry?: GlossEntry;
};

const LETTER = /\p{L}|\p{N}/u;

function isBoundaryScript(term: string): boolean {
  // A term that starts or ends with a Latin/Cyrillic/etc. letter needs
  // word boundaries; a CJK/kana term does not.
  const first = term[0];
  const last = term[term.length - 1];
  return /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}]/u.test(first + last);
}

function boundaryOk(text: string, start: number, end: number): boolean {
  const before = start > 0 ? text[start - 1] : "";
  const after = end < text.length ? text[end] : "";
  return !(before && LETTER.test(before)) && !(after && LETTER.test(after));
}

/**
 * Split `text` into plain and glossable segments. Adjacent plain runs are
 * merged so the caller renders as few nodes as possible.
 */
export function segmentWithGlossary(
  text: string,
  glossary: GlossEntry[],
): GlossSegment[] {
  if (!text || glossary.length === 0) return [{ text }];

  // Longest first so "pull request" wins over "request"; the fold is
  // computed once, not per position.
  const candidates = glossary
    .filter((g) => g.term.trim().length >= (isBoundaryScript(g.term) ? 2 : 1))
    .map((g) => ({ entry: g, key: g.term.toLowerCase(), boundary: isBoundaryScript(g.term) }))
    .sort((a, b) => b.key.length - a.key.length);
  if (candidates.length === 0) return [{ text }];

  const lower = text.toLowerCase();
  const out: GlossSegment[] = [];
  let plainStart = 0;
  let i = 0;
  while (i < text.length) {
    let hit: (typeof candidates)[number] | null = null;
    for (const c of candidates) {
      if (!lower.startsWith(c.key, i)) continue;
      if (c.boundary && !boundaryOk(text, i, i + c.key.length)) continue;
      hit = c;
      break;
    }
    if (!hit) {
      i += 1;
      continue;
    }
    if (i > plainStart) out.push({ text: text.slice(plainStart, i) });
    out.push({ text: text.slice(i, i + hit.key.length), entry: hit.entry });
    i += hit.key.length;
    plainStart = i;
  }
  if (plainStart < text.length) out.push({ text: text.slice(plainStart) });
  return out;
}
