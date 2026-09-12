/**
 * CONTENT INGEST — open datasets → `content_*` tables → level books and
 * level paths (2026-09-12).
 *
 *   npm run content:ingest            (local; .env.local)
 *   runs in `vercel-build` after the catalog seeds, so a deploy carries
 *   the same content everywhere — the vendored sources in
 *   `content/sources/` are the input, Neon is the output.
 *
 * Three passes, each idempotent:
 *
 *   1. VOCABULARY — `content_vocab`, upsert on (language, term, reading).
 *      JLPT N5/N4 from the tanos-derived CSVs (they carry meanings);
 *      CEFR A1/A2 from the CEFR-J profile (headword + pos + level, NO
 *      meaning — meanings come from `content/sources/overrides.json`,
 *      where `scripts/content/gloss-en.ts` writes model-drafted
 *      definition·Thai pairs once, checked in, reviewed by hand).
 *      Frequency ranks joined from the Leeds (JA) and NGSL (EN) lists.
 *
 *   2. LEVEL BOOKS — one `study_packs` row per unit of `UNIT_SIZE` words
 *      in frequency order (unranked words last), `source = 'content'`,
 *      items replaced wholesale. Slugs are stable (`lib/levels.ts`), so
 *      a learner's imported deck keeps its name across re-ingests.
 *
 *   3. LEVEL PATHS — one `study_paths` row per level: for every unit a
 *      pack step (learn it) and a sentences step (drill it in context),
 *      with a chat step every four units and a lesson step every eight,
 *      so the tree keeps its three limbs. Steps are replaced wholesale;
 *      progress is derived from evidence, never stored on steps, so that
 *      is safe (see study-paths.ts).
 *
 * Grammar points (`content_grammar_points`) are loaded from
 * `content/sources/jlpt-grammar.json` (authored) and the CEFR-J grammar
 * profile; they do not yet feed the path — the GRAMMAR limb still reads
 * cloze evidence (FEATURES.md residual). That is the next slice.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  contentGrammarPoints,
  contentVocab,
  db,
  studyPackItems,
  studyPacks,
  studyPathSteps,
  studyPaths,
} from "../../src/db";
import { levelByCode, UNIT_SIZE, unitName, unitSlug } from "../../src/lib/levels";

const SOURCES = join(process.cwd(), "content", "sources");
const read = (name: string) => readFileSync(join(SOURCES, name), "utf8");

// ── tiny CSV reader (quoted fields, commas inside quotes) ───────────────
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((f) => f !== "")) rows.push(row);
  }
  return rows;
}

type VocabRow = {
  language: string;
  term: string;
  reading: string | null;
  meaning: string | null;
  pos: string | null;
  level: string;
  source: string;
};

// ── overrides: hand fixes + generated English glosses ───────────────────
type Overrides = {
  /** key `${language}|${term}` → fields to force. */
  vocab?: Record<string, { meaning?: string; reading?: string; skip?: boolean }>;
};
function loadOverrides(): Overrides {
  const p = join(SOURCES, "overrides.json");
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Overrides) : {};
}

// ── 1a. JLPT vocabulary ─────────────────────────────────────────────────
function jlptRows(level: "N5" | "N4"): VocabRow[] {
  const file = `jlpt-${level.toLowerCase()}-vocab.csv`;
  const [header, ...rows] = parseCsv(read(file));
  const col = (name: string) => header.indexOf(name);
  const iTerm = col("expression");
  const iReading = col("reading");
  const iMeaning = col("meaning");
  return rows.map((r) => {
    const term = r[iTerm]?.trim() ?? "";
    const reading = r[iReading]?.trim() || null;
    return {
      language: "Japanese",
      term,
      // Kana-only words repeat the term as the reading in the source;
      // an identical reading says nothing, so it is dropped.
      reading: reading && reading !== term ? reading : null,
      meaning: r[iMeaning]?.trim() || null,
      pos: null,
      level,
      source: file,
    };
  });
}

// ── 1b. CEFR-J vocabulary ───────────────────────────────────────────────
function cefrRows(): VocabRow[] {
  const file = "cefrj-vocabulary-profile-1.5.csv";
  const [header, ...rows] = parseCsv(read(file));
  const iWord = header.indexOf("headword");
  const iPos = header.indexOf("pos");
  const iLevel = header.indexOf("CEFR");
  return rows
    .filter((r) => r[iLevel] === "A1" || r[iLevel] === "A2")
    .map((r) => ({
      language: "English",
      // "a.m./A.M./am/AM" — the first spelling is the headword.
      term: (r[iWord] ?? "").split("/")[0].trim(),
      reading: null,
      meaning: null,
      pos: r[iPos]?.trim() || null,
      level: r[iLevel],
      source: file,
    }))
    .filter((r) => r.term.length > 0);
}

// ── frequency ranks ─────────────────────────────────────────────────────
function leedsJapaneseRanks(): Map<string, number> {
  const ranks = new Map<string, number>();
  read("leeds-internet-jp-top20k.txt")
    .split(/\r?\n/)
    .forEach((w, i) => {
      const word = w.trim();
      if (word && !ranks.has(word)) ranks.set(word, i + 1);
    });
  return ranks;
}
function ngslEnglishRanks(): Map<string, number> {
  const [header, ...rows] = parseCsv(read("ngsl-1.2-stats.csv"));
  const iLemma = header.indexOf("Lemma");
  const iRank = header.indexOf("SFI Rank");
  const ranks = new Map<string, number>();
  for (const r of rows) {
    const lemma = (r[iLemma] ?? "").trim().toLowerCase();
    const rank = Number(r[iRank]);
    if (lemma && Number.isFinite(rank) && !ranks.has(lemma)) ranks.set(lemma, rank);
  }
  return ranks;
}

async function ingestVocabulary(): Promise<void> {
  const overrides = loadOverrides().vocab ?? {};
  const ja = leedsJapaneseRanks();
  const en = ngslEnglishRanks();

  const all = [...jlptRows("N5"), ...jlptRows("N4"), ...cefrRows()];
  // Dedup within the input on the same key the unique index uses; a
  // word in both N5 and N4 lists keeps its LOWER level (it is learned
  // first).
  const byKey = new Map<string, VocabRow & { frequencyRank: number | null }>();
  for (const row of all) {
    const o = overrides[`${row.language}|${row.term}`];
    if (o?.skip) continue;
    const merged = {
      ...row,
      meaning: o?.meaning ?? row.meaning,
      reading: o?.reading ?? row.reading,
      frequencyRank:
        row.language === "Japanese"
          ? (ja.get(row.term) ?? (row.reading ? ja.get(row.reading) : undefined) ?? null)
          : (en.get(row.term.toLowerCase()) ?? null),
    };
    const key = `${row.language}|${row.term}|${row.reading ?? ""}`;
    const existing = byKey.get(key);
    if (!existing || levelRank(merged.level) < levelRank(existing.level)) {
      byKey.set(key, merged);
    }
  }

  const rows = [...byKey.values()];
  // Raw upsert: the unique index is on an EXPRESSION
  // (coalesce(reading, '')) and drizzle's onConflictDoUpdate only takes
  // columns as its target. json_populate_recordset keeps it one
  // statement per chunk.
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500).map((r) => ({
      language: r.language,
      term: r.term,
      reading: r.reading,
      meaning: r.meaning,
      pos: r.pos,
      level: r.level,
      frequency_rank: r.frequencyRank,
      source: r.source,
    }));
    await db.execute(sql`
      insert into content_vocab (language, term, reading, meaning, pos, level, frequency_rank, source)
      select language, term, reading, meaning, pos, level, frequency_rank, source
      from json_populate_recordset(null::content_vocab, ${JSON.stringify(chunk)}::json)
      on conflict (language, term, coalesce(reading, '')) do update set
        meaning = excluded.meaning,
        pos = excluded.pos,
        level = excluded.level,
        frequency_rank = excluded.frequency_rank,
        source = excluded.source,
        updated_at = now()
    `);
  }
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.level] = (acc[r.level] ?? 0) + 1;
    return acc;
  }, {});
  const ranked = rows.filter((r) => r.frequencyRank !== null).length;
  console.log(
    `✓ content_vocab: ${rows.length} words (${Object.entries(counts)
      .map(([l, n]) => `${l} ${n}`)
      .join(" · ")}), ${ranked} with a frequency rank`,
  );
}

function levelRank(code: string): number {
  return levelByCode(code)?.rank ?? 99;
}

// ── 2. level books ──────────────────────────────────────────────────────
async function buildLevelBooks(): Promise<Map<string, string[]>> {
  const levels = ["N5", "N4", "A1", "A2"];
  const slugsByLevel = new Map<string, string[]>();
  for (const level of levels) {
    const meta = levelByCode(level);
    if (!meta) continue;
    const words = await db
      .select()
      .from(contentVocab)
      .where(and(eq(contentVocab.language, meta.language), eq(contentVocab.level, level)))
      // Frequency order; unranked words last, then alphabetical so the
      // order is stable between runs.
      .orderBy(
        sql`${contentVocab.frequencyRank} asc nulls last`,
        contentVocab.term,
      );
    // A word with no meaning cannot be a card — it is skipped here (and
    // counted) rather than shipped as a blank. And one TERM per book:
    // 私 is listed as わたし and わたくし in the source, and a pack item is
    // unique per term, so the readings merge onto one card.
    const byTerm = new Map<string, (typeof words)[number]>();
    for (const w of words) {
      if (!w.meaning || w.meaning.trim().length === 0) continue;
      const existing = byTerm.get(w.term);
      if (!existing) byTerm.set(w.term, { ...w });
      else if (w.reading && existing.reading && !existing.reading.includes(w.reading)) {
        existing.reading = `${existing.reading} / ${w.reading}`;
      } else if (w.reading && !existing.reading) existing.reading = w.reading;
    }
    const usable = [...byTerm.values()];
    const units = Math.ceil(usable.length / UNIT_SIZE);
    const slugs: string[] = [];
    for (let u = 0; u < units; u++) {
      const unit = u + 1;
      const slice = usable.slice(u * UNIT_SIZE, (u + 1) * UNIT_SIZE);
      const slug = unitSlug(level, unit);
      const first = slice[0]?.term ?? "";
      const last = slice[slice.length - 1]?.term ?? "";
      const description =
        `${meta.label} vocabulary, unit ${unit} of ${units} — ${slice.length} words in frequency order, from ${first} to ${last}.`;
      const [pack] = await db
        .insert(studyPacks)
        .values({
          slug,
          name: unitName(level, unit),
          language: meta.language,
          theme: null,
          description,
          source: "content",
          level,
          unit,
        })
        .onConflictDoUpdate({
          target: studyPacks.slug,
          set: {
            name: unitName(level, unit),
            language: meta.language,
            description,
            source: "content",
            level,
            unit,
            updatedAt: new Date(),
          },
        })
        .returning({ id: studyPacks.id });
      await db.delete(studyPackItems).where(eq(studyPackItems.packId, pack.id));
      await db.insert(studyPackItems).values(
        slice.map((w, position) => ({
          packId: pack.id,
          term: w.term,
          reading: w.reading,
          meaning: w.meaning,
          example: null,
          category: posToCategory(w.pos),
          position,
        })),
      );
      slugs.push(slug);
    }
    // Units that no longer exist (the level shrank) are removed, and
    // with them their steps via the path rebuild below.
    const stale = await db
      .select({ id: studyPacks.id, slug: studyPacks.slug })
      .from(studyPacks)
      .where(and(eq(studyPacks.source, "content"), eq(studyPacks.level, level)));
    const gone = stale.filter((p) => !slugs.includes(p.slug));
    if (gone.length > 0) {
      await db.delete(studyPacks).where(inArray(studyPacks.id, gone.map((p) => p.id)));
    }
    console.log(
      `✓ ${meta.label}: ${units} units from ${usable.length} words` +
        (usable.length < words.length ? ` (${words.length - usable.length} without a meaning skipped)` : ""),
    );
    slugsByLevel.set(level, slugs);
  }
  return slugsByLevel;
}

function posToCategory(pos: string | null): string | null {
  if (!pos) return null;
  const p = pos.toLowerCase();
  if (p.includes("verb")) return "Verb";
  if (p.includes("noun")) return "Noun";
  if (p.includes("adjective")) return "Adjective";
  if (p.includes("adverb")) return "Adverb";
  return "Other";
}

// ── 3. level paths ──────────────────────────────────────────────────────
async function buildLevelPaths(slugsByLevel: Map<string, string[]>): Promise<void> {
  for (const [level, slugs] of slugsByLevel) {
    const meta = levelByCode(level)!;
    if (slugs.length === 0) continue;
    const pathSlug = `${meta.ladder}-${level.toLowerCase()}`;
    const name = `${meta.label} from zero`;
    const description =
      meta.ladder === "jlpt"
        ? `Every ${meta.label} word in the order you will actually meet it, each unit learned and then drilled in sentences, with someone to say them to along the way.`
        : `Every ${meta.label} word in the order you will actually meet it, each unit learned and then drilled in sentences, with someone to say them to along the way.`;
    const [path] = await db
      .insert(studyPaths)
      .values({
        slug: pathSlug,
        name,
        language: meta.language,
        description,
        position: 100 + meta.rank,
        source: "content",
        level,
      })
      .onConflictDoUpdate({
        target: studyPaths.slug,
        set: { name, description, position: 100 + meta.rank, source: "content", level, updatedAt: new Date() },
      })
      .returning({ id: studyPaths.id });

    // Pack sizes, for honest targets.
    const sizes = new Map<string, number>();
    const packRows = await db
      .select({ slug: studyPacks.slug, id: studyPacks.id })
      .from(studyPacks)
      .where(inArray(studyPacks.slug, slugs));
    for (const p of packRows) {
      const [{ n }] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(studyPackItems)
        .where(eq(studyPackItems.packId, p.id));
      sizes.set(p.slug, n);
    }

    type Step = { kind: "pack" | "sentences" | "chat" | "lesson"; title: string; detail: string; packSlug?: string; target: number };
    const steps: Step[] = [];
    let chats = 0;
    let lessons = 0;
    slugs.forEach((slug, i) => {
      const unit = i + 1;
      const size = sizes.get(slug) ?? UNIT_SIZE;
      steps.push({
        kind: "pack",
        title: `Unit ${unit}: learn the words`,
        detail: `${size} ${meta.label} words in the order you will meet them. One sitting.`,
        packSlug: slug,
        target: size,
      });
      steps.push({
        kind: "sentences",
        title: `Unit ${unit}: use them in sentences`,
        detail: "Recognising a word is not knowing it. Cloze cards ask whether you can still supply it when a sentence needs it.",
        packSlug: slug,
        target: Math.max(1, Math.ceil(size / 2)),
      });
      if (unit % 4 === 0) {
        chats += 1;
        steps.push({
          kind: "chat",
          title: chats === 1 ? "Say something, badly" : `Keep talking (${chats * 10} messages)`,
          detail: "Messages to the tutor using the words from the last four units. The point is to say them, not to be right.",
          target: chats * 10,
        });
      }
      if (unit % 8 === 0) {
        lessons += 1;
        steps.push({
          kind: "lesson",
          title: lessons === 1 ? "Say it to a person" : `Lesson ${lessons}`,
          detail: "Book a lesson and use what the last eight units taught you with a human being.",
          target: lessons,
        });
      }
    });

    await db.delete(studyPathSteps).where(eq(studyPathSteps.pathId, path.id));
    await db.insert(studyPathSteps).values(
      steps.map((s, position) => ({ pathId: path.id, position, ...s })),
    );
    console.log(`✓ path ${pathSlug}: ${steps.length} steps`);
  }
}

// ── grammar points ──────────────────────────────────────────────────────
type AuthoredGrammar = {
  language: string;
  level: string;
  pattern: string;
  meaning: string;
  explanation?: string;
  examples?: { text: string; translation: string }[];
};
async function ingestGrammar(): Promise<void> {
  const rows: (AuthoredGrammar & { position: number; source: string; draft: boolean })[] = [];
  const authored = join(SOURCES, "jlpt-grammar.json");
  if (existsSync(authored)) {
    const list = JSON.parse(readFileSync(authored, "utf8")) as AuthoredGrammar[];
    const perLevel = new Map<string, number>();
    for (const g of list) {
      const n = perLevel.get(g.level) ?? 0;
      perLevel.set(g.level, n + 1);
      rows.push({ ...g, position: n, source: "jlpt-grammar.json", draft: true });
    }
  }
  // CEFR-J grammar profile: the item and its CEFR-J level. Only A1/A2,
  // only rows that carry a level.
  const [header, ...csv] = parseCsv(read("cefrj-grammar-profile-20180315.csv"));
  const iItem = header.indexOf("Grammatical Item");
  const iLevel = header.indexOf("CEFR-J Level");
  const iType = header.indexOf("Sentence Type");
  const seen = new Set<string>();
  let pos = 0;
  for (const r of csv) {
    const raw = (r[iLevel] ?? "").trim();
    const level = raw.startsWith("A1") ? "A1" : raw.startsWith("A2") ? "A2" : null;
    const pattern = (r[iItem] ?? "").trim();
    if (!level || !pattern || seen.has(pattern)) continue;
    seen.add(pattern);
    rows.push({
      language: "English",
      level,
      pattern,
      meaning: (r[iType] ?? "").trim() || "",
      position: pos++,
      source: "cefrj-grammar-profile-20180315.csv",
      draft: true,
    });
  }
  if (rows.length === 0) return;
  const now = new Date();
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    await db
      .insert(contentGrammarPoints)
      .values(
        chunk.map((g) => ({
          language: g.language,
          level: g.level,
          position: g.position,
          pattern: g.pattern,
          meaning: g.meaning || null,
          explanation: g.explanation ?? null,
          examples: g.examples ?? null,
          draft: g.draft,
          source: g.source,
          updatedAt: now,
        })),
      )
      .onConflictDoUpdate({
        target: [contentGrammarPoints.language, contentGrammarPoints.pattern],
        set: {
          level: sql`excluded.level`,
          position: sql`excluded.position`,
          meaning: sql`excluded.meaning`,
          explanation: sql`excluded.explanation`,
          examples: sql`excluded.examples`,
          source: sql`excluded.source`,
          updatedAt: now,
        },
      });
  }
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.level] = (acc[r.level] ?? 0) + 1;
    return acc;
  }, {});
  console.log(
    `✓ content_grammar_points: ${rows.length} (${Object.entries(counts)
      .map(([l, n]) => `${l} ${n}`)
      .join(" · ")})`,
  );
}

async function main() {
  await ingestVocabulary();
  const slugs = await buildLevelBooks();
  await buildLevelPaths(slugs);
  await ingestGrammar();
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("content ingest failed", error);
  process.exit(1);
});
