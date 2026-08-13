"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AccuracyPill } from "@/components/accuracy-pill";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { StatTile } from "@/components/dashboard/stat-tile";
import { EntryDialog } from "@/components/forms/entry-dialog";
import { PageHeader } from "@/components/page-header";
import { RowMenu } from "@/components/row-menu";
import { Badge } from "@/components/ui/badge";
import { subjectColor, dayLabel, ratio, totalsOf } from "@/lib/analytics";
import { num, pct, shortDate } from "@/lib/format";
import { useTracker } from "@/lib/store";
import type { PracticeEntry } from "@/lib/types";

/**
 * A flat row for the table engine: everything sortable/searchable is a plain
 * scalar field, and the cell renderers decorate rather than compute.
 */
interface Row {
  id: string;
  date: string;
  day: string;
  session: string;
  subject: string;
  topic: string;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  timeMin: number | "";
  speed: number | "";
  difficulty: string;
  score: number;
  notes: string;
}

export default function PracticePage() {
  const entries = useTracker((s) => s.entries);
  const goals = useTracker((s) => s.goals);
  const removeEntry = useTracker((s) => s.removeEntry);
  const hydrated = useTracker((s) => s.hydrated);

  const [editing, setEditing] = useState<PracticeEntry | null>(null);

  const rows = useMemo<Row[]>(
    () =>
      [...entries]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => ({
          id: e.id,
          date: e.date,
          day: dayLabel(e.date, goals.startDate),
          session: e.session,
          subject: e.subject,
          topic: e.topic,
          attempted: e.attempted,
          correct: e.correct,
          incorrect: e.attempted - e.correct,
          accuracy: ratio(e.correct, e.attempted),
          timeMin: e.timeMin ?? "",
          speed: e.timeMin ? Number((e.attempted / e.timeMin).toFixed(2)) : "",
          difficulty: e.difficulty,
          score: e.score,
          notes: e.notes ?? "",
        })),
    [entries, goals.startDate],
  );

  const totals = useMemo(() => totalsOf(entries), [entries]);

  const columns = useMemo<DataTableColumn<Row>[]>(
    () => [
      {
        id: "date",
        label: "Date",
        sortable: true,
        width: 100,
        cell: (r) => (
          <div className="min-w-0">
            <span className="num block truncate text-sm">{shortDate(r.date)}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {r.day}
            </span>
          </div>
        ),
      },
      {
        id: "subject",
        label: "Subject",
        sortable: true,
        width: 160,
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
        id: "topic",
        label: "Topic",
        sortable: true,
        width: 180,
        cell: (r) => <span className="block truncate text-sm">{r.topic}</span>,
      },
      { id: "session", label: "Session", sortable: true, width: 110 },
      {
        id: "attempted",
        label: "Qs",
        sortable: true,
        align: "right",
        width: 62,
        cell: (r) => <span className="num tabular-nums">{r.attempted}</span>,
      },
      {
        id: "correct",
        label: "Right",
        sortable: true,
        align: "right",
        width: 70,
        cell: (r) => <span className="num tabular-nums">{r.correct}</span>,
      },
      {
        id: "incorrect",
        label: "Wrong",
        sortable: true,
        align: "right",
        width: 74,
        // Derivable from the two columns beside it — off by default, one click
        // away in the Columns menu.
        hidden: true,
        cell: (r) => (
          <span className="num tabular-nums text-muted-foreground">
            {r.incorrect}
          </span>
        ),
      },
      {
        id: "accuracy",
        label: "Accuracy",
        sortable: true,
        align: "right",
        width: 100,
        cell: (r) => (
          <AccuracyPill value={r.accuracy} target={goals.accuracyTarget} />
        ),
      },
      {
        id: "timeMin",
        label: "Time",
        sortable: true,
        align: "right",
        width: 70,
        cell: (r) => (
          <span className="num tabular-nums text-muted-foreground">
            {r.timeMin === "" ? "—" : `${r.timeMin}m`}
          </span>
        ),
      },
      {
        id: "speed",
        label: "Q/min",
        sortable: true,
        align: "right",
        width: 80,
        hidden: true,
        cell: (r) => (
          <span className="num tabular-nums text-muted-foreground">
            {r.speed === "" ? "—" : r.speed.toFixed(2)}
          </span>
        ),
      },
      {
        id: "difficulty",
        label: "Difficulty",
        sortable: true,
        width: 120,
        cell: (r) => (
          <Badge variant="outline" className="max-w-full font-normal">
            <span className="truncate">{r.difficulty}</span>
          </Badge>
        ),
      },
      {
        id: "score",
        label: "Score",
        sortable: true,
        align: "right",
        width: 76,
        cell: (r) => <span className="num tabular-nums">{num(r.score)}/5</span>,
      },
      {
        id: "notes",
        label: "Notes",
        width: 260,
        hidden: true,
        cell: (r) => (
          <span className="block truncate text-xs text-muted-foreground">
            {r.notes || "—"}
          </span>
        ),
      },
    ],
    [goals.accuracyTarget],
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Practice Log" description="Loading your blocks…" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Practice Log"
        description="Every block you have practised. Sort, search, reorder or hide columns — the layout is remembered."
        actions={<EntryDialog />}
      />

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Blocks logged"
          value={String(entries.length)}
          accent="var(--chart-1)"
          hint={`${new Set(entries.map((e) => e.date)).size} distinct days`}
        />
        <StatTile
          label="Questions"
          value={String(totals.attempted)}
          accent="var(--chart-2)"
          hint={`${totals.correct} correct`}
        />
        <StatTile
          label="Accuracy"
          value={totals.attempted > 0 ? pct(totals.accuracy) : "—"}
          accent="var(--chart-3)"
          hint="across every block"
        />
        <StatTile
          label="Avg speed"
          value={totals.speed > 0 ? totals.speed.toFixed(2) : "—"}
          unit="Q/min"
          accent="var(--chart-4)"
          hint={totals.timeMin > 0 ? `${totals.timeMin} min timed` : "log times to track"}
        />
      </section>

      <DataTable
        data={rows}
        columns={columns}
        persistKey="practice-log.v2"
        csvName="practice-log.csv"
        searchPlaceholder="Search topic, subject, notes…"
        emptyMessage="No blocks logged yet — use “Log a block” to add your first."
        rowActions={(row) => (
          <RowMenu
            onEdit={() => setEditing(entries.find((e) => e.id === row.id) ?? null)}
            onDelete={() => {
              removeEntry(row.id);
              toast.success("Block deleted", { description: row.topic });
            }}
            deleteTitle="Delete this block?"
            deleteDescription={`${row.topic} on ${shortDate(row.date)} — ${row.correct}/${row.attempted}. This can't be undone.`}
          />
        )}
      />

      {editing ? (
        <EntryDialog
          entry={editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          trigger={<span className="hidden" />}
        />
      ) : null}
    </div>
  );
}
