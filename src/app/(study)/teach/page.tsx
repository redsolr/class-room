import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { requireLearner, resolveRoles } from "@/lib/auth";
import { startTeaching } from "@/lib/actions/teacher";
import { SubmitButton } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Start teaching" };

/**
 * /teach — the opt-in that grants the TEACHER role.
 *
 * Until 2026-09-12 every unknown login was a teacher by default, which
 * put a tutor's dashboard in front of someone who came to study. This
 * page is where a person who does teach says so; nothing else creates
 * the role. A teacher who lands here is sent to their schedule.
 */
export default async function StartTeachingPage() {
  await requireLearner();
  const roles = await resolveRoles();
  if (roles?.teacher) redirect("/schedule");

  return (
    <PageShell>
      <PageHeader
        icon={GraduationCap}
        title="Start teaching"
        subtitle="Teach one person or twenty. Your students' lessons, homework and progress land in the same place their own study does."
      />
      <div className="start-teaching-card max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-card">
        <ul className="start-teaching-points space-y-3 text-[0.9375rem] text-fg-secondary">
          <li>
            <strong className="text-fg">A record per student</strong> — what
            you taught, what they got wrong, what to do next, without
            re-reading old notes.
          </li>
          <li>
            <strong className="text-fg">Lessons that become study material</strong>{" "}
            — a recorded call is transcribed and drafted into corrections,
            vocabulary and homework; you approve, they receive.
          </li>
          <li>
            <strong className="text-fg">One thread per student</strong> — the
            place to nudge, remind and answer between lessons.
          </li>
        </ul>
        <p className="start-teaching-note mt-5 text-[0.875rem] text-fg-tertiary">
          Your own study stays exactly as it is. Teaching adds a section to
          your sidebar; it takes nothing away.
        </p>
        <form action={startTeaching} className="mt-6">
          <SubmitButton>Start teaching</SubmitButton>
        </form>
      </div>
    </PageShell>
  );
}
