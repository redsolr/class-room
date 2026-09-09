import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FastForward as FastForwardIcon } from "lucide-react";
import { requireLearner } from "@/lib/auth";
import { loadFastForwardCatalog } from "@/lib/actions/fast-forward";
import { FastForward } from "@/components/study/fast-forward";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, PageShell } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Skip what you know" };

/**
 * /fast-forward?language=English — "skip what you know", offered from
 * Home on the first visit and reachable by URL afterwards.
 *
 * Not a placement test: it prints no level and writes no evidence. The
 * rules and the reasoning are in `lib/fast-forward.ts`; this page only
 * resolves the language and hands the catalog to the client.
 */
export default async function FastForwardPage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string | string[] }>;
}) {
  await requireLearner();
  const params = await searchParams;
  const raw = Array.isArray(params.language)
    ? params.language[0]
    : params.language;
  const language = raw?.trim();
  if (!language) redirect("/home");

  const books = await loadFastForwardCatalog(language);

  return (
    <PageShell>
      <PageHeader
        icon={FastForwardIcon}
        title="Skip what you know"
        subtitle={`Sort the ${language} words we ship into the ones you already have and the ones you don't. A few minutes; stop whenever you like.`}
        actions={<LinkButton href="/home">Back to Home</LinkButton>}
      />
      {books.length === 0 ? (
        <EmptyState
          title={`Nothing left to sort in ${language}`}
          description="Every word we ship in this language is already in your vocabulary, or there are no books for it yet."
          action={<LinkButton href="/home">Back to Home</LinkButton>}
        />
      ) : (
        <FastForward language={language} books={books} />
      )}
    </PageShell>
  );
}
