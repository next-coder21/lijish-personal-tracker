"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";

import { AccuracyTrend } from "@/components/charts/accuracy-trend";
import { ActivityHeatmap } from "@/components/charts/activity-heatmap";
import { DifficultyMix } from "@/components/charts/difficulty-mix";
import { SubjectPerformance } from "@/components/charts/subject-performance";
import { VolumeBySubject } from "@/components/charts/volume-by-subject";
import { FocusPanel } from "@/components/dashboard/focus-panel";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TodayCard } from "@/components/dashboard/today-card";
import { EntryDialog } from "@/components/forms/entry-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  activityHeatmap,
  currentStreak,
  dailySeries,
  dayLabel,
  difficultyBreakdown,
  longestStreak,
  momentum,
  studyDays,
  subjectSummaries,
  todayISO,
  topicInsights,
  totalsOf,
  weakTopics,
} from "@/lib/analytics";
import { longDate, num, pct, ptsDelta, signed } from "@/lib/format";
import { useTracker } from "@/lib/store";
import type { Subject } from "@/lib/types";

const RANGES = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "All time", days: 0 },
] as const;

export default function DashboardPage() {
  const entries = useTracker((s) => s.entries);
  const topics = useTracker((s) => s.topics);
  const goals = useTracker((s) => s.goals);
  const hydrated = useTracker((s) => s.hydrated);

  // One filter row above everything it scopes — never a per-chart filter.
  const [rangeDays, setRangeDays] = useState<number>(30);

  const scoped = useMemo(() => {
    if (rangeDays === 0) return entries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (rangeDays - 1));
    return entries.filter((e) => parseISO(e.date) >= cutoff);
  }, [entries, rangeDays]);

  const today = todayISO();
  const totals = useMemo(() => totalsOf(scoped), [scoped]);
  const todayTotals = useMemo(
    () => totalsOf(entries.filter((e) => e.date === today)),
    [entries, today],
  );
  // Day numbers come from every entry, not the filtered slice, so switching
  // the range never renumbers the programme.
  const allStudyDays = useMemo(() => studyDays(entries), [entries]);
  const days = useMemo(
    () => dailySeries(scoped, goals, allStudyDays, rangeDays || undefined),
    [scoped, goals, allStudyDays, rangeDays],
  );
  const summaries = useMemo(() => subjectSummaries(scoped), [scoped]);
  const insights = useMemo(
    () => topicInsights(topics, entries, goals.accuracyTarget),
    [topics, entries, goals.accuracyTarget],
  );
  const mo = useMemo(() => momentum(entries), [entries]);
  const heat = useMemo(() => activityHeatmap(entries, goals), [entries, goals]);

  const activeSubjects = useMemo(
    () => summaries.map((s) => s.subject) as Subject[],
    [summaries],
  );
  const streak = currentStreak(entries);
  const best = longestStreak(entries);
  const studyDayCount = new Set(scoped.map((e) => e.date)).size;

  const untouched = insights
    .filter((t) => !t.practiced)
    .sort((a, b) => (a.priority === "High" ? -1 : b.priority === "High" ? 1 : 0))
    .slice(0, 4);

  const daysToExam = goals.examDate
    ? differenceInCalendarDays(parseISO(goals.examDate), new Date())
    : null;

  // Persisted data arrives after the first paint; hold a quiet skeleton rather
  // than flashing seed numbers that are about to be replaced.
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Dashboard" description="Loading your tracker…" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
        description={`${dayLabel(today, allStudyDays)} · ${longDate(today)}${
          daysToExam !== null && daysToExam >= 0
            ? ` · ${daysToExam} days to exam`
            : ""
        }`}
        actions={<EntryDialog />}
      />

      <div
        role="group"
        aria-label="Time range"
        className="mb-5 inline-flex rounded-lg border border-border p-0.5"
      >
        {RANGES.map((r) => (
          <button
            key={r.label}
            type="button"
            aria-pressed={rangeDays === r.days}
            onClick={() => setRangeDays(r.days)}
            className={cn(
              "rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
              rangeDays === r.days
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Questions attempted"
          value={String(totals.attempted)}
          accent="var(--chart-1)"
          hint={`${studyDayCount} study day${studyDayCount === 1 ? "" : "s"}`}
          delta={
            mo.attempted.change === null
              ? null
              : {
                  text: `${signed(mo.attempted.change)} vs prev 7d`,
                  direction:
                    mo.attempted.change > 0
                      ? "up"
                      : mo.attempted.change < 0
                        ? "down"
                        : "flat",
                }
          }
        />
        <StatTile
          label="Overall accuracy"
          value={totals.attempted > 0 ? pct(totals.accuracy) : "—"}
          accent="var(--chart-3)"
          hint={`${totals.correct} correct · ${totals.incorrect} wrong`}
          delta={
            mo.accuracy.change === null
              ? null
              : {
                  text: `${ptsDelta(mo.accuracy.change)} vs prev 7d`,
                  direction:
                    mo.accuracy.change > 0.0005
                      ? "up"
                      : mo.accuracy.change < -0.0005
                        ? "down"
                        : "flat",
                }
          }
        />
        <StatTile
          label="Current streak"
          value={String(streak)}
          unit={streak === 1 ? "day" : "days"}
          accent="var(--chart-4)"
          hint={`best run ${best} · weekends off don't break it`}
        />
        <StatTile
          label="Avg block score"
          value={totals.sessions > 0 ? num(totals.avgScore) : "—"}
          unit="/ 5"
          accent="var(--chart-7)"
          hint={`${totals.sessions} block${totals.sessions === 1 ? "" : "s"} logged`}
          delta={
            mo.avgScore.change === null
              ? null
              : {
                  text: `${signed(mo.avgScore.change, 1)} vs prev 7d`,
                  direction:
                    mo.avgScore.change > 0.05
                      ? "up"
                      : mo.avgScore.change < -0.05
                        ? "down"
                        : "flat",
                }
          }
        />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <TodayCard
          today={todayTotals}
          dailyTarget={goals.dailyQuestionTarget}
          accuracyTarget={goals.accuracyTarget}
          dayLabel={dayLabel(today, allStudyDays)}
          dateLabel={longDate(today)}
        />
        <div className="lg:col-span-2">
          <AccuracyTrend days={days} target={goals.accuracyTarget} />
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <VolumeBySubject
          days={days}
          subjects={activeSubjects}
          dailyTarget={goals.dailyQuestionTarget}
        />
        <SubjectPerformance summaries={summaries} target={goals.accuracyTarget} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <DifficultyMix points={difficultyBreakdown(scoped)} />
        <FocusPanel weak={weakTopics(insights)} untouched={untouched} />
      </section>

      <section className="mt-4">
        <ActivityHeatmap cells={heat} dailyTarget={goals.dailyQuestionTarget} />
      </section>

      {entries.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No practice logged yet. Log your first block and every panel above
            starts filling in.
          </p>
          <div className="mt-3 flex justify-center">
            <EntryDialog trigger={<Button size="sm">Log a block</Button>} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
