"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AccuracyPill } from "@/components/accuracy-pill";
import { ChartFrame, LegendRow } from "@/components/charts/chart-frame";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TopicDialog } from "@/components/forms/topic-dialog";
import { PageHeader } from "@/components/page-header";
import { RowMenu } from "@/components/row-menu";
import { Badge } from "@/components/ui/badge";
import { statusCounts, subjectColor, topicInsights } from "@/lib/analytics";
import { pct, shortDate } from "@/lib/format";
import { useTracker } from "@/lib/store";
import { TOPIC_STATUSES, type TopicRecord, type TopicStatus } from "@/lib/types";

/** Ordinal ramp: status is an ordered scale from untouched to mastered. */
const STATUS_COLOR: Record<TopicStatus, string> = {
  // "Not Started" is absence of data, so it takes the neutral gray rather than
  // a step on the ramp — the ramp itself then runs light→dark with mastery.
  "Not Started": "var(--viz-axis)",
  "Needs Work": "var(--ord-1)",
  Developing: "var(--ord-2)",
  Strong: "var(--ord-4)",
  Mastered: "var(--ord-6)",
};

interface Row {
  id: string;
  subject: string;
  topic: string;
  status: string;
  priority: string;
  target: number;
  accuracy: number;
  attempted: number;
  correct: number;
  gapPts: number | "";
  lastPracticed: string;
  blocks: number;
  notes: string;
}

export default function TopicsPage() {
  const topics = useTracker((s) => s.topics);
  const entries = useTracker((s) => s.entries);
  const goals = useTracker((s) => s.goals);
  const removeTopic = useTracker((s) => s.removeTopic);
  const hydrated = useTracker((s) => s.hydrated);

  const [editing, setEditing] = useState<TopicRecord | null>(null);

  const insights = useMemo(
    () => topicInsights(topics, entries, goals.accuracyTarget),
    [topics, entries, goals.accuracyTarget],
  );

  const rows = useMemo<Row[]>(
    () =>
      insights.map((t) => ({
        id: t.id,
        subject: t.subject,
        topic: t.topic,
        status: t.status,
        priority: t.priority,
        target: t.targetAccuracy,
        accuracy: t.accuracy,
        attempted: t.attempted,
        correct: t.correct,
        gapPts: t.practiced ? Number((t.gap * 100).toFixed(1)) : "",
        lastPracticed: t.lastPracticed ?? "",
        blocks: t.sessions,
        notes: t.notes ?? "",
      })),
    [insights],
  );

  const counts = useMemo(() => statusCounts(insights), [insights]);
  const onTarget = insights.filter((t) => t.practiced && t.gap >= 0).length;
  const practiced = insights.filter((t) => t.practiced).length;

  const columns = useMemo<DataTableColumn<Row>[]>(
    () => [
      {
        id: "topic",
        label: "Topic",
        sortable: true,
        width: 190,
        cell: (r) => (
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium">{r.topic}</span>
            {r.notes ? (
              <span className="block truncate text-xs text-muted-foreground">
                {r.notes}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: "subject",
        label: "Subject",
        sortable: true,
        width: 172,
        cell: (r) => (
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{ background: subjectColor(r.subject as never) }}
            />
            <span className="truncate text-sm">{r.subject}</span>
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        sortable: true,
        width: 120,
        cell: (r) => (
          <span className="flex items-center gap-1.5 text-sm">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: STATUS_COLOR[r.status as TopicStatus] }}
            />
            {r.status}
          </span>
        ),
      },
      {
        id: "priority",
        label: "Priority",
        sortable: true,
        width: 92,
        cell: (r) => (
          <Badge
            variant={r.priority === "High" ? "default" : "outline"}
            className="font-normal"
          >
            {r.priority}
          </Badge>
        ),
      },
      {
        id: "accuracy",
        label: "Accuracy",
        sortable: true,
        align: "right",
        width: 110,
        cell: (r) =>
          r.attempted === 0 ? (
            <span className="text-xs text-muted-foreground">not practised</span>
          ) : (
            <AccuracyPill value={r.accuracy} target={r.target} />
          ),
      },
      {
        id: "target",
        label: "Target",
        sortable: true,
        align: "right",
        width: 78,
        cell: (r) => (
          <span className="num tabular-nums text-muted-foreground">
            {pct(r.target, 0)}
          </span>
        ),
      },
      {
        id: "gapPts",
        label: "Gap",
        sortable: true,
        align: "right",
        width: 78,
        cell: (r) =>
          r.gapPts === "" ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <span
              className="num tabular-nums"
              style={{
                color:
                  r.gapPts < 0 ? "var(--status-critical)" : "var(--status-success-text)",
              }}
            >
              {r.gapPts > 0 ? "+" : ""}
              {r.gapPts}
            </span>
          ),
      },
      {
        id: "attempted",
        label: "Right/Qs",
        sortable: true,
        align: "right",
        width: 88,
        cell: (r) => (
          <span className="num tabular-nums">
            {r.attempted === 0 ? "—" : `${r.correct}/${r.attempted}`}
          </span>
        ),
      },
      {
        id: "lastPracticed",
        label: "Last",
        sortable: true,
        align: "right",
        width: 88,
        cell: (r) => (
          <span className="num tabular-nums text-muted-foreground">
            {r.lastPracticed ? shortDate(r.lastPracticed) : "—"}
          </span>
        ),
      },
      { id: "blocks", label: "Blocks", sortable: true, align: "right", width: 80, hidden: true },
    ],
    [],
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Topic Master" description="Loading your syllabus…" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Topic Master"
        description="Your syllabus with live results joined in. Anything you practise but never listed shows up here automatically."
        actions={<TopicDialog />}
      />

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Topics tracked"
          value={String(insights.length)}
          accent="var(--chart-1)"
          hint={`${practiced} practised`}
        />
        <StatTile
          label="At or above target"
          value={String(onTarget)}
          accent="var(--chart-3)"
          hint={practiced > 0 ? `of ${practiced} practised` : "nothing practised yet"}
        />
        <StatTile
          label="Under target"
          value={String(practiced - onTarget)}
          accent="var(--chart-2)"
          hint="needs another pass"
        />
        <StatTile
          // Distinct from the "Not Started" *status* band below, which is a
          // label you set; this counts topics with no practice against them.
          label="Not practised yet"
          value={String(insights.length - practiced)}
          accent="var(--chart-4)"
          hint="no questions logged against them"
        />
      </section>

      <div className="mb-5">
        <ChartFrame
          title="Syllabus coverage"
          subtitle="How your topics are spread across the four status bands"
          empty={insights.length === 0}
        >
          <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
            {TOPIC_STATUSES.map((status) => {
              const n = counts.find((c) => c.status === status)?.count ?? 0;
              if (n === 0) return null;
              return (
                <div
                  key={status}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(n / insights.length) * 100}%`,
                    background: STATUS_COLOR[status],
                  }}
                  title={`${status}: ${n}`}
                />
              );
            })}
          </div>
          <LegendRow
            className="mt-3"
            items={TOPIC_STATUSES.map((status) => ({
              label: status,
              color: STATUS_COLOR[status],
              value: String(counts.find((c) => c.status === status)?.count ?? 0),
            }))}
          />
        </ChartFrame>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        persistKey="topic-master.v2"
        csvName="topic-master.csv"
        searchPlaceholder="Search topic, subject, notes…"
        emptyMessage="No topics yet — add the ones you plan to cover."
        rowActions={(row) => {
          const record = topics.find((t) => t.id === row.id);
          return record ? (
            <RowMenu
              onEdit={() => setEditing(record)}
              onDelete={() => {
                removeTopic(row.id);
                toast.success("Topic removed", { description: row.topic });
              }}
              deleteTitle="Remove this topic?"
              deleteDescription={`${row.topic} leaves your syllabus. Practice blocks already logged against it are kept.`}
            />
          ) : (
            <TopicDialog
              trigger={
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Add
                </button>
              }
            />
          );
        }}
      />

      {editing ? (
        <TopicDialog
          topic={editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          trigger={<span className="hidden" />}
        />
      ) : null}
    </div>
  );
}
