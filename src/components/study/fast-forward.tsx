"use client";

import * as React from "react";
import Link from "next/link";
import { Check, House, Route, X } from "lucide-react";
import { fastForwardBook } from "@/lib/actions/fast-forward";
import {
  shouldFinish,
  shouldStopBook,
  type FastForwardBook,
  type FastForwardItem,
} from "@/lib/fast-forward";
import { coverHue } from "@/components/study/book-cover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * THE FAST-FORWARD SCREEN — one word at a time, two answers, no reveal.
 *
 * It borrows the drill's card so it reads as the same object the
 * learner will meet every day from now on, and deliberately NOT its
 * grades: there is no "hard" or "good" here because nothing is being
 * remembered, only sorted. The meaning is shown for the word you just
 * answered, under the card, so a learner who tapped "I know it" on a
 * word they only half knew sees the answer go past — and the four-day
 * confirmation catches it if they were wrong.
 *
 * State is per book and saved per book (`fastForwardBook`): one round
 * trip when a book ends, none per tap. Closing the tab mid-book loses
 * at most a few seconds of answers.
 */

type BookReceipt = {
  name: string;
  claimed: number;
  asked: number;
  total: number;
};

function coverGradient(name: string): string {
  const hue = coverHue(name);
  return `linear-gradient(160deg, hsl(${hue} 52% 42%) 0%, hsl(${(hue + 38) % 360} 55% 26%) 100%)`;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function FastForward({
  language,
  books: initialBooks,
}: {
  language: string;
  books: FastForwardBook[];
}) {
  /**
   * The catalog is a SESSION SNAPSHOT, the same way the drill takes its
   * due deck. Saving a book revalidates the deck routes, and that refresh
   * re-renders this page's server component with a fresh catalog — one
   * that no longer contains the book just saved, because its words are
   * now the learner's. Read live, the prop would shift under the index
   * and the next book would be skipped. A run walks what it was handed.
   */
  const [books] = React.useState(initialBooks);
  const [bookIdx, setBookIdx] = React.useState(0);
  const [itemIdx, setItemIdx] = React.useState(0);
  const [known, setKnown] = React.useState<string[]>([]);
  const [asked, setAsked] = React.useState(0);
  const [unknown, setUnknown] = React.useState(0);
  const [earlyStops, setEarlyStops] = React.useState(0);
  const [receipts, setReceipts] = React.useState<BookReceipt[]>([]);
  const [confirmAt, setConfirmAt] = React.useState<Date | null>(null);
  const [trail, setTrail] = React.useState<FastForwardItem | null>(null);
  const [phase, setPhase] = React.useState<"asking" | "saving" | "done">(
    books.length === 0 ? "done" : "asking",
  );
  const [error, setError] = React.useState<string | null>(null);

  const book = books[bookIdx];
  const item = book?.items[itemIdx];

  /**
   * Save the current book and move on — to the next book, or to the
   * end. `early` is the stop rule firing; `last` is the learner's own
   * "stop here", which ends the whole thing regardless.
   */
  const finishBook = React.useCallback(
    async (knownIds: string[], askedCount: number, early: boolean, last: boolean) => {
      if (!book) return;
      setPhase("saving");
      setError(null);
      try {
        if (askedCount > 0) {
          const result = await fastForwardBook({
            packId: book.packId,
            knownItemIds: knownIds,
          });
          setReceipts((r) => [
            ...r,
            {
              name: book.name,
              claimed: result.claimed,
              asked: askedCount,
              total: book.items.length,
            },
          ]);
          setConfirmAt((c) => c ?? new Date(result.confirmAt));
        }
      } catch (e) {
        console.error("fast-forward: failed to save book", e);
        setError("Couldn't save that book. Your other answers are safe — try again from Home.");
        setPhase("done");
        return;
      }
      const stops = early ? earlyStops + 1 : 0;
      setEarlyStops(stops);
      const nextBook = bookIdx + 1;
      if (last || shouldFinish(stops) || nextBook >= books.length) {
        setPhase("done");
        return;
      }
      setBookIdx(nextBook);
      setItemIdx(0);
      setKnown([]);
      setAsked(0);
      setUnknown(0);
      setPhase("asking");
    },
    [book, bookIdx, books.length, earlyStops],
  );

  const answer = React.useCallback(
    (knows: boolean) => {
      if (phase !== "asking" || !book || !item) return;
      const nextKnown = knows ? [...known, item.id] : known;
      const nextAsked = asked + 1;
      const nextUnknown = knows ? unknown : unknown + 1;
      setTrail(item);
      setKnown(nextKnown);
      setAsked(nextAsked);
      setUnknown(nextUnknown);

      if (shouldStopBook(nextAsked, nextUnknown)) {
        void finishBook(nextKnown, nextAsked, true, false);
      } else if (itemIdx + 1 >= book.items.length) {
        void finishBook(nextKnown, nextAsked, false, false);
      } else {
        setItemIdx(itemIdx + 1);
      }
    },
    [phase, book, item, known, asked, unknown, itemIdx, finishBook],
  );

  // ← not yet · → I know it — the drill's own axis, so the hands learn
  // one thing.
  React.useEffect(() => {
    if (phase !== "asking") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") answer(true);
      else if (e.key === "ArrowLeft") answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer]);

  if (phase === "done") {
    const claimed = receipts.reduce((n, r) => n + r.claimed, 0);
    const booksSaved = receipts.length;
    return (
      <div className="ff-done mx-auto max-w-md">
        <div className="ff-done-card rounded-2xl border border-border bg-surface p-6 shadow-card">
          <p className="ff-done-count text-[2.5rem] leading-none font-semibold tracking-tight">
            {claimed}
          </p>
          <p className="ff-done-headline mt-2 text-[1.125rem] font-medium">
            {claimed === 0
              ? `Nothing to skip — ${language} starts at the beginning for you.`
              : `${claimed === 1 ? "word" : "words"} you said you already know.`}
          </p>
          {claimed > 0 && confirmAt && (
            <p className="ff-done-confirm mt-3 text-[0.9375rem] text-fg-secondary">
              They come back on <strong>{formatDay(confirmAt)}</strong> for
              confirmation, and count as known once you still have them
              then. Nothing counts today — a word you recognise now and
              still have in four days is one you know.
            </p>
          )}
          {booksSaved > 0 && (
            <p className="ff-done-decks mt-3 text-[0.9375rem] text-fg-secondary">
              {booksSaved === 1
                ? "The book you went through is in your decks, ready to learn."
                : `The ${booksSaved} books you went through are in your decks, ready to learn.`}
            </p>
          )}
          {error && (
            <p className="ff-done-error mt-3 text-[0.9375rem] text-danger">
              {error}
            </p>
          )}
          {receipts.length > 0 && (
            <ul className="ff-receipts mt-5 space-y-1.5 border-t border-border pt-4 text-[0.9375rem]">
              {receipts.map((r) => (
                <li key={r.name} className="ff-receipt flex justify-between gap-4">
                  <span className="truncate">{r.name}</span>
                  <span className="shrink-0 text-fg-tertiary">
                    {r.claimed} of {r.total} known
                    {r.asked < r.total && " · stopped early"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="ff-done-actions mt-6 flex flex-wrap gap-2">
            <Link
              href="/home"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-transparent bg-accent px-3.5 text-[0.9375rem] font-medium text-white shadow-sm hover:bg-accent-hover"
            >
              <House className="size-4" /> Go home
            </Link>
            <Link
              href="/path"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 text-[0.9375rem] font-medium shadow-sm hover:bg-surface-hover"
            >
              <Route className="size-4" /> See the path
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!book || !item) return null;
  const saving = phase === "saving";

  return (
    <div className="fast-forward mx-auto max-w-sm select-none">
      <p className="ff-progress mb-3 text-center text-[0.875rem] text-fg-tertiary">
        Book {bookIdx + 1} of {books.length} · {itemIdx + 1} of{" "}
        {book.items.length}
      </p>

      <div className="ff-deck relative h-[18rem] sm:h-[20rem]">
        <div
          key={item.id}
          className="ff-card absolute inset-0 flex flex-col rounded-2xl border border-border bg-surface text-center shadow-card"
          style={{ background: coverGradient(book.name) }}
        >
          <div className="ff-card-front relative flex flex-1 flex-col items-center justify-center gap-1 px-6 text-white">
            <span className="ff-book-chip absolute top-4 left-4 max-w-[80%] truncate rounded-full bg-white/15 px-2.5 py-0.5 text-[0.75rem] font-medium">
              {book.name}
            </span>
            <p className="ff-term text-[2rem] leading-tight font-semibold tracking-tight text-balance">
              {item.term}
            </p>
            {item.reading && (
              <p className="ff-reading text-[1rem] text-white/75">
                {item.reading}
              </p>
            )}
          </div>
          <div className="ff-card-footer mb-5 flex h-8 shrink-0 items-center justify-center px-6">
            <p className="text-[0.78rem] text-white/75">
              Do you know this word?
            </p>
          </div>
        </div>
      </div>

      <div className="ff-answers mt-5 flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="ff-answer-skip h-11 flex-1 text-[1rem]"
          onClick={() => answer(false)}
          disabled={saving}
        >
          <X className="size-4" /> Not yet
        </Button>
        <Button
          type="button"
          variant="primary"
          className="ff-answer-know h-11 flex-1 text-[1rem]"
          onClick={() => answer(true)}
          loading={saving}
        >
          {!saving && <Check className="size-4" />} I know it
        </Button>
      </div>

      {/* The word you just answered, with its meaning — so "I know it"
          on a half-known word shows you what you claimed. */}
      <p
        className={cn(
          "ff-trail mt-4 min-h-[2.5rem] text-center text-[0.875rem] text-fg-tertiary",
          !trail && "invisible",
        )}
        aria-live="polite"
      >
        {trail ? (
          <>
            <span className="font-medium text-fg-secondary">{trail.term}</span>
            {" — "}
            {trail.meaning}
          </>
        ) : (
          "·"
        )}
      </p>

      <div className="ff-stop mt-2 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ff-stop-button"
          onClick={() => void finishBook(known, asked, false, true)}
          disabled={saving}
        >
          Stop here
        </Button>
      </div>
    </div>
  );
}
