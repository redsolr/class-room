import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import postgres from "postgres";

/**
 * ROLES DRIVE THE SHELL (2026-09-12).
 *
 * One login, additive roles: everyone is a learner; a person may also
 * teach (opt-in) and may also be somebody's claimed student. The claim
 * under test is that the UI shows exactly the sections a person HAS —
 * a learner who came to study never sees a tutor's desk, and a student
 * sees their classroom without being made a teacher on the way in. The
 * old default did both: every unknown login became a teacher.
 *
 * The mocked tier signs in as one fixed identity, so the roles are
 * chosen per test through the `mock-roles` cookie the resolver honours
 * in mock mode (never on a production build). The opt-in itself
 * ("Start teaching" creating the role for a real login) is proven by the
 * real-auth tier, where the synthetic WorkOS user starts as a learner.
 */

const ROSTER_STUDENT = "E2E Roles Student";
const MOCK_EMAIL = "teacher@class-room.dev";

function sql() {
  return postgres(
    process.env.DATABASE_URL ??
      "postgresql://classroom:classroom@localhost:5439/classroom",
    { max: 1 },
  );
}

async function setRoles(context: BrowserContext, roles: string): Promise<void> {
  await context.clearCookies({ name: "mock-roles" });
  await context.addCookies([
    { name: "mock-roles", value: roles, domain: "localhost", path: "/" },
  ]);
}

/** The sidebar's Teaching cluster, by the one row only teachers have. */
function teachingNav(page: Page) {
  return page.locator("aside, nav").getByRole("link", { name: "Students" });
}

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  const db = sql();
  try {
    await db`delete from students where name = ${ROSTER_STUDENT}`;
  } finally {
    await db.end();
  }
});

test("a learner who only came to study sees only their study", async ({
  page,
  context,
}) => {
  await setRoles(context, "learner");

  // The landing page sends a learner to their study, not a tutor's desk.
  await page.goto("/");
  await page.waitForURL("**/home");

  // No teaching cluster, no classroom cluster — and one quiet offer.
  await expect(teachingNav(page)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "My classroom" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Learning path" })).toBeVisible();
  await expect(page.locator(".start-teaching")).toBeVisible();

  // The teacher surfaces do not silently make them a teacher: they are
  // offered the choice instead.
  await page.goto("/schedule");
  await page.waitForURL("**/teach");
  await expect(
    page.getByRole("heading", { name: "Start teaching" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Start teaching" })).toBeVisible();

  // And the student area, which they have no claim on, sends them home.
  await page.goto("/student");
  await page.waitForURL("**/home");
});

test("a claimed student gets their classroom, and is not made a teacher", async ({
  page,
  context,
}) => {
  // The teacher adds them to the roster by email — the same address the
  // mock login carries, so the first student-role resolution claims it.
  await setRoles(context, "teacher");
  await page.goto("/students");
  await page.getByRole("button", { name: "New student" }).click();
  await page.getByLabel("Name").fill(ROSTER_STUDENT);
  await page.getByLabel("Target language").fill("English");
  await page.getByLabel("Email").fill(MOCK_EMAIL);
  await page.getByRole("button", { name: "Create student" }).click();
  await page.waitForURL(/\/students\/[0-9a-f-]{36}/);

  await setRoles(context, "student");
  await page.goto("/");
  await page.waitForURL("**/student");

  await expect(page.getByRole("link", { name: "My classroom" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Teacher" })).toBeVisible();
  await expect(teachingNav(page)).toHaveCount(0);
  await expect(page.locator(".start-teaching")).toBeVisible();

  // Their own study is one section down in the SAME sidebar, not a
  // different product.
  await expect(page.getByRole("link", { name: "Learning path" })).toBeVisible();
  await page.goto("/schedule");
  await page.waitForURL("**/teach");
});

test("a person who teaches AND studies with someone sees both, with one inbox", async ({
  page,
  context,
}) => {
  await setRoles(context, "teacher,student");
  await page.goto("/");
  await page.waitForURL("**/schedule");

  await expect(teachingNav(page)).toBeVisible();
  await expect(page.getByRole("link", { name: "My classroom" })).toBeVisible();
  // Two sections, labelled, because now there is something to tell apart.
  await expect(page.locator(".nav-section-label", { hasText: "Teaching" })).toBeVisible();
  await expect(page.locator(".nav-section-label", { hasText: "My classroom" })).toBeVisible();
  // One Messages row: the inbox serves both roles.
  await expect(page.getByRole("link", { name: "Messages" })).toHaveCount(1);
  // Already a teacher — no offer to become one.
  await expect(page.locator(".start-teaching")).toHaveCount(0);
  // And /teach sends a teacher straight to their desk.
  await page.goto("/teach");
  await page.waitForURL("**/schedule");
});
