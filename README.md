# Exam Training Tracker

An interactive dashboard for Banking + Railway competitive-exam preparation. Log
each practice block; every KPI, chart and topic verdict is derived from those
blocks.

Seeded with the first three days of a real programme, transcribed from the
`Competitive_Exam_Training_Tracker_*.xlsx` workbooks it replaces.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm lint     # eslint
```

## Pages

| Route | What it's for |
|---|---|
| `/` | **Dashboard** — KPIs with 7-day deltas, today's goal ring, accuracy trend against target, daily volume stacked by subject, subject performance, accuracy by difficulty, what to work on next, 12-week consistency heatmap |
| `/practice` | **Practice Log** — every block, searchable and sortable, with drag-reorder, resize, show/hide columns and CSV export. Add, edit, delete. |
| `/topics` | **Topic Master** — the syllabus joined to live results and scored against per-topic targets, with a gap column. Anything you practise but never listed appears automatically. |
| `/sessions` | **Session Log** — one end-of-day retro per training day, with that day's totals derived from its blocks |
| `/formulas` | **Formulas & Shortcuts** — the master shortcut sheet, searchable, with sections scored against the topics they support and sorted weakest-first |
| `/settings` | **Settings** — goals (Day 1, exam date, daily question goal, accuracy target) and data import/export |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui ·
Recharts · React Hook Form + Zod · Zustand · [`@liji-table/react`](https://www.npmjs.com/package/@liji-table/react).

## How it's put together

```
lib/types.ts      domain model (PracticeEntry, TopicRecord, SessionRecord, Goals)
lib/schemas.ts    Zod schemas — the single source of truth for what's valid
lib/analytics.ts  every derived figure (totals, per-subject, per-day, per-topic, streaks)
lib/store.ts      Zustand store, persisted to localStorage, with JSON import/export
lib/seed.ts       the practice data transcribed from the workbooks
lib/formulas.ts   the master formula & shortcut sheet
```

### Nothing aggregate is stored

The source workbooks kept a Subject Summary sheet and a per-day totals row
*alongside* the raw practice rows — two copies of the same fact. They drifted
apart more than once: Day 1 recorded 34 correct in its Session Log where the
blocks summed to 35, and Day 2 recorded 40 questions where the blocks summed
to 42.

Here the practice blocks are the only record. Accuracy, speed, subject
summaries, topic verdicts, streaks and day totals are all computed at read time
in `lib/analytics.ts`, so they cannot go stale or disagree with each other.

### Data & privacy

Everything lives in the browser's `localStorage` — nothing is uploaded anywhere.
**Settings → Download backup** writes a JSON snapshot; **Import backup** merges
one back, coercing per record so one malformed row doesn't cost you the file.
Per-table column layouts are remembered separately via `@liji-table`'s
`persistKey`.

### Keeping the seed in sync

New workbooks keep arriving, so seeded rows carry stable `seed-*` ids and each
browser reconciles itself against the current seed exactly once per
`SEED_REVISION` (`lib/seed.ts`): withdrawn rows are retired, topics a newer
workbook revised are refreshed, and anything missing is added. Rows you create
yourself carry a random id and are never touched.

Two things this deliberately does **not** key off:

- **The persist `version` counter.** That describes the *shape* of stored data,
  and an ordinary write can stamp it forward while the content is still stale —
  which strands that browser permanently, since `migrate` never re-runs.
- **Nothing at all.** A browser whose seed rows are gone is left alone. An empty
  log is a deliberate state, not a stale one.

The pass-through `migrate` in `lib/store.ts` is load-bearing: without it,
zustand discards any blob written under an older version outright, taking the
user's own rows with it.

### Charts

Colours come from a validated data-viz palette defined in `app/globals.css`:

- **Seven categorical slots** assigned to subjects in fixed order, so a subject
  keeps its colour whatever the current filter leaves on screen.
- **A five-step ordinal ramp** for the genuinely ordered scales — difficulty
  bands, topic status, heatmap intensity — with its own steps per theme rather
  than an automatic flip.
- **Reserved status colours** that never double as a series, always paired with
  an icon and a label.

Light and dark steps were each validated against the surface they actually
render on for colourblind separation, lightness banding and contrast. Every
chart ships a table view beside it, so no value is reachable by colour or hover
alone.

## Notes on the source data

Where a workbook contradicted itself, the per-block rows won — they are the
primary record and carry their own attempted/correct columns. Where the same
topic appeared under two names (`Basic Grammar` / `Grammar Basics`,
`Complex Number Series` / `Advanced Series`, several `… Revision` suffixes), the
rows were filed under one name so results join, with the distinguishing detail
kept in the notes. Every such call is documented at the top of `lib/seed.ts`.
