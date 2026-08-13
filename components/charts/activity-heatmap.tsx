"use client";

import { getDay, parseISO } from "date-fns";

import { ChartFrame } from "@/components/charts/chart-frame";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HeatCell } from "@/lib/analytics";
import { longDate, pct } from "@/lib/format";

/**
 * Ordinal blue ramp, one hue, keyed to a share of the daily goal — so an
 * "intense" day means the same thing whatever target you set.
 */
const LEVEL: Record<HeatCell["level"], string> = {
  0: "var(--muted)",
  1: "var(--ord-1)",
  2: "var(--ord-2)",
  3: "var(--ord-4)",
  4: "var(--ord-5)",
};

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

export function ActivityHeatmap({
  cells,
  dailyTarget,
}: {
  cells: HeatCell[];
  dailyTarget: number;
}) {
  // Pad the first week so every column is a real Mon→Sun week.
  const first = cells[0];
  const leading = first ? (getDay(parseISO(first.date)) + 6) % 7 : 0;
  const padded: (HeatCell | null)[] = [...Array<null>(leading).fill(null), ...cells];

  const weeks: (HeatCell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  const activeDays = cells.filter((c) => c.attempted > 0).length;

  return (
    <ChartFrame
      title="Practice consistency"
      subtitle={`Last ${Math.round(cells.length / 7)} weeks · ${activeDays} active day${activeDays === 1 ? "" : "s"}`}
      empty={cells.length === 0}
    >
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1.5">
          <div className="mt-0.5 flex flex-col gap-[3px] pr-1">
            {DAY_LABELS.map((d, i) => (
              <span
                key={i}
                className="h-3 text-[10px] leading-3 text-muted-foreground"
                style={{ minWidth: 22 }}
              >
                {d}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) =>
                  cell === null ? (
                    <span key={di} className="size-3" />
                  ) : (
                    <Tooltip key={cell.date}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            // The 8px hit target is padded out to ~24px by the
                            // wrapper's inset so it is not a pinpoint target.
                            className="relative size-3 rounded-[3px] outline-offset-2 after:absolute after:-inset-1.5 after:content-['']"
                            style={{ background: LEVEL[cell.level] }}
                            aria-label={`${longDate(cell.date)}: ${cell.attempted} questions`}
                          />
                        }
                      />
                      <TooltipContent>
                        <span className="block text-xs font-medium">
                          {longDate(cell.date)}
                        </span>
                        <span className="num block text-xs text-muted-foreground">
                          {cell.attempted === 0
                            ? "No practice logged"
                            : `${cell.attempted} questions · ${pct(cell.accuracy)} accuracy`}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>None</span>
        {([0, 1, 2, 3, 4] as const).map((l) => (
          <span
            key={l}
            aria-hidden
            className="size-3 rounded-[3px]"
            style={{ background: LEVEL[l] }}
          />
        ))}
        <span>{dailyTarget}+ questions</span>
      </div>
    </ChartFrame>
  );
}
