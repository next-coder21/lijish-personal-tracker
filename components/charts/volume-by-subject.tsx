"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartFrame, LegendRow } from "@/components/charts/chart-frame";
import { TooltipCard, axisProps, gridProps } from "@/components/charts/chart-tooltip";
import { ChartWithTable, MiniTable } from "@/components/charts/view-switch";
import { subjectColor, type DayPoint } from "@/lib/analytics";
import { shortDate } from "@/lib/format";
import type { Subject } from "@/lib/types";

/**
 * Daily question volume, stacked by subject. Segments carry a 2px surface gap
 * rather than a border, and subject colour is fixed by slot so filtering never
 * repaints the survivors.
 */
export function VolumeBySubject({
  days,
  subjects,
  dailyTarget,
}: {
  days: DayPoint[];
  subjects: Subject[];
  dailyTarget: number;
}) {
  const data = days.map((d) => ({
    label: d.label,
    date: d.date,
    total: d.attempted,
    ...Object.fromEntries(subjects.map((s) => [s, d.bySubject[s] ?? 0])),
  }));

  const active = data.filter((d) => d.total > 0);

  const chart = (
    <>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={24} />
            <YAxis
              {...axisProps}
              width={40}
              allowDecimals={false}
              // Keep the goal line inside the scale even on days that fall well
              // short of it, otherwise the reference line is silently clipped.
              domain={[0, (max: number) => Math.ceil(Math.max(max, dailyTarget) * 1.12)]}
            />
            <ReferenceLine
              y={dailyTarget}
              stroke="var(--viz-axis)"
              strokeWidth={1}
              label={{
                value: `Goal ${dailyTarget}`,
                position: "insideTopLeft",
                fill: "var(--viz-muted-ink)",
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.5 }}
              content={({ active: on, payload }) => {
                if (!on || !payload?.length) return null;
                const p = payload[0].payload as Record<string, number | string>;
                const rows = subjects
                  .filter((s) => Number(p[s]) > 0)
                  .map((s) => ({
                    label: s,
                    value: String(p[s]),
                    color: subjectColor(s),
                  }));
                return (
                  <TooltipCard
                    title={String(p.label)}
                    meta={shortDate(String(p.date))}
                    rows={[
                      ...rows,
                      { label: "Total questions", value: String(p.total) },
                    ]}
                  />
                );
              }}
            />
            {subjects.map((s, i) => (
              <Bar
                key={s}
                dataKey={s}
                stackId="q"
                fill={subjectColor(s)}
                // 2px surface gap between stacked segments, not a border.
                stroke="var(--card)"
                strokeWidth={2}
                radius={i === subjects.length - 1 ? [4, 4, 0, 0] : 0}
                maxBarSize={44}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <LegendRow
        className="mt-3"
        items={subjects.map((s) => ({ label: s, color: subjectColor(s) }))}
      />
    </>
  );

  const table = (
    <MiniTable
      head={["Day", ...subjects, "Total"]}
      rows={active.map((d) => [
        `${d.label} · ${shortDate(d.date)}`,
        ...subjects.map((s) => Number(d[s as keyof typeof d] ?? 0)),
        d.total,
      ])}
    />
  );

  return (
    <ChartWithTable
      chart={chart}
      table={table}
      render={(toggle, body) => (
        <ChartFrame
          title="Daily volume by subject"
          subtitle="Questions attempted each day, stacked by subject, against your daily goal"
          action={toggle}
          empty={active.length === 0}
        >
          {body}
        </ChartFrame>
      )}
    />
  );
}
