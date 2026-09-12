"use client";

import * as React from "react";
import { segmentWithGlossary, type GlossEntry } from "@/lib/gloss";
import { cn } from "@/lib/utils";

/**
 * A run of sentence text whose known words are TAPPABLE.
 *
 * Tapping a word calls `onPick` with the entry and the word's rect
 * (relative to the viewport) so the parent can put the gloss where it
 * wants — the drill floats a chip under the word inside the card, the
 * list writes a caption under the line. The component itself renders
 * nothing but the words: it does not own the gloss's position because
 * the two surfaces have opposite constraints (a fixed-geometry card vs
 * a flowing list).
 *
 * Pointer events on a glossed word stop at the word: inside the drill
 * the card flips on a tap, and asking what a word means is not the same
 * gesture as asking for the answer.
 */
export function GlossedText({
  text,
  glossary,
  onPick,
  className,
}: {
  text: string;
  glossary: GlossEntry[];
  onPick: (entry: GlossEntry, rect: DOMRect) => void;
  className?: string;
}) {
  const segments = React.useMemo(
    () => segmentWithGlossary(text, glossary),
    [text, glossary],
  );
  return (
    <>
      {segments.map((seg, i) =>
        seg.entry ? (
          <button
            key={i}
            type="button"
            className={cn(
              "gloss-word cursor-pointer rounded-sm underline decoration-dotted decoration-current/60 underline-offset-4 hover:decoration-solid focus-visible:outline-2 focus-visible:outline-offset-2",
              className,
            )}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onPick(seg.entry!, e.currentTarget.getBoundingClientRect());
            }}
          >
            {seg.text}
          </button>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        ),
      )}
    </>
  );
}

/** The gloss itself — term, reading, meaning — as one compact line. */
export function GlossChip({
  entry,
  onClose,
  className,
  style,
}: {
  entry: GlossEntry;
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      role="status"
      className={cn(
        "gloss-chip animate-panel-in rounded-lg bg-white/95 px-3 py-2 text-left text-neutral-900 shadow-md",
        className,
      )}
      style={style}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <span className="gloss-term font-semibold">{entry.term}</span>
      {entry.reading && (
        <span className="gloss-reading ml-1.5 text-[0.8125rem] text-neutral-500">
          {entry.reading}
        </span>
      )}
      {entry.meaning && (
        <span className="gloss-meaning block text-[0.875rem] leading-snug">
          {entry.meaning}
        </span>
      )}
    </div>
  );
}
