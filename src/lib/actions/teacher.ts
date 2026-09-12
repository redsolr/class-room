"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, teachers } from "@/db";
import { requireLearner, requireTeacher } from "@/lib/auth";

/**
 * "Start teaching" — the ONLY way a login gains the teacher role.
 *
 * Until 2026-09-12 every unrecognised login became a teacher, which put
 * a tutor's dashboard in front of a learner who came to study. Teaching
 * is opt-in now: this creates the teacher row if there is none and
 * stamps `teaching_since`, which is what `resolveRoles` reads. Idempotent
 * — pressing it as a teacher just lands you on the schedule.
 *
 * Resolves the caller as a LEARNER on purpose: `requireTeacher` would
 * bounce the very person this exists for.
 */
export async function startTeaching(): Promise<void> {
  const learner = await requireLearner();
  const now = new Date();
  await db
    .insert(teachers)
    .values({
      workosUserId: learner.workosUserId,
      email: learner.email,
      name: learner.name,
      teachingSince: now,
    })
    .onConflictDoUpdate({
      target: teachers.workosUserId,
      // A row that exists without the role (an old default-teacher row,
      // or a roster-only person) gains it; a real teacher keeps their
      // original date.
      set: {
        // `now()` in SQL, not the JS Date — a raw `sql` fragment cannot
        // type the parameter (see ensureMockTeacher in lib/auth.ts).
        teachingSince: sql`coalesce(${teachers.teachingSince}, now())`,
        updatedAt: now,
      },
    });
  revalidatePath("/", "layout");
  redirect("/schedule");
}

const teacherSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  timezone: z.string().trim().optional(),
  nativeLanguage: z.string().trim().optional(),
  languagesTaught: z.string().trim().optional(),
});

export async function updateTeacherProfile(formData: FormData) {
  const teacher = await requireTeacher();
  const parsed = teacherSchema.parse(Object.fromEntries(formData));

  await db
    .update(teachers)
    .set({
      name: parsed.name,
      timezone: parsed.timezone || null,
      nativeLanguage: parsed.nativeLanguage || null,
      languagesTaught: parsed.languagesTaught
        ? parsed.languagesTaught
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(teachers.id, teacher.id));

  revalidatePath("/settings");
  revalidatePath("/", "layout");
}
