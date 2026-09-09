import { expect, test } from "@playwright/test";
import postgres from "postgres";
import { resetMockLearner } from "./helpers";

/**
 * THE FAST-FORWARD — "skip what you know" on the first visit.
 *
 * The claim under test is the one that keeps this from being a placement
 * test in disguise: a claim SCHEDULES a card and writes NO evidence. So
 * beyond the screen working, this suite reads the database after a run
 * and checks that claimed words carry a four-day schedule, unclaimed
 * words are untouched, and `study_reviews` — the only source every
 * Progress number reads from — has not gained a single row.
 */

const MOCK_LEARNER = "mock_teacher_dev";
const FIRST_ENGLISH_BOOK = "Everyday English verbs";

function sql() {
  return postgres(
    process.env.DATABASE_URL ??
      "postgresql://classroom:classroom@localhost:5439/classroom",
    { max: 1 },
  );
}

type VocabRow = {
  term: string;
  status: string;
  srs_reps: number;
  srs_due_at: Date | null;
  last_reviewed_at: Date | null;
};

async function englishWords(): Promise<VocabRow[]> {
  const db = sql();
  try {
    return await db<VocabRow[]>`
      select v.term, v.status, v.srs_reps, v.srs_due_at, v.last_reviewed_at
      from study_vocab v join learners l on l.id = v.learner_id
      where l.workos_user_id = ${MOCK_LEARNER} and v.language = 'English'
    `;
  } finally {
    await db.end();
  }
}

async function reviewCount(): Promise<number> {
  const db = sql();
  try {
    const [row] = await db<{ n: number }[]>`
      select count(*)::int as n from study_reviews r
      join learners l on l.id = r.learner_id
      where l.workos_user_id = ${MOCK_LEARNER}
    `;
    return row.n;
  } finally {
    await db.end();
  }
}

async function deckNames(): Promise<string[]> {
  const db = sql();
  try {
    const rows = await db<{ name: string }[]>`
      select d.name from study_decks d join learners l on l.id = d.learner_id
      where l.workos_user_id = ${MOCK_LEARNER} order by d.name
    `;
    return rows.map((r) => r.name);
  } finally {
    await db.end();
  }
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await resetMockLearner();
});

test("a fresh account is offered the fast-forward, and a claim schedules without grading", async ({
  page,
}) => {
  await page.goto("/home");

  // Offered beside "Pick a language", per language we actually ship,
  // and it says how much there is to sort.
  const shelf = page.locator(".home-fast-forward");
  await expect(shelf).toBeVisible();
  const english = shelf.getByRole("link", { name: /Skip what you know · English/ });
  await expect(english).toContainText(/\d+ words to sort/);
  await english.click();
  await page.waitForURL(/\/fast-forward\?language=English/);

  await expect(
    page.getByRole("heading", { name: "Skip what you know" }),
  ).toBeVisible();

  // The first book asked is the first book on the English path.
  await expect(page.locator(".ff-book-chip")).toHaveText(FIRST_ENGLISH_BOOK);
  await expect(page.locator(".ff-progress")).toHaveText(/Book 1 of \d+ · 1 of 24/);

  // Three known, three not — below the stop threshold, so the book keeps
  // asking. The trail names the word you just answered WITH its meaning:
  // the answer goes past, it is never asked for.
  const firstTerm = await page.locator(".ff-term").textContent();
  await page.getByRole("button", { name: "I know it" }).click();
  await expect(page.locator(".ff-trail")).toContainText(firstTerm ?? "");
  await expect(page.locator(".ff-trail")).toContainText("—");
  await page.getByRole("button", { name: "I know it" }).click();
  await page.getByRole("button", { name: "I know it" }).click();
  await page.getByRole("button", { name: "Not yet" }).click();
  await page.getByRole("button", { name: "Not yet" }).click();
  await page.getByRole("button", { name: "Not yet" }).click();
  await expect(page.locator(".ff-progress")).toHaveText(/7 of 24/);

  // Stop — the learner's own end, which saves what was answered.
  await page.getByRole("button", { name: "Stop here" }).click();
  const done = page.locator(".ff-done");
  await expect(done).toBeVisible();
  await expect(done.locator(".ff-done-count")).toHaveText("3");
  // The receipt says what the claim IS: a return date, not a level.
  await expect(done).toContainText(/come back on/);
  await expect(done).toContainText(/Nothing counts today/);
  await expect(done.locator(".ff-receipt")).toContainText(
    `${FIRST_ENGLISH_BOOK}`,
  );
  await expect(done.locator(".ff-receipt")).toContainText("3 of 24 known");
  await expect(done.locator(".ff-receipt")).toContainText("stopped early");

  // THE DATABASE. The whole book became a deck (what the Official
  // page's import does); three words carry the four-day schedule; the
  // rest are untouched; and not one review was written.
  expect(await deckNames()).toEqual([FIRST_ENGLISH_BOOK]);
  const words = await englishWords();
  expect(words).toHaveLength(24);
  const claimed = words.filter((w) => w.srs_due_at !== null);
  expect(claimed).toHaveLength(3);
  const now = Date.now();
  for (const w of claimed) {
    expect(w.status).toBe("learning"); // NOT known — 4 days < the 7 "reviewing" needs
    expect(w.srs_reps).toBe(1);
    expect(w.last_reviewed_at).toBeNull(); // a claim is not a review
    const days = (w.srs_due_at!.getTime() - now) / 86_400_000;
    expect(days).toBeGreaterThan(3.9);
    expect(days).toBeLessThan(4.1);
  }
  for (const w of words.filter((w) => w.srs_due_at === null)) {
    expect(w.status).toBe("new");
    expect(w.srs_reps).toBe(0);
  }
  expect(await reviewCount()).toBe(0);

  // Progress agrees: nothing is known, because nothing came back yet.
  await page.goto("/progress");
  const knownTile = page.locator(".stat-tile", {
    hasText: "Words and sentences you know",
  });
  await expect(knownTile).toBeVisible();
  await expect(knownTile.locator("p").nth(1)).toHaveText("0");

  // And Home no longer offers it — a card has been scheduled.
  await page.goto("/home");
  await expect(page.locator(".home-fast-forward")).toHaveCount(0);
  // The path Home points at is the English one, now that English is
  // what the learner has.
  await expect(page.locator(".home-path")).toContainText("English from zero");
});

test("a book that is mostly unknown stops early, and two in a row end the fast-forward", async ({
  page,
}) => {
  // Reachable by URL after the tile is gone. The verbs book is fully
  // saved now, so it is not asked again; the next book on the path is.
  await page.goto("/fast-forward?language=English");
  await expect(page.locator(".ff-book-chip")).toHaveText(
    "Small talk in English",
  );

  // Six "not yet" in a row: the stop rule fires at six answers with
  // seventy percent unknown, and the book moves on without asking the
  // other twelve.
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: "Not yet" }).click();
  }
  await expect(page.locator(".ff-book-chip")).toHaveText(
    "English at the office",
  );
  await expect(page.locator(".ff-progress")).toHaveText(/1 of 24/);

  // A second early stop finishes the whole thing — the catalog is
  // saying "you are at the start", and it stops saying it.
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: "Not yet" }).click();
  }
  const done = page.locator(".ff-done");
  await expect(done).toBeVisible();
  await expect(done.locator(".ff-done-count")).toHaveText("0");
  await expect(done).toContainText("starts at the beginning");
  await expect(done.locator(".ff-receipt")).toHaveCount(2);

  // Both books are decks now — the words are ready to learn, not lost —
  // and still nothing was graded.
  expect(await deckNames()).toEqual([
    "English at the office",
    FIRST_ENGLISH_BOOK,
    "Small talk in English",
  ]);
  const words = await englishWords();
  expect(words).toHaveLength(24 + 18 + 24);
  expect(words.filter((w) => w.srs_due_at !== null)).toHaveLength(3);
  expect(await reviewCount()).toBe(0);
});
