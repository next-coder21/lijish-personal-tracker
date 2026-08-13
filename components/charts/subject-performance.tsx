"use client";

import { ChartFrame } from "@/components/charts/chart-frame";
import { ChartWithTable, MiniTable } from "@/components/charts/view-switch";
import { subjectColor, type SubjectSummary } from "@/lib/analytics";
import { num, pct } from "@/lib/format";

/**
 * Accuracy per subject as a direct-labelled bar list. Drawn in plain HTML
 * rather than an SVG chart so the value label always sits outside the mark and
 * can never be clipped by a short bar — and so the light-mode contrast relief
 * rule (visible labels) is satisfied by construction.
 */
export function SubjectPerformance({
  summaries,
  target,
}: {
  summaries: SubjectSummary[];
  target: number;
}) {
  const ordered = [...summaries].sort((a, b) => b.attempted - a.attempted);

  const chart = (
    <>
      <ul className="space-y-4">
        {ordered.map((s) => {
          const value = s.accuracy * 100;
          const onTarget = s.accuracy >= target;
          return (
            <li key={s.subject}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span
                    aria-hidden
                    className="size-2.5 rounded-[3px]"
                    style={{ background: subjectColor(s.subject) }}
                  />
                  {s.subject}
                </span>
                <span className="num text-sm tabular-nums">
                  <span className="font-semibold">{pct(s.accuracy)}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {s.correct}/{s.attempted} · {s.sessions} block
                    {s.sessions === 1 ? "" : "s"}
                  </span>
                </span>
              </div>

              <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${value}%`, background: subjectColor(s.subject) }}
                />
                {/* The target marker cuts through the fill as a 2px surface gap
                    plus a hairline, rather than a border drawn over the mark. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-[3px] bg-card"
                  style={{ left: `calc(${target * 100}% - 1px)` }}
                />
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-px"
                  style={{
                    left: `${target * 100}%`,
                    background: onTarget ? "var(--viz-axis)" : "var(--foreground)",
                  }}
                />
              </div>
              {!onTarget ? (
                <p
                  className="mt-1 text-[10px] text-muted-foreground"
                  style={{ marginLeft: `min(${target * 100}%, 84%)` }}
                >
                  target {pct(target, 0)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-1 text-xs text-muted-foreground">
        The hairline marks your {pct(target, 0)} accuracy target.
      </p>
    </>
  );

  const table = (
    <MiniTable
      head={["Subject", "Accuracy", "Correct", "Attempted", "Avg score", "Blocks"]}
      rows={ordered.map((s) => [
        s.subject,
        pct(s.accuracy),
        s.correct,
        s.attempted,
        `${num(s.avgScore)}/5`,
        s.sessions,
      ])}
    />
  );

  return (
    <ChartWithTable
      chart={chart}
      table={table}
      render={(toggle, body) => (
        <ChartFrame
          title="Subject performance"
          subtitle="Accuracy per subject across everything you have logged"
          action={toggle}
          empty={ordered.length === 0}
        >
          {body}
        </ChartFrame>
      )}
    />
  );
}
