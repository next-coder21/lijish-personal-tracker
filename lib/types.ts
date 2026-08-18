/**
 * Domain model for the competitive-exam training tracker.
 *
 * Mirrors the four sheets of the original workbook:
 *   Daily Performance -> PracticeEntry
 *   Topic Master      -> TopicRecord
 *   Session Log       -> SessionRecord
 *   Subject Summary   -> derived at read time (see lib/analytics.ts)
 *
 * Everything the workbook computed with a formula (accuracy, speed, incorrect,
 * the whole Subject Summary sheet) is derived here instead of stored, so there
 * is no such thing as a stale aggregate.
 */

export const SUBJECTS = [
  "Quantitative Aptitude",
  "Reasoning",
  "English",
  "General Awareness",
  "General Science",
  "Computer Aptitude",
  "Current Affairs",
] as const;
export type Subject = (typeof SUBJECTS)[number];

export const SESSION_TYPES = [
  "Morning",
  "Main",
  "Afternoon",
  "Evening",
  "Main + Afternoon",
  "Session 1",
  "Session 2",
  "Session 3",
  "Learning + Practice",
  "Round 1",
  "Round 2",
  "Round 3",
  "Round 4",
  "Elite Challenge",
  "Correction Drill",
  "Completion Set",
  "Goal Completion",
  "Final Session",
  "Final Mini-Test",
  "Full Day",
  "Mock Test",
  "Revision",
] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

/** Ordered easiest → hardest. Charts rely on this order. */
export const DIFFICULTIES = [
  "Foundation",
  "Easy",
  "Easy-Moderate",
  "Moderate",
  "Moderate-Hard",
  "Hard",
] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Ordered weakest → strongest. The status ramp relies on this order. */
export const TOPIC_STATUSES = [
  "Not Started",
  "Needs Work",
  "Developing",
  "Strong",
  "Mastered",
] as const;
export type TopicStatus = (typeof TOPIC_STATUSES)[number];

export const PRIORITIES = ["High", "Medium", "Low"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** One practice block. The atomic unit everything else is computed from. */
export interface PracticeEntry {
  id: string;
  /** ISO calendar date, `yyyy-MM-dd`. */
  date: string;
  session: SessionType;
  subject: Subject;
  topic: string;
  attempted: number;
  correct: number;
  /** Minutes spent. Optional — speed is simply unavailable when absent. */
  timeMin?: number;
  difficulty: Difficulty;
  /** Self-rated quality of the block, 0–5, in half-point steps. */
  score: number;
  notes?: string;
}

/** A topic on the syllabus, with its target and priority. */
export interface TopicRecord {
  id: string;
  subject: Subject;
  topic: string;
  /** Manual status. Live accuracy against `targetAccuracy` is derived. */
  status: TopicStatus;
  /** Fraction 0–1. */
  targetAccuracy: number;
  priority: Priority;
  notes?: string;
}

/** The day's overall training retro. Totals come from that day's entries. */
export interface SessionRecord {
  id: string;
  date: string;
  sessionType: SessionType;
  plannedFocus: string;
  completed: boolean;
  keyStrength?: string;
  improvementArea?: string;
  nextAction?: string;
}

export interface Goals {
  /** Day 1 of the programme, `yyyy-MM-dd`. Drives "Day N" labelling. */
  startDate: string;
  dailyQuestionTarget: number;
  /** Fraction 0–1. */
  accuracyTarget: number;
  /** ISO calendar date of the exam, if one is booked. Drives the countdown. */
  examDate?: string;
}

export interface TrackerData {
  entries: PracticeEntry[];
  topics: TopicRecord[];
  sessions: SessionRecord[];
  goals: Goals;
}
