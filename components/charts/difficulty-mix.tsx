"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartFrame } from "@/components/charts/chart-frame";
import { TooltipCard, axisProps, gridProps } from "@/components/charts/chart-tooltip";
import { ChartWithTable, MiniTable } from "@/components/charts/view-switch";
import type { DifficultyPoint } from "@/lib/analytics";
import { pct } from "@/lib/format";
import { DIFFICULTIES } from "@/lib/types";

/**
 * Accuracy by difficulty band. Difficulty is an *ordered* category, so the
 * ordinal ramp is right here — one hue, stepped with mode-specific values that
 * keep the lightest bar clear of the surface.
 */
const RAMP: Record<string, string> = {
  Foundation: "var(--ord-1)",
  Easy: "var(--ord-2)",
  "Easy-Moderate": "var(--ord-3)",
  Moderate: "var(--ord-4)",
  Hard: "var(--ord-5)",
};

export function DifficultyMix({ points }: { points: DifficultyPoint[] }) {
  const data = [...points].sort(
    (a, b) => DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty),
  );

  const chart = (
    <>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="difficulty" {...axisProps} />
            <YAxis
              {...axisProps}
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(v: number) => `${v}%`}
              width={44}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.5 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as DifficultyPoint;
                return (
                  <TooltipCard
                    title={p.difficulty}
                    rows={[
                      { label: "Accuracy", value: pct(p.accuracy) },
                      { label: "Correct", value: `${p.correct} / ${p.attempted}` },
                    ]}
                  />
                );
              }}
            />
            <Bar
              dataKey={(d: DifficultyPoint) => d.accuracy * 100}
              name="Accuracy"
              radius={[4, 4, 0, 0]}
              maxBarSize={56}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell
                  key={d.difficulty}
                  fill={RAMP[d.difficulty] ?? "var(--ord-3)"}
                  // 2px surface gap between adjacent bars.
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              ))}
              <LabelList
                dataKey={(d: unknown) => pct((d as DifficultyPoint).accuracy, 0)}
                position="top"
                offset={8}
                fill="var(--muted-foreground)"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Mode-neutral wording on purpose: the ramp runs light→dark on the light
          surface and dark→light on the dark one, so "darker" would be wrong in
          one of them. Position carries the order in both. */}
      <p className="mt-1 text-xs text-muted-foreground">
        Bands run easiest to hardest, left to right. Accuracy sliding as you move
        right is normal — accuracy holding flat is the signal to move up a level.
      </p>
    </>
  );

  const table = (
    <MiniTable
      head={["Difficulty", "Accuracy", "Correct", "Attempted"]}
      rows={data.map((d) => [d.difficulty, pct(d.accuracy), d.correct, d.attempted])}
    />
  );

  return (
    <ChartWithTable
      chart={chart}
      table={table}
      render={(toggle, body) => (
        <ChartFrame
          title="Accuracy by difficulty"
          subtitle="Where your accuracy holds up and where it starts to slip"
          action={toggle}
          empty={data.length === 0}
        >
          {body}
        </ChartFrame>
      )}
    />
  );
}
