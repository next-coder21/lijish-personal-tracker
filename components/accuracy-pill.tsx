"use client";

import { pct } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Accuracy against a target. The tint is a *status* cue, so it always ships
 * with the number beside it — colour never carries the meaning alone.
 */
export function AccuracyPill({
  value,
  target,
  className,
}: {
  value: number;
  target: number;
  className?: string;
}) {
  const state =
    value >= target ? "good" : value >= target - 0.15 ? "warning" : "critical";

  return (
    <span
      className={cn(
        "num inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        className,
      )}
      style={{
        background: `color-mix(in oklab, var(--status-${state}) 14%, transparent)`,
        color:
          state === "good"
            ? "var(--status-success-text)"
            : state === "warning"
              ? "var(--foreground)"
              : "var(--status-critical)",
      }}
    >
      {pct(value)}
    </span>
  );
}
