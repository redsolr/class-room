import { requireLearner, requireStudent, resolveRoles } from "@/lib/auth";
import { getSidebarStudy } from "@/lib/study-sidebar";
import { unreadCountFor } from "@/lib/message-queries";
import { Sidebar } from "@/components/shell/sidebar";
import { PageShell } from "@/components/ui/page-header";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireStudent();
  // The learner row, not the student row, carries the identity the inbox
  // is keyed on — one person can be several teachers' student, and the
  // WorkOS id is what ties those rows to one human. All three resolvers
  // are request-cached, so this is not a round trip per call.
  const [caller, roles] = await Promise.all([requireLearner(), resolveRoles()]);
  const [study, unreadMessages] = await Promise.all([
    getSidebarStudy(),
    unreadCountFor(caller),
  ]);

  return (
    <div className="min-h-dvh lg:flex">
      <Sidebar
        name={student.name}
        email={student.email}
        teacher={!!roles?.teacher}
        student
        study={study}
        unreadMessages={unreadMessages}
      />
      <main className="min-w-0 flex-1">
        <PageShell>{children}</PageShell>
      </main>
    </div>
  );
}
