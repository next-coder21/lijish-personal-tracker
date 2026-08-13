import { z } from "zod";

import {
  DIFFICULTIES,
  PRIORITIES,
  SESSION_TYPES,
  SUBJECTS,
  TOPIC_STATUSES,
} from "@/lib/types";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date");

/**
 * Form schema for a practice block.
 *
 * `correct <= attempted` is the one cross-field rule; it is attached to the
 * `correct` field so React Hook Form renders the message next to the input the
 * user has to fix.
 */
export const practiceEntrySchema = z
  .object({
    date: isoDate,
    session: z.enum(SESSION_TYPES),
    subject: z.enum(SUBJECTS),
    topic: z.string().trim().min(2, "Name the topic"),
    attempted: z.coerce
      .number<number>()
      .int("Whole questions only")
      .min(1, "At least 1 question")
      .max(500, "That looks like a typo"),
    correct: z.coerce
      .number<number>()
      .int("Whole questions only")
      .min(0)
      .max(500),
    timeMin: z.coerce.number<number>().min(0).max(1440).optional(),
    difficulty: z.enum(DIFFICULTIES),
    score: z.coerce.number<number>().min(0).max(5),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.correct <= v.attempted, {
    message: "Correct can't exceed attempted",
    path: ["correct"],
  });

export type PracticeEntryInput = z.input<typeof practiceEntrySchema>;
export type PracticeEntryValues = z.output<typeof practiceEntrySchema>;

export const topicSchema = z.object({
  subject: z.enum(SUBJECTS),
  topic: z.string().trim().min(2, "Name the topic"),
  status: z.enum(TOPIC_STATUSES),
  /** Held as a whole percentage in the form; stored as a 0–1 fraction. */
  targetAccuracy: z.coerce
    .number<number>()
    .min(1, "Set a target above 0%")
    .max(100),
  priority: z.enum(PRIORITIES),
  notes: z.string().trim().max(500).optional(),
});

export type TopicInput = z.input<typeof topicSchema>;
export type TopicValues = z.output<typeof topicSchema>;

export const sessionSchema = z.object({
  date: isoDate,
  sessionType: z.enum(SESSION_TYPES),
  plannedFocus: z.string().trim().min(2, "What was the plan?"),
  completed: z.boolean(),
  keyStrength: z.string().trim().max(300).optional(),
  improvementArea: z.string().trim().max(300).optional(),
  nextAction: z.string().trim().max(300).optional(),
});

export type SessionInput = z.input<typeof sessionSchema>;
export type SessionValues = z.output<typeof sessionSchema>;

export const goalsSchema = z.object({
  startDate: isoDate,
  dailyQuestionTarget: z.coerce
    .number<number>()
    .int()
    .min(1, "Aim for at least 1")
    .max(1000),
  /** Whole percentage in the form; stored as a 0–1 fraction. */
  accuracyTarget: z.coerce.number<number>().min(1).max(100),
  examDate: z.union([isoDate, z.literal("")]).optional(),
});

export type GoalsInput = z.input<typeof goalsSchema>;
export type GoalsValues = z.output<typeof goalsSchema>;

/**
 * Shape of a `.json` backup produced by the Export button. Kept permissive on
 * purpose: an import that drops one malformed row is more useful than an import
 * that rejects the whole file, so callers filter with `safeParse` per record.
 */
export const backupSchema = z.object({
  version: z.number().optional(),
  entries: z.array(z.looseObject({})).default([]),
  topics: z.array(z.looseObject({})).default([]),
  sessions: z.array(z.looseObject({})).default([]),
  goals: z.looseObject({}).optional(),
});
