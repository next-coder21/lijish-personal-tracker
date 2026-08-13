"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Shared chrome for every chart card: title, one-line "what am I looking at",
 * an optional action slot (the table-view toggle), and an empty state so a card
 * with no data never renders a bare axis.
 */
export function ChartFrame({
  title,
  subtitle,
  action,
  children,
  empty,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  empty?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 [.border-b]:pb-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("px-5 py-5", bodyClassName)}>
        {empty ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing logged yet — this fills in as you record practice blocks.
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/** The legend swatch + label pairing. Identity is never colour alone. */
export function LegendRow({
  items,
  className,
}: {
  items: { label: string; color: string; value?: string }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs">
          <span
            aria-hidden
            className="size-2.5 rounded-[3px]"
            style={{ background: item.color }}
          />
          <span className="text-muted-foreground">{item.label}</span>
          {item.value ? (
            <span className="num font-medium text-foreground">{item.value}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
