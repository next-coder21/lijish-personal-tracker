"use client";

import { useMemo, useState } from "react";
import { AlertTriangleIcon, SearchIcon } from "lucide-react";

import { AccuracyPill } from "@/components/accuracy-pill";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ratio, topicInsights } from "@/lib/analytics";
import { FORMULA_COUNT, FORMULA_SECTIONS } from "@/lib/formulas";
import { pct } from "@/lib/format";
import { useTracker } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Bento tile width, over a six-column bed. Length earns width — a ten-row
 * section in a narrow column would tower over everything beside it — and a
 * section under target takes a wide tile whatever its length, so the thing to
 * revise reads first.
 *
 * A third of the bed is the floor: below that the concept and its formula stop
 * fitting on one line and the header collides with its accuracy pill.
 */
function tileSpan(entryCount: number, needsWork: boolean) {
  if (entryCount >= 8) return "sm:col-span-2 lg:col-span-4";
  if (needsWork || entryCount >= 5) return "sm:col-span-2 lg:col-span-3";
  return "sm:col-span-1 lg:col-span-2";
}

export default function FormulasPage() {
  const topics = useTracker((s) => s.topics);
  const entries = useTracker((s) => s.entries);
  const goals = useTracker((s) => s.goals);
  const hydrated = useTracker((s) => s.hydrated);

  const [query, setQuery] = useState("");

  const insights = useMemo(
    () => topicInsights(topics, entries, goals.accuracyTarget),
    [topics, entries, goals.accuracyTarget],
  );

  /**
   * Each section is scored against the topics it supports, so a shortcut set
   * whose questions you keep getting wrong sorts to the top instead of sitting
   * in whatever order the spreadsheet happened to use.
   */
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();

    return FORMULA_SECTIONS.map((section) => {
      const related = insights.filter(
        (t) => section.topics.includes(t.topic) && t.practiced,
      );
      const attempted = related.reduce((n, t) => n + t.attempted, 0);
      const correct = related.reduce((n, t) => n + t.correct, 0);
      const accuracy = ratio(correct, attempted);
      // Weakest sections first; unpractised ones keep the sheet's own order.
      const target = related.length
        ? Math.min(...related.map((t) => t.targetAccuracy))
        : goals.accuracyTarget;

      const entries = q
        ? section.entries.filter(
            (e) =>
              e.concept.toLowerCase().includes(q) ||
              e.formula.toLowerCase().includes(q) ||
              section.title.toLowerCase().includes(q),
          )
        : section.entries;

      return {
        ...section,
        entries,
        attempted,
        correct,
        accuracy,
        target,
        needsWork: attempted > 0 && accuracy < target,
      };
    })
      .filter((s) => s.entries.length > 0)
      .sort((a, b) => {
        if (a.needsWork !== b.needsWork) return a.needsWork ? -1 : 1;
        if (a.needsWork && b.needsWork) return a.accuracy - b.accuracy;
        return 0;
      });
  }, [insights, query, goals.accuracyTarget]);

  const weak = sections.filter((s) => s.needsWork);
  const matches = sections.reduce((n, s) => n + s.entries.length, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Formulas & Shortcuts"
        description="Your master shortcut sheet, ordered by where you are actually losing marks."
      />

      {hydrated ? (
        <section className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Shortcuts"
            value={String(FORMULA_COUNT)}
            accent="var(--chart-1)"
            hint={`${FORMULA_SECTIONS.length} sections`}
          />
          <StatTile
            label="Sections under target"
            value={String(weak.length)}
            accent="var(--chart-2)"
            hint={weak.length === 0 ? "all clear" : "sorted to the top"}
          />
          <StatTile
            label="Weakest area"
            value={weak.length > 0 ? pct(weak[0].accuracy) : "—"}
            accent="var(--chart-4)"
            hint={weak.length > 0 ? weak[0].title : "nothing under target"}
          />
        </section>
      ) : null}

      <div className="relative mb-5">
        <SearchIcon
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          aria-label="Search formulas and shortcuts"
          placeholder="Search a concept or formula — “25%”, “profit”, “BODMAS”…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {query && matches === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing matches “{query}”.
        </p>
      ) : (
        // Bento: a six-column bed where each tile claims width from how much it
        // has to say. `grid-flow-dense` backfills the gaps a ragged mix of spans
        // would otherwise leave, and `auto-rows-min` keeps every tile at its
        // natural height instead of stretching it to fill the row.
        <div className="grid auto-rows-min grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {sections.map((section) => (
            <Card
              key={section.id}
              className={cn(
                "gap-0 overflow-hidden py-0",
                tileSpan(section.entries.length, section.needsWork),
                section.needsWork && "border-[var(--status-serious)]",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-5 py-3.5">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                    {section.needsWork ? (
                      <AlertTriangleIcon
                        className="size-3.5 shrink-0 text-[var(--status-serious)]"
                        aria-hidden
                      />
                    ) : null}
                    {section.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {section.attempted > 0
                      ? `${section.correct}/${section.attempted} on these topics`
                      : "not practised yet"}
                  </p>
                </div>
                {section.attempted > 0 ? (
                  <AccuracyPill
                    value={section.accuracy}
                    target={section.target}
                    className="shrink-0"
                  />
                ) : null}
              </div>

              <dl className="divide-y divide-border/70">
                {section.entries.map((e) => (
                  <div
                    key={e.concept}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-5 py-2.5"
                  >
                    <dt className="num min-w-0 text-sm">{e.concept}</dt>
                    <dd className="num ml-auto font-mono text-sm text-muted-foreground">
                      {e.formula}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-muted-foreground">
        Transcribed from the Formula &amp; Shortcuts sheet of your Day 3
        workbook. Sections you are under target on are flagged and sorted first.
      </p>
    </div>
  );
}
