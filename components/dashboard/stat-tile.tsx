"use client";

import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * The number *is* the chart. Used wherever a single figure is the story —
 * never a one-bar bar chart.
 */
export function StatTile({
  label,
  value,
  unit,
  hint,
  delta,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  /** Signed change with a direction; `null` change means "no prior period". */
  delta?: { text: string; direction: "up" | "down" | "flat" } | null;
  /** CSS colour for the identity rule down the left edge. */
  accent?: string;
}) {
  const Icon =
    delta?.direction === "up"
      ? ArrowUpRightIcon
      : delta?.direction === "down"
        ? ArrowDownRightIcon
        : ArrowRightIcon;

  return (
    <Card className="relative gap-0 overflow-hidden py-4 pl-5 pr-4">
      {accent ? (
        <span
          aria-hidden
          className="absolute inset-y-3 left-0 w-[3px] rounded-full"
          style={{ background: accent }}
        />
      ) : null}
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 flex items-baseline gap-1">
        {/* Proportional figures on purpose — tabular-nums makes display sizes
            look loose. */}
        <span className="text-3xl font-semibold leading-none tracking-tight">
          {value}
        </span>
        {/* A unit beside an em-dash reads as a broken value, so it only shows
            when there is a real number to attach it to. */}
        {unit && value !== "—" ? (
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        ) : null}
      </p>
      <div className="mt-2 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
              delta.direction === "up" &&
                "bg-[color-mix(in_oklab,var(--status-good)_14%,transparent)] text-[var(--status-success-text)]",
              delta.direction === "down" &&
                "bg-[color-mix(in_oklab,var(--status-critical)_14%,transparent)] text-[var(--status-critical)]",
              delta.direction === "flat" && "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-3" aria-hidden />
            {delta.text}
          </span>
        ) : null}
        {hint ? (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    </Card>
  );
}
