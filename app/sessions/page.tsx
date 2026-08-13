"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AccuracyPill } from "@/components/accuracy-pill";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SessionDialog } from "@/components/forms/session-dialog";
import { PageHeader } from "@/components/page-header";
import { RowMenu } from "@/components/row-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { sessionInsights } from "@/lib/analytics";
import { longDate, pct } from "@/lib/format";
import { useTracker } from "@/lib/store";
import type { SessionRecord } from "@/lib/types";

export default function SessionsPage() {
  const sessions = useTracker((s) => s.sessions);
  const entries = useTracker((s) => s.entries);
  const goals = useTracker((s) => s.goals);
  const removeSession = useTracker((s) => s.removeSession);
  const hydrated = useTracker((s) => s.hydrated);

  const [editing, setEditing] = useState<SessionRecord | null>(null);

  const insights = useMemo(
    () => sessionInsights(sessions, entries, goals),
    [sessions, entries, goals],
  );

  const completed = insights.filter((s) => s.completed).length;
  const bestDay = insights.reduce<(typeof insights)[number] | null>(
    (acc, s) => (s.attempted > 0 && (!acc || s.accuracy > acc.accuracy) ? s : acc),
    null,
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Session Log" description="Loading your retros…" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Session Log"
        description="One retro per training day: what you planned, what held up, what to do next."
        actions={<SessionDialog />}
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Days logged"
          value={String(insights.length)}
          accent="var(--chart-1)"
          hint={`${completed} plan${completed === 1 ? "" : "s"} completed`}
        />
        <StatTile
          label="Best day"
          value={bestDay ? pct(bestDay.accuracy) : "—"}
          accent="var(--chart-3)"
          hint={bestDay ? bestDay.label : "no data yet"}
        />
        <StatTile
          label="Plan follow-through"
          value={
            insights.length > 0
              ? pct(completed / insights.length, 0)
              : "—"
          }
          accent="var(--chart-4)"
          hint="days you finished what you set out to do"
        />
      </section>

      {insights.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No retros yet. At the end of a training day, write down what worked
            and what to fix — it&rsquo;s the part that compounds.
          </p>
          <div className="mt-3 flex justify-center">
            <SessionDialog />
          </div>
        </div>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-6">
          {insights.map((s) => (
            <li key={s.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[31px] top-5 size-2.5 rounded-full border-2 border-card"
                style={{
                  background: s.completed
                    ? "var(--status-good)"
                    : "var(--viz-axis)",
                }}
              />
              <Card className="gap-0 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold tracking-tight">
                      {s.label}
                      <Badge variant="outline" className="font-normal">
                        {s.sessionType}
                      </Badge>
                      {s.completed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-normal text-[var(--status-success-text)]">
                          <CircleCheckIcon className="size-3.5" aria-hidden />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                          <CircleDashedIcon className="size-3.5" aria-hidden />
                          Partial
                        </span>
                      )}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {longDate(s.date)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="num text-sm font-semibold tabular-nums">
                        {s.attempted > 0 ? `${s.correct}/${s.attempted}` : "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {s.blocks} block{s.blocks === 1 ? "" : "s"}
                      </p>
                    </div>
                    {s.attempted > 0 ? (
                      <AccuracyPill value={s.accuracy} target={goals.accuracyTarget} />
                    ) : null}
                    <RowMenu
                      onEdit={() =>
                        setEditing(sessions.find((x) => x.id === s.id) ?? null)
                      }
                      onDelete={() => {
                        removeSession(s.id);
                        toast.success("Retro deleted", { description: s.label });
                      }}
                      deleteTitle="Delete this retro?"
                      deleteDescription={`The ${s.label} retro will be removed. The practice blocks from that day are kept.`}
                    />
                  </div>
                </div>

                <p className="mt-3 border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">Planned: </span>
                  {s.plannedFocus || "—"}
                </p>

                <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Detail
                    icon={SparklesIcon}
                    color="var(--status-good)"
                    label="Key strength"
                    value={s.keyStrength}
                  />
                  <Detail
                    icon={TargetIcon}
                    color="var(--status-serious)"
                    label="Improvement area"
                    value={s.improvementArea}
                  />
                  <Detail
                    icon={ArrowRightIcon}
                    color="var(--chart-1)"
                    label="Next action"
                    value={s.nextAction}
                  />
                </dl>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {editing ? (
        <SessionDialog
          session={editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          trigger={<span className="hidden" />}
        />
      ) : null}
    </div>
  );
}

function Detail({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3.5" style={{ color }} />
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-snug">{value || "—"}</dd>
    </div>
  );
}
