"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BookOpenText,
  CalendarClock,
  CalendarDays,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import {
  NavSection,
  SidebarShell,
  isNavEntryActive,
  navRowClass,
  type NavEntry,
} from "@/components/shell/sidebar-shell";
import { SelfStudySection } from "@/components/shell/self-study-section";
import type { SidebarStudy } from "@/lib/study-sidebar";

/**
 * ONE sidebar, sections by ROLE (2026-09-12).
 *
 * There used to be a teacher sidebar and a student sidebar, and the
 * layout picked one by the account's single `kind`. Roles are additive
 * now — a person is a learner, and may also teach, and may also be
 * somebody's student — so the sidebar renders the sections a person
 * HAS: Teaching for teachers, My classroom for students, self-study for
 * everyone. A learner who only came to study sees only their study,
 * with one quiet row offering to teach.
 */

const TEACHING_ITEMS: NavEntry[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/schedule", label: "Schedule", icon: CalendarClock },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/students", label: "Students", icon: Users },
  // Directly under Students: the two are the same relationship seen from
  // either end, and what happens BETWEEN lessons is the tutor's actual
  // job here.
  { href: "/messages", label: "Messages", icon: MessagesSquare },
  { href: "/lessons", label: "Lessons", icon: BookOpenText },
  // Last in the teaching cluster: it's where a tutor sets things up once
  // and then checks earnings, not somewhere they go between lessons.
  { href: "/teaching/payouts", label: "Teaching & payouts", icon: Banknote },
];

const CLASSROOM_ITEMS: NavEntry[] = [
  { href: "/student/schedule", label: "Schedule", icon: CalendarClock },
  { href: "/student", label: "My classroom", icon: GraduationCap, exact: true },
  { href: "/messages", label: "Messages", icon: MessagesSquare },
  { href: "/student/teacher", label: "Teacher", icon: UserRound },
];

const START_TEACHING: NavEntry = {
  href: "/teach",
  label: "Start teaching",
  icon: GraduationCap,
};

export function Sidebar({
  name,
  email,
  teacher,
  student,
  study,
  unreadMessages = 0,
}: {
  name: string;
  email: string | null;
  /** Holds the teaching role — renders the Teaching section. */
  teacher: boolean;
  /** Is somebody's claimed student — renders My classroom. */
  student: boolean;
  study: SidebarStudy;
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const withBadge = (items: NavEntry[]) =>
    items.map((item) =>
      item.href === "/messages" ? { ...item, badge: unreadMessages } : item,
    );
  const teachingItems = withBadge(TEACHING_ITEMS);
  // One inbox serves both roles; a person with both gets one Messages
  // row, in the section that comes first.
  const classroomItems = withBadge(
    teacher
      ? CLASSROOM_ITEMS.filter((item) => item.href !== "/messages")
      : CLASSROOM_ITEMS,
  );
  const homeHref = teacher ? "/schedule" : student ? "/student" : "/home";
  const StartIcon = START_TEACHING.icon;

  return (
    <SidebarShell homeHref={homeHref}>
      {teacher && (
        <NavSection
          label={student ? "Teaching" : undefined}
          items={teachingItems}
        />
      )}
      {student && (
        <NavSection label="My classroom" items={classroomItems} />
      )}
      <SelfStudySection study={study} />

      <div className="mt-auto">
        {!teacher && (
          <Link
            href={START_TEACHING.href}
            className={`start-teaching mb-2 ${navRowClass(isNavEntryActive(pathname, START_TEACHING))}`}
          >
            <StartIcon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              {START_TEACHING.label}
            </span>
          </Link>
        )}
        <Dropdown>
          <DropdownTrigger className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-hover focus:outline-none">
            <Avatar name={name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.875rem] font-medium">
                {name}
              </span>
              {email && (
                <span className="block truncate text-[0.78rem] text-fg-tertiary">
                  {email}
                </span>
              )}
            </span>
          </DropdownTrigger>
          <DropdownContent align="start" className="w-52">
            {teacher && (
              <DropdownItem asChild>
                <Link href="/settings">
                  <Settings className="size-4 text-fg-tertiary" />
                  Settings
                </Link>
              </DropdownItem>
            )}
            <DropdownItem asChild>
              <Link href="/account">
                <Gauge className="size-4 text-fg-tertiary" />
                Plan &amp; usage
              </Link>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem asChild>
              <a href="/logout">
                <LogOut className="size-4 text-fg-tertiary" />
                Sign out
              </a>
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </SidebarShell>
  );
}
