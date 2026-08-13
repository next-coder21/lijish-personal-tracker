"use client";

import Link from "next/link";
import { AlertTriangleIcon, CircleCheckIcon, SproutIcon } from "lucide-react";

import { ChartFrame } from "@/components/charts/chart-frame";
import { Badge } from "@/components/ui/badge";
import { subjectColor, type TopicInsight } from "@/lib/analytics";
import { pct } from "@/lib/format";

/**
 * What to work on next. Status is carried by an icon + label, never by colour
 * alone, and reserved status colours are used only where they mean state.
 */
export function FocusPanel({
  weak,
  untouched,
}: {
  weak: TopicInsight[];
  untouched: TopicInsight[];
}) {
  const nothingToFlag = weak.length === 0 && untouched.length === 0;

  return (
    <ChartFrame
      title="What to work on next"
      subtitle="Topics under target, then anything still untouched"
    >
      {nothingToFlag ? (
        <div className="flex items-start gap-2.5 py-4">
          <CircleCheckIcon
            className="mt-0.5 size-4 shrink-0 text-[var(--status-good)]"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground">
            Every topic on your list is at or above target. Add the next topics
            from the syllabus in{" "}
            <Link href="/topics" className="underline underline-offset-2">
              Topic Master
            </Link>{" "}
            to keep the plan ahead of you.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {weak.map((t) => (
            <li key={t.id} className="flex items-start gap-3 py-3 first:pt-0">
              <AlertTriangleIcon
                className="mt-0.5 size-4 shrink-0 text-[var(--status-serious)]"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.topic}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="size-2 rounded-[2px]"
                      style={{ background: subjectColor(t.subject) }}
                    />
                    {t.subject}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="num">
                    {t.correct}/{t.attempted} correct
                  </span>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="num text-sm font-semibold tabular-nums">
                  {pct(t.accuracy)}
                </p>
                <p className="num text-xs text-[var(--status-critical)]">
                  {(t.gap * 100).toFixed(1)} pts under
                </p>
              </div>
            </li>
          ))}

          {untouched.map((t) => (
            <li key={t.id} className="flex items-start gap-3 py-3">
              <SproutIcon
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.topic}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="size-2 rounded-[2px]"
                      style={{ background: subjectColor(t.subject) }}
                    />
                    {t.subject}
                  </span>
                  <span aria-hidden>·</span>
                  <span>Not started</span>
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {t.priority}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </ChartFrame>
  );
}
