"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { backupSchema } from "@/lib/schemas";
import { SEED_REVISION, seedData } from "@/lib/seed";
import type {
  Goals,
  PracticeEntry,
  SessionRecord,
  TopicRecord,
  TrackerData,
} from "@/lib/types";
import { DIFFICULTIES, SESSION_TYPES, SUBJECTS, TOPIC_STATUSES, PRIORITIES } from "@/lib/types";

const STORAGE_KEY = "learning-tracker.v1";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Seed rows that have been withdrawn, and the name each still had when it was
 * seeded. A row is only retired if it still carries that name — if the user
 * renamed or repurposed it, it is theirs now and stays.
 */
const RETIRED_TOPICS: Record<string, string> = {
  // v3 split Day 1's single "Simplification & Approximation" in two, because
  // Day 2 practised and scored the halves separately.
  "seed-t3": "Simplification & Approximation",
  // v5 merged "Complex Number Series" into "Advanced Series" — Day 3's workbook
  // marks the former Strong and explains it with the latter's result.
  "seed-t7": "Complex Number Series",
};

/** Seed entry ids withdrawn because a later workbook superseded them. */
const isRetiredEntry = (id: string) =>
  // Day 2 first arrived as an interim report (`seed-d2-*`, 25 questions) and was
  // then superseded by the completed workbook (`seed-d2b-*`, 42 questions).
  /^seed-d2-\d+$/.test(id);

/**
 * Bring a browser's copy of the seeded rows in line with the current seed:
 * retire what has been withdrawn, refresh the topics a newer workbook revised,
 * and add whatever is missing. Anything the user created carries a random id and
 * is never touched.
 *
 * Idempotent by construction, and skipped entirely once the seed rows are gone —
 * the user cleared or deleted them, and an empty log is a deliberate state.
 */
function reconcileWithSeed(state: TrackerData): Partial<TrackerData> | null {
  if (!state.entries.some((e) => e.id === "seed-e1")) return null;

  const seedTopics = new Map(seedData.topics.map((t) => [t.id, t]));

  const addMissing = <T extends { id: string }>(current: T[], seed: T[]) => {
    const have = new Set(current.map((x) => x.id));
    return [...current, ...seed.filter((x) => !have.has(x.id))];
  };

  return {
    entries: addMissing(
      state.entries.filter((e) => !isRetiredEntry(e.id)),
      seedData.entries,
    ),
    topics: addMissing(
      state.topics
        .filter((t) => RETIRED_TOPICS[t.id] !== t.topic)
        // A newer workbook's targets, priorities and statuses win for the topics
        // it defines.
        .map((t) => seedTopics.get(t.id) ?? t),
      seedData.topics,
    ),
    sessions: addMissing(state.sessions, seedData.sessions),
  };
}

export interface TrackerState extends TrackerData {
  /** False until the persisted state has been read, so SSR and the first client
   *  render agree and only then swap in localStorage data. */
  hydrated: boolean;
  /** Which revision of the seed this browser has already reconciled against. */
  seedRevision: number;

  addEntry: (entry: Omit<PracticeEntry, "id">) => void;
  updateEntry: (id: string, patch: Partial<Omit<PracticeEntry, "id">>) => void;
  removeEntry: (id: string) => void;

  addTopic: (topic: Omit<TopicRecord, "id">) => void;
  updateTopic: (id: string, patch: Partial<Omit<TopicRecord, "id">>) => void;
  removeTopic: (id: string) => void;

  addSession: (session: Omit<SessionRecord, "id">) => void;
  updateSession: (id: string, patch: Partial<Omit<SessionRecord, "id">>) => void;
  removeSession: (id: string) => void;

  setGoals: (goals: Partial<Goals>) => void;

  exportJSON: () => string;
  /** Returns how many records of each kind were accepted, or an error string. */
  importJSON: (
    raw: string,
    mode: "replace" | "merge",
  ) => { ok: true; counts: { entries: number; topics: number; sessions: number } } | { ok: false; error: string };
  resetToSeed: () => void;
  clearAll: () => void;
}

/** Guards a value against a known union, falling back rather than throwing. */
const oneOf = <T extends readonly string[]>(
  allowed: T,
  value: unknown,
  fallback: T[number],
): T[number] => (allowed.includes(value as T[number]) ? (value as T[number]) : fallback);

const num = (v: unknown, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

const str = (v: unknown) => (typeof v === "string" ? v : undefined);

const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

function coerceEntry(raw: Record<string, unknown>): PracticeEntry | null {
  if (!isDate(raw.date)) return null;
  const attempted = num(raw.attempted);
  if (attempted <= 0) return null;
  return {
    id: str(raw.id) ?? newId(),
    date: raw.date,
    session: oneOf(SESSION_TYPES, raw.session, "Main"),
    subject: oneOf(SUBJECTS, raw.subject, "Quantitative Aptitude"),
    topic: str(raw.topic) ?? "Untitled topic",
    attempted,
    correct: Math.min(num(raw.correct), attempted),
    timeMin: typeof raw.timeMin === "number" ? raw.timeMin : undefined,
    difficulty: oneOf(DIFFICULTIES, raw.difficulty, "Moderate"),
    score: Math.min(Math.max(num(raw.score), 0), 5),
    notes: str(raw.notes),
  };
}

function coerceTopic(raw: Record<string, unknown>): TopicRecord | null {
  const topic = str(raw.topic);
  if (!topic) return null;
  return {
    id: str(raw.id) ?? newId(),
    subject: oneOf(SUBJECTS, raw.subject, "Quantitative Aptitude"),
    topic,
    status: oneOf(TOPIC_STATUSES, raw.status, "Not Started"),
    targetAccuracy: Math.min(Math.max(num(raw.targetAccuracy, 0.85), 0.01), 1),
    priority: oneOf(PRIORITIES, raw.priority, "Medium"),
    notes: str(raw.notes),
  };
}

function coerceSession(raw: Record<string, unknown>): SessionRecord | null {
  if (!isDate(raw.date)) return null;
  return {
    id: str(raw.id) ?? newId(),
    date: raw.date,
    sessionType: oneOf(SESSION_TYPES, raw.sessionType, "Main"),
    plannedFocus: str(raw.plannedFocus) ?? "",
    completed: raw.completed !== false,
    keyStrength: str(raw.keyStrength),
    improvementArea: str(raw.improvementArea),
    nextAction: str(raw.nextAction),
  };
}

export const useTracker = create<TrackerState>()(
  persist(
    (set, get) => ({
      ...structuredClone(seedData),
      hydrated: false,
      // 0, not SEED_REVISION: persist merges the stored keys over this initial
      // state, so a blob saved before the marker existed would otherwise inherit
      // the current revision here and skip the reconciliation it needs.
      seedRevision: 0,

      addEntry: (entry) =>
        set((s) => ({ entries: [...s.entries, { ...entry, id: newId() }] })),
      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      addTopic: (topic) =>
        set((s) => ({ topics: [...s.topics, { ...topic, id: newId() }] })),
      updateTopic: (id, patch) =>
        set((s) => ({
          topics: s.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTopic: (id) =>
        set((s) => ({ topics: s.topics.filter((t) => t.id !== id) })),

      addSession: (session) =>
        set((s) => ({ sessions: [...s.sessions, { ...session, id: newId() }] })),
      updateSession: (id, patch) =>
        set((s) => ({
          sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      setGoals: (goals) => set((s) => ({ goals: { ...s.goals, ...goals } })),

      exportJSON: () => {
        const { entries, topics, sessions, goals } = get();
        return JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), entries, topics, sessions, goals },
          null,
          2,
        );
      },

      importJSON: (raw, mode) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return { ok: false, error: "That file isn't valid JSON." };
        }

        const backup = backupSchema.safeParse(parsed);
        if (!backup.success) {
          return { ok: false, error: "That JSON isn't a tracker backup." };
        }

        // Per-record coercion rather than all-or-nothing: one bad row shouldn't
        // cost the user the rest of the file.
        const entries = backup.data.entries
          .map((r) => coerceEntry(r as Record<string, unknown>))
          .filter((e): e is PracticeEntry => e !== null);
        const topics = backup.data.topics
          .map((r) => coerceTopic(r as Record<string, unknown>))
          .filter((t): t is TopicRecord => t !== null);
        const sessions = backup.data.sessions
          .map((r) => coerceSession(r as Record<string, unknown>))
          .filter((s): s is SessionRecord => s !== null);

        if (entries.length + topics.length + sessions.length === 0) {
          return { ok: false, error: "No usable records found in that file." };
        }

        const current = get();
        const goals = backup.data.goals
          ? { ...current.goals, ...(backup.data.goals as Partial<Goals>) }
          : current.goals;

        if (mode === "replace") {
          set({ entries, topics, sessions, goals });
        } else {
          const keep = <T extends { id: string }>(existing: T[], incoming: T[]) => {
            const ids = new Set(existing.map((x) => x.id));
            return [...existing, ...incoming.filter((x) => !ids.has(x.id))];
          };
          set({
            entries: keep(current.entries, entries),
            topics: keep(current.topics, topics),
            sessions: keep(current.sessions, sessions),
            goals,
          });
        }

        return {
          ok: true,
          counts: { entries: entries.length, topics: topics.length, sessions: sessions.length },
        };
      },

      resetToSeed: () =>
        set({ ...structuredClone(seedData), seedRevision: SEED_REVISION }),
      clearAll: () =>
        set((s) => ({ entries: [], topics: [], sessions: [], goals: s.goals })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 5,
      // The stored *shape* has never actually changed — only its content, which
      // `applySeedRevision` handles. Without a `migrate`, persist would discard
      // any blob written under an older version outright, taking the user's own
      // rows with it, so this pass-through is load-bearing.
      migrate: (persisted) => persisted as Partial<TrackerState>,
      partialize: ({ entries, topics, sessions, goals, seedRevision }) => ({
        entries,
        topics,
        sessions,
        goals,
        seedRevision,
      }),
    },
  ),
);

/**
 * Runs once per seed revision, after the persisted state has been read. Keyed to
 * `SEED_REVISION` rather than the persist `version` on purpose: the version
 * counter describes the *shape* of the stored data, and an ordinary write can
 * stamp it forward while the content is still from an older seed — which would
 * otherwise strand that browser permanently, since `migrate` never re-runs.
 */
function applySeedRevision() {
  const state = useTracker.getState();
  if (state.seedRevision === SEED_REVISION) return;

  const next = reconcileWithSeed(state);
  useTracker.setState({ ...(next ?? {}), seedRevision: SEED_REVISION });
}

// Persist middleware skips rehydration entirely on the server; reconcile and
// flip the flag on the client once the initial read has settled.
if (typeof window !== "undefined") {
  if (useTracker.persist.hasHydrated()) {
    applySeedRevision();
    useTracker.setState({ hydrated: true });
  } else {
    useTracker.persist.onFinishHydration(() => {
      applySeedRevision();
      useTracker.setState({ hydrated: true });
    });
  }
}
