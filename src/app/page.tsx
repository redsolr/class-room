import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpenText, GraduationCap, Sparkles, Users } from "lucide-react";
import { getRoles, homeFor } from "@/lib/auth";

export default async function LandingPage() {
  const roles = await getRoles();
  if (roles) redirect(homeFor(roles));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-5">
        <span className="flex items-center gap-2 text-[1rem] font-semibold tracking-tight">
          <span className="flex size-6 items-center justify-center rounded-md bg-accent text-white">
            <GraduationCap className="size-4" />
          </span>
          Classroom
        </span>
        <Link
          href="/login"
          className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-[0.9375rem] font-medium shadow-sm transition-colors hover:bg-surface-hover"
        >
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[0.8125rem] font-medium text-fg-secondary">
          <Sparkles className="size-3.5 text-accent" />
          Early access
        </p>
        <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Learn the language.
          <br />
          <span className="text-fg-secondary">Keep everything you learn.</span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-[1rem] leading-relaxed text-fg-secondary">
          Books, decks and sentences to drill, a tutor to talk to, a path
          that says what to do next — and when you study with a teacher,
          every lesson lands in the same place.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-[0.9375rem] font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
        >
          Get started — it&rsquo;s free
          <ArrowRight className="size-4" />
        </Link>

        <div className="mt-20 grid max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: BookOpenText,
              title: "Study on your own",
              body: "Official books, spaced-repetition decks, cloze sentences and a guided path. Progress you can trace to something you did.",
            },
            {
              icon: Sparkles,
              title: "Lessons that stick",
              body: "A recorded lesson becomes corrections, vocabulary and homework — reviewed by your teacher, kept by you.",
            },
            {
              icon: Users,
              title: "Teach, if you teach",
              body: "One record per student, one thread per relationship. Opt in from your account whenever you like.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-surface p-4 shadow-card"
            >
              <f.icon className="mb-2 size-4.5 text-accent" />
              <p className="text-[0.9375rem] font-semibold">{f.title}</p>
              <p className="mt-1 text-[0.875rem] leading-relaxed text-fg-secondary">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
