"use client";

/**
 * A single tooltip body used by every chart, so hovering anything in the app
 * looks and reads the same. Tooltips enhance — they never gate a value; each
 * chart also ships a table view.
 */
export function TooltipCard({
  title,
  meta,
  rows,
}: {
  title: string;
  meta?: string;
  rows: { label: string; value: string; color?: string }[];
}) {
  return (
    <div className="pointer-events-none min-w-40 rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-lg">
      <p className="text-xs font-semibold tracking-tight">{title}</p>
      {meta ? <p className="mt-0.5 text-[11px] text-muted-foreground">{meta}</p> : null}
      <dl className="mt-2 space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-xs">
            {r.color ? (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-[2px]"
                style={{ background: r.color }}
              />
            ) : null}
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="num ml-auto font-medium tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Shared axis/grid styling so chrome stays recessive and identical everywhere. */
export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--viz-muted-ink)", fontSize: 11 },
} as const;

export const gridProps = {
  stroke: "var(--viz-grid)",
  strokeDasharray: "0", // solid hairlines — dashing reads as "threshold"
  vertical: false,
} as const;

export const cursorProps = {
  stroke: "var(--viz-axis)",
  strokeWidth: 1,
} as const;
