"use client";

import { useId, useState } from "react";
import { BarChart3Icon, TableIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Every chart has a table-view twin — the WCAG-clean equivalent — so no value
 * is reachable by colour or hover alone. This renders the toggle and both panes.
 */
export function ChartWithTable({
  chart,
  table,
  render,
}: {
  chart: React.ReactNode;
  table: React.ReactNode;
  /** Receives the toggle so the frame can place it in its header slot. */
  render: (toggle: React.ReactNode, body: React.ReactNode) => React.ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const id = useId();

  const toggle = (
    <div
      role="group"
      aria-label="Chart or table view"
      className="inline-flex rounded-lg border border-border p-0.5"
    >
      {(
        [
          ["chart", BarChart3Icon, "Chart"],
          ["table", TableIcon, "Table"],
        ] as const
      ).map(([value, Icon, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          aria-controls={id}
          onClick={() => setView(value)}
          className={cn(
            "inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-xs transition-colors",
            view === value
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );

  const body = <div id={id}>{view === "chart" ? chart : table}</div>;

  return <>{render(toggle, body)}</>;
}

/** Plain, scrollable table used as every chart's table twin. */
export function MiniTable({
  head,
  rows,
}: {
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-card">
          <tr className="border-b border-border">
            {head.map((h, i) => (
              <th
                key={h}
                className={cn(
                  "px-3 py-2 text-xs font-medium text-muted-foreground",
                  i === 0 ? "text-left" : "text-right",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-border/60 last:border-0">
              {r.map((c, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-3 py-2",
                    ci === 0
                      ? "text-left"
                      : "num text-right tabular-nums text-muted-foreground",
                  )}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
