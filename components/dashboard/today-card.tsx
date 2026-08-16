"use client";

import { Card } from "@/components/ui/card";
import type { Totals } from "@/lib/analytics";
import { num, pct } from "@/lib/format";

/**
 * Today against the two goals that matter: volume and accuracy. A progress ring
 * for volume (a share of a whole) and a plain figure for accuracy — the number
 * is the chart.
 */
export function TodayCard({
  today,
  dailyTarget,
  accuracyTarget,
  dayLabel,
  dateLabel,
}: {
  today: Totals;
  dailyTarget: number;
  accuracyTarget: number;
  dayLabel: string;
  dateLabel: string;
}) {
  const share = Math.min(today.attempted / Math.max(dailyTarget, 1), 1);
  const remaining = Math.max(dailyTarget - today.attempted, 0);
  const onAccuracy = today.attempted > 0 && today.accuracy >= accuracyTarget;

  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <Card className="gap-0 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Today</h2>
          <p className="text-xs text-muted-foreground">
            {dayLabel} · {dateLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden>
            <circle
              cx="56"
              cy="56"
              r={R}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
            />
            <circle
              cx="56"
              cy="56"
              r={R}
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - share)}
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-2xl font-semibold leading-none tracking-tight">
                {today.attempted}
              </p>
              <p className="text-[11px] text-muted-foreground">of {dailyTarget}</p>
            </div>
          </div>
        </div>

        <dl className="min-w-0 flex-1 space-y-2.5">
          <Row
            label="Accuracy today"
            value={today.attempted > 0 ? pct(today.accuracy) : "—"}
            note={
              today.attempted === 0
                ? "nothing logged yet"
                : onAccuracy
                  ? `at or above your ${pct(accuracyTarget, 0)} target`
                  : `${pct(accuracyTarget, 0)} target`
            }
            good={onAccuracy}
          />
          <Row
            label="Blocks logged"
            value={String(today.sessions)}
            note={today.sessions === 0 ? "log your first block" : "practice blocks"}
          />
          <Row
            label="Avg block score"
            value={today.sessions > 0 ? `${num(today.avgScore)}/5` : "—"}
            note="your own rating"
          />
        </dl>
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        {remaining === 0 ? (
          <>
            Daily goal met — <span className="font-medium text-foreground">
              {today.attempted}
            </span>{" "}
            questions done.
          </>
        ) : (
          <>
            <span className="num font-medium text-foreground">{remaining}</span>{" "}
            more question{remaining === 1 ? "" : "s"} to hit today&rsquo;s goal.
          </>
        )}
      </p>
    </Card>
  );
}

function Row({
  label,
  value,
  note,
  good,
}: {
  label: string;
  value: string;
  note: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="min-w-0 text-xs text-muted-foreground">
        <span className="block truncate">{label}</span>
        <span className="block truncate text-[11px] opacity-80">{note}</span>
      </dt>
      <dd
        className="num shrink-0 text-lg font-semibold tabular-nums"
        style={good ? { color: "var(--status-success-text)" } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
