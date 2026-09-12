import { requireTeacher, resolveRoles } from "@/lib/auth";
import { getSidebarStudy } from "@/lib/study-sidebar";
import { unreadCountFor } from "@/lib/message-queries";
import { Sidebar } from "@/components/shell/sidebar";
import { PageShell } from "@/components/ui/page-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const teacher = await requireTeacher();
  // Request-cached behind requireTeacher — no second lookup. The sidebar
  // renders every section this person has, not only the teaching one.
  const roles = await resolveRoles();
  const [study, unreadMessages] = await Promise.all([
    getSidebarStudy(),
    // The teacher row carries the identity the inbox is keyed on, so no
    // second resolver is needed here.
    unreadCountFor({
      workosUserId: teacher.workosUserId,
      email: teacher.email,
    }),
  ]);

  return (
    <div className="min-h-dvh lg:flex">
      <Sidebar
        name={teacher.name ?? "Teacher"}
        email={teacher.email}
        teacher
        student={!!roles?.student}
        study={study}
        unreadMessages={unreadMessages}
      />
      <main className="min-w-0 flex-1">
        <PageShell>{children}</PageShell>
      </main>
    </div>
  );
}
