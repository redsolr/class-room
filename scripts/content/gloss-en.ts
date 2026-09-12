/**
 * ONE-OFF: draft learner glosses for the English level words.
 *
 * The CEFR-J profile gives headword + part of speech + level and NO
 * meaning, and a word card without a meaning is not a card. This asks
 * the study model for a short learner definition plus a Thai gloss per
 * word — the same shape the hand-written English books use — and writes
 * them into `content/sources/overrides.json`, which is CHECKED IN. The
 * ingest reads the file; deploys never call the model. Re-run only for
 * words still missing a meaning; edit the file by hand to correct one.
 *
 *   npm run content:gloss-en           (needs OPENAI_API_KEY in .env.local)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";
import { and, eq, isNull } from "drizzle-orm";
import { contentVocab, db } from "../../src/db";
import { STUDY_MODEL } from "../../src/lib/ai/study-tutor";

const FILE = join(process.cwd(), "content", "sources", "overrides.json");
const BATCH = 40;

type Overrides = {
  vocab?: Record<string, { meaning?: string; reading?: string; skip?: boolean }>;
};

const PROMPT = `You write flashcard glosses for Thai beginners learning English (CEFR A1–A2).

For each word you are given (with its part of speech), write ONE line of the form:
  <plain-English learner definition, at most 12 words> · <Thai gloss, 1–4 words>

Rules:
- The definition must be simpler than the word itself and never reuse the word.
- Give the meaning a beginner meets first; one sense only.
- Thai gloss: the everyday Thai word(s), no explanation, no transliteration.
- Keep the " · " separator exactly.`;

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
  const overrides: Overrides = existsSync(FILE)
    ? (JSON.parse(readFileSync(FILE, "utf8")) as Overrides)
    : {};
  overrides.vocab ??= {};

  const missing = await db
    .select({ term: contentVocab.term, pos: contentVocab.pos, level: contentVocab.level })
    .from(contentVocab)
    .where(and(eq(contentVocab.language, "English"), isNull(contentVocab.meaning)))
    .orderBy(contentVocab.level, contentVocab.term);
  const todo = missing.filter((w) => !overrides.vocab![`English|${w.term}`]?.meaning);
  console.log(`${todo.length} English words without a meaning`);

  const client = new OpenAI();
  for (let i = 0; i < todo.length; i += BATCH) {
    const chunk = todo.slice(i, i + BATCH);
    const response = await client.responses.create({
      model: STUDY_MODEL,
      max_output_tokens: 4000,
      instructions: PROMPT,
      input: chunk.map((w) => `${w.term} (${w.pos ?? "?"})`).join("\n"),
      text: {
        format: {
          type: "json_schema",
          name: "glosses",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["term", "gloss"],
                  properties: {
                    term: { type: "string" },
                    gloss: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    });
    const parsed = JSON.parse(response.output_text) as {
      items: { term: string; gloss: string }[];
    };
    const wanted = new Set(chunk.map((w) => w.term));
    let added = 0;
    for (const item of parsed.items) {
      if (!wanted.has(item.term)) continue;
      const gloss = item.gloss.trim();
      if (!gloss.includes("·")) continue;
      overrides.vocab![`English|${item.term}`] = {
        ...overrides.vocab![`English|${item.term}`],
        meaning: gloss,
      };
      added += 1;
    }
    writeFileSync(FILE, JSON.stringify(overrides, null, 2) + "\n");
    console.log(`  ${Math.min(i + BATCH, todo.length)}/${todo.length} (${added} written)`);
  }
  console.log(`✓ overrides written to ${FILE}`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("gloss-en failed", error);
  process.exit(1);
});
