import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNull, sql } from "drizzle-orm";
import { withAuth } from "@workos-inc/authkit-nextjs";
import {
  db,
  learners,
  students,
  teachers,
  type Learner,
  type Student,
  type Teacher,
} from "@/db";
import { generateAccessToken } from "@/lib/tokens";
import { MOCK_AUTH_ENABLED } from "@/lib/mock-auth";

// Never read process.env.MOCK_AUTH directly — the shared seam welds the
// hatch shut on production builds (see mock-auth.ts).
const MOCK_AUTH = MOCK_AUTH_ENABLED;

const SESSION_COOKIE = process.env.WORKOS_COOKIE_NAME ?? "wos-session";

/**
 * Where to send a request whose access token failed to resolve. If a
 * session cookie still exists this is almost always a refresh race (the
 * token expired between the proxy's refresh and this render — classic on
 * link prefetches), NOT a logout: bounce through /auth/refresh, which is
 * allowed to write cookies, instead of dumping a signed-in teacher on
 * /login.
 */
async function unauthenticatedRedirect(): Promise<never> {
  const cookieStore = await cookies();
  if (!cookieStore.has(SESSION_COOKIE)) redirect("/login");

  const url = (await headers()).get("x-url");
  let next = "/schedule";
  if (url) {
    try {
      const parsed = new URL(url);
      next = parsed.pathname + parsed.search;
    } catch {
      // unparsable header — keep the default
    }
  }
  redirect(`/auth/refresh?next=${encodeURIComponent(next)}`);
}

const MOCK_TEACHER = {
  workosUserId: "mock_teacher_dev",
  email: "teacher@class-room.dev",
  name: "Demo Teacher",
};

/**
 * The MOCK teacher — the one place a teacher row is still created by
 * resolution rather than by "Start teaching". `dev:mock` and the e2e
 * suite sign in as a teacher, so the row is ensured AND stamped with the
 * role; a row the harness inserted by hand (no `teaching_since`) is
 * stamped too, otherwise every teacher page would bounce to /teach.
 */
async function ensureMockTeacher(): Promise<Teacher> {
  const now = new Date();
  const [row] = await db
    .insert(teachers)
    .values({ ...MOCK_TEACHER, teachingSince: now })
    .onConflictDoUpdate({
      target: teachers.workosUserId,
      set: {
        email: MOCK_TEACHER.email,
        // `now()` in SQL, not the JS Date: inside a raw `sql` fragment
        // postgres-js cannot infer the parameter's type and the upsert
        // fails with "could not determine data type".
        teachingSince: sql`coalesce(${teachers.teachingSince}, now())`,
        updatedAt: now,
      },
    })
    .returning();
  return row;
}

// ---------------------------------------------------------------------------
// Roles — one login, ADDITIVE roles (2026-09-12).
//
// Every login is a LEARNER (the self-study space; row created on first
// touch, below). On top of that a login may also be:
//
//   TEACHER — opt-in only. `teachers.teaching_since` is the role; a row
//             without it carries nothing. Set by `startTeaching()`.
//             Until 2026-09-12 any unknown login became a teacher, which
//             put the tutor's dashboard in front of a person who came to
//             study — and "an existing teacher row always wins" meant the
//             founder's own account could never be anyone's student.
//   STUDENT — a roster row the login has CLAIMED: its WorkOS id is on the
//             row, or its email matches a student a teacher created and
//             the first sign-in claims it (sets workosUserId + ensures a
//             portal token so the token-keyed surfaces work).
//
// The roles are independent: the UI renders the sections a person has,
// and `homeFor` picks where a login lands.
// ---------------------------------------------------------------------------

export type Roles = {
  /** The signed-in identity — the same fields every role row carries. */
  user: { workosUserId: string; email: string; name: string | null };
  teacher: Teacher | null;
  student: Student | null;
};

/**
 * Where a login lands: the teaching desk if they teach, their classroom
 * if they are somebody's student, otherwise their own study. Teacher
 * first because a person with both is, in practice, the tutor checking
 * the other side — and the classroom is one row away in the sidebar.
 */
export function homeFor(roles: Roles): string {
  if (roles.teacher) return "/schedule";
  if (roles.student) return "/student";
  return "/home";
}

/**
 * Mock-mode role override — `mock-roles` cookie, a comma list of
 * `teacher` and/or `student` (default `teacher`, which is what the mock
 * has always been). Lets the e2e suite exercise the learner-only and
 * student shells against the SAME fixed mock login without a second
 * identity provider. Inert on production builds like the flag itself.
 */
async function mockRoleNames(): Promise<Set<string>> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mock-roles")?.value ?? "teacher";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

async function resolveStudentAccount(user: {
  id: string;
  email: string;
}): Promise<Student | null> {
  const claimed = await db.query.students.findFirst({
    where: eq(students.workosUserId, user.id),
  });
  if (claimed) {
    if (claimed.portalToken) return claimed;
    // Older claim without a token — the practice/chat surfaces need one.
    const [withToken] = await db
      .update(students)
      .set({
        portalToken: generateAccessToken(),
        updatedAt: new Date(),
      })
      .where(eq(students.id, claimed.id))
      .returning();
    return withToken;
  }

  const claimable = await db.query.students.findFirst({
    where: and(eq(students.email, user.email), isNull(students.workosUserId)),
  });
  if (!claimable) return null;

  const [updated] = await db
    .update(students)
    .set({
      workosUserId: user.id,
      portalToken: claimable.portalToken ?? generateAccessToken(),
      updatedAt: new Date(),
    })
    .where(eq(students.id, claimable.id))
    .returning();
  return updated;
}

/**
 * Every role the signed-in login holds. Null when nobody is signed in.
 * Creates nothing except in mock mode (the mock teacher); the learner
 * row is `getLearner`'s job and the teacher row is `startTeaching`'s.
 *
 * Wrapped in React `cache` so a page and its nested components share
 * one lookup per request.
 */
export const resolveRoles = cache(async (): Promise<Roles | null> => {
  if (MOCK_AUTH) {
    const names = await mockRoleNames();
    const user = { ...MOCK_TEACHER, name: MOCK_TEACHER.name as string | null };
    const [teacher, student] = await Promise.all([
      names.has("teacher") ? ensureMockTeacher() : Promise.resolve(null),
      names.has("student")
        ? resolveStudentAccount({ id: MOCK_TEACHER.workosUserId, email: MOCK_TEACHER.email })
        : Promise.resolve(null),
    ]);
    return { user, teacher, student };
  }
  const { user } = await withAuth();
  if (!user) return null;

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
  const [teacherRow, student] = await Promise.all([
    db.query.teachers.findFirst({
      where: eq(teachers.workosUserId, user.id),
    }),
    resolveStudentAccount(user),
  ]);
  // The ROW is not the role: a row without `teaching_since` is one the
  // old default created for someone who never chose to teach.
  const teacher = teacherRow?.teachingSince ? teacherRow : null;

  return {
    user: { workosUserId: user.id, email: user.email, name },
    teacher,
    student,
  };
});

/**
 * Resolve the signed-in teacher. A login without the teaching role is
 * sent to /teach — the opt-in — never silently made a teacher;
 * unauthenticated requests go to /login (or the refresh bounce).
 */
export const requireTeacher = cache(async (): Promise<Teacher> => {
  const roles = await resolveRoles();
  if (!roles) return unauthenticatedRedirect();
  if (!roles.teacher) redirect("/teach");
  return roles.teacher;
});

/** Resolve the signed-in student; a login that is nobody's student is
 * sent to wherever it does belong. */
export const requireStudent = cache(async (): Promise<Student> => {
  const roles = await resolveRoles();
  if (!roles) return unauthenticatedRedirect();
  if (!roles.student) redirect(homeFor(roles));
  return roles.student;
});

/** Non-redirecting variant for public pages that adapt to auth state. */
export const getRoles = cache(async (): Promise<Roles | null> => {
  const cookieStore = await cookies();
  if (!MOCK_AUTH && !cookieStore.has(SESSION_COOKIE)) return null;
  return resolveRoles();
});

// ---------------------------------------------------------------------------
// Learners — the self-serve study surface (/chat). Orthogonal to the
// teacher/student roles above: ANY signed-in login gets a learner row on
// first touch, keyed on the WorkOS user id. A teacher studying French and
// a claimed roster student keep their existing roles untouched.
// ---------------------------------------------------------------------------

async function findOrCreateLearner(input: {
  workosUserId: string;
  email: string;
  name: string | null;
}): Promise<Learner> {
  const existing = await db.query.learners.findFirst({
    where: eq(learners.workosUserId, input.workosUserId),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(learners)
    .values({
      workosUserId: input.workosUserId,
      email: input.email,
      name: input.name,
    })
    .onConflictDoUpdate({
      target: learners.workosUserId,
      set: { email: input.email, updatedAt: new Date() },
    })
    .returning();
  return created;
}

/**
 * Non-redirecting learner resolver — route handlers turn a null into a
 * 401 instead of a redirect. Never creates a row for anonymous callers.
 */
export const getLearner = cache(async (): Promise<Learner | null> => {
  if (MOCK_AUTH) {
    return findOrCreateLearner({ ...MOCK_TEACHER });
  }
  const { user } = await withAuth();
  if (!user) return null;
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
  return findOrCreateLearner({
    workosUserId: user.id,
    email: user.email,
    name,
  });
});

/** Resolve the signed-in learner; anonymous requests go to /login. */
export const requireLearner = cache(async (): Promise<Learner> => {
  const learner = await getLearner();
  if (!learner) return unauthenticatedRedirect();
  return learner;
});
