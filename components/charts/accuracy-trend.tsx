"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartFrame, LegendRow } from "@/components/charts/chart-frame";
import { TooltipCard, axisProps, cursorProps, gridProps } from "@/components/charts/chart-tooltip";
import { ChartWithTable, MiniTable } from "@/components/charts/view-switch";
import type { DayPoint } from "@/lib/analytics";
import { pct, shortDate } from "@/lib/format";

/**
 * Accuracy over time against the target. Rest days carry no accuracy value, so
 * they are `null` rather than 0 — a day off is a gap in the line, not a crash
 * to zero.
 */
export function AccuracyTrend({
  days,
  target,
}: {
  days: DayPoint[];
  target: number;
}) {
  const data = days.map((d) => ({
    label: d.label,
    date: d.date,
    accuracy: d.attempted > 0 ? d.accuracy * 100 : null,
    attempted: d.attempted,
    correct: d.correct,
  }));

  const active = data.filter((d) => d.accuracy !== null);
  const best = active.reduce<(typeof active)[number] | null>(
    (acc, d) => (acc === null || (d.accuracy ?? 0) > (acc.accuracy ?? 0) ? d : acc),
    null,
  );

  const chart = (
    <>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={24} />
            <YAxis
              {...axisProps}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v}%`}
              width={48}
            />
            <ReferenceLine
              y={target * 100}
              stroke="var(--viz-axis)"
              strokeWidth={1}
              label={{
                value: `Target ${pct(target, 0)}`,
                position: "insideTopRight",
                fill: "var(--viz-muted-ink)",
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={cursorProps}
              content={({ active: on, payload }) => {
                if (!on || !payload?.length) return null;
                const p = payload[0].payload as (typeof data)[number];
                return (
                  <TooltipCard
                    title={p.label}
                    meta={shortDate(p.date)}
                    rows={[
                      {
                        label: "Accuracy",
                        value: p.accuracy === null ? "no practice" : `${p.accuracy.toFixed(1)}%`,
                        color: "var(--chart-1)",
                      },
                      { label: "Correct", value: `${p.correct} / ${p.attempted}` },
                    ]}
                  />
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="var(--chart-1)"
              strokeWidth={2}
              connectNulls={false}
              dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)", fill: "var(--chart-1)" }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--card)" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <LegendRow
        className="mt-3"
        items={[
          { label: "Daily accuracy", color: "var(--chart-1)" },
          { label: "Target", color: "var(--viz-axis)" },
        ]}
      />
      {best ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Best day so far:{" "}
          <span className="font-medium text-foreground">{best.label}</span> at{" "}
          <span className="num font-medium text-foreground">
            {(best.accuracy ?? 0).toFixed(1)}%
          </span>
          .
        </p>
      ) : null}
    </>
  );

  const table = (
    <MiniTable
      head={["Day", "Accuracy", "Correct", "Attempted"]}
      rows={active.map((d) => [
        `${d.label} · ${shortDate(d.date)}`,
        `${(d.accuracy ?? 0).toFixed(1)}%`,
        d.correct,
        d.attempted,
      ])}
    />
  );

  return (
    <ChartWithTable
      chart={chart}
      table={table}
      render={(toggle, body) => (
        <ChartFrame
          title="Accuracy trend"
          subtitle="Share of questions answered correctly each day, against your target"
          action={toggle}
          empty={active.length === 0}
        >
          {body}
        </ChartFrame>
      )}
    />
  );
}
