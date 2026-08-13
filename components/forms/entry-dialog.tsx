"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Field, OptionSelect } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/analytics";
import { pct } from "@/lib/format";
import {
  practiceEntrySchema,
  type PracticeEntryInput,
  type PracticeEntryValues,
} from "@/lib/schemas";
import { useTracker } from "@/lib/store";
import {
  DIFFICULTIES,
  SESSION_TYPES,
  SUBJECTS,
  type PracticeEntry,
} from "@/lib/types";

const emptyValues = (): PracticeEntryInput => ({
  date: todayISO(),
  session: "Main",
  subject: "Quantitative Aptitude",
  topic: "",
  attempted: 10,
  correct: 10,
  timeMin: undefined,
  difficulty: "Foundation",
  score: 5,
  notes: "",
});

/**
 * Add or edit one practice block. Validation is Zod's; React Hook Form only
 * carries the values, so the schema is the single source of truth for what a
 * valid block is (see `lib/schemas.ts`).
 */
export function EntryDialog({
  entry,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  /** Present when editing; absent when adding. */
  entry?: PracticeEntry;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const addEntry = useTracker((s) => s.addEntry);
  const updateEntry = useTracker((s) => s.updateEntry);
  const entries = useTracker((s) => s.entries);
  const topics = useTracker((s) => s.topics);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const defaults = useMemo<PracticeEntryInput>(
    () =>
      entry
        ? {
            date: entry.date,
            session: entry.session,
            subject: entry.subject,
            topic: entry.topic,
            attempted: entry.attempted,
            correct: entry.correct,
            timeMin: entry.timeMin,
            difficulty: entry.difficulty,
            score: entry.score,
            notes: entry.notes ?? "",
          }
        : emptyValues(),
    [entry],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PracticeEntryInput, unknown, PracticeEntryValues>({
    resolver: zodResolver(practiceEntrySchema),
    defaultValues: defaults,
  });

  // Re-seed the form each time it opens so an edit never shows a stale row and
  // a fresh add never shows the last thing typed.
  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  // `useWatch` rather than `watch()` — it subscribes through the control object
  // instead of returning a fresh closure on every render.
  const subject = useWatch({ control, name: "subject" });
  const attempted = Number(useWatch({ control, name: "attempted" })) || 0;
  const correct = Number(useWatch({ control, name: "correct" })) || 0;
  const liveAccuracy = attempted > 0 ? Math.min(correct, attempted) / attempted : null;

  /** Topic suggestions: what you have logged plus what's on the syllabus. */
  const suggestions = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) if (e.subject === subject) set.add(e.topic);
    for (const t of topics) if (t.subject === subject) set.add(t.topic);
    return [...set].sort();
  }, [entries, topics, subject]);

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      timeMin: values.timeMin && values.timeMin > 0 ? values.timeMin : undefined,
      notes: values.notes || undefined,
    };

    if (entry) {
      updateEntry(entry.id, payload);
      toast.success("Block updated", { description: `${values.topic} · ${values.date}` });
    } else {
      addEntry(payload);
      toast.success("Block logged", {
        description: `${values.correct}/${values.attempted} on ${values.topic}`,
      });
    }
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button size="sm">
              <PlusIcon className="size-4" />
              Log a block
            </Button>
          }
        />
      )}

      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit practice block" : "Log a practice block"}</DialogTitle>
          <DialogDescription>
            One row per block you practise. Accuracy and speed are worked out for
            you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" error={errors.date?.message}>
              {(p) => <Input type="date" {...p} {...register("date")} />}
            </Field>

            <Field label="Session" error={errors.session?.message}>
              {(p) => (
                <Controller
                  control={control}
                  name="session"
                  render={({ field }) => (
                    <OptionSelect
                      id={p.id}
                      invalid={p["aria-invalid"]}
                      value={field.value}
                      onChange={field.onChange}
                      options={SESSION_TYPES}
                    />
                  )}
                />
              )}
            </Field>

            <Field label="Subject" error={errors.subject?.message}>
              {(p) => (
                <Controller
                  control={control}
                  name="subject"
                  render={({ field }) => (
                    <OptionSelect
                      id={p.id}
                      invalid={p["aria-invalid"]}
                      value={field.value}
                      onChange={field.onChange}
                      options={SUBJECTS}
                    />
                  )}
                />
              )}
            </Field>

            <Field
              label="Topic"
              error={errors.topic?.message}
              hint="Type freely — past topics are suggested"
            >
              {(p) => (
                <>
                  <Input
                    list="topic-suggestions"
                    placeholder="e.g. Percentages"
                    {...p}
                    {...register("topic")}
                  />
                  <datalist id="topic-suggestions">
                    {suggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Attempted" error={errors.attempted?.message}>
              {(p) => <Input type="number" min={1} {...p} {...register("attempted")} />}
            </Field>
            <Field label="Correct" error={errors.correct?.message}>
              {(p) => <Input type="number" min={0} {...p} {...register("correct")} />}
            </Field>
            <Field
              label="Time (min)"
              error={errors.timeMin?.message}
              hint="optional"
            >
              {(p) => (
                <Input type="number" min={0} placeholder="—" {...p} {...register("timeMin")} />
              )}
            </Field>
            <Field
              label="Self score"
              error={errors.score?.message}
              hint="0–5, halves ok"
            >
              {(p) => (
                <Input type="number" min={0} max={5} step={0.5} {...p} {...register("score")} />
              )}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Difficulty" error={errors.difficulty?.message}>
              {(p) => (
                <Controller
                  control={control}
                  name="difficulty"
                  render={({ field }) => (
                    <OptionSelect
                      id={p.id}
                      invalid={p["aria-invalid"]}
                      value={field.value}
                      onChange={field.onChange}
                      options={DIFFICULTIES}
                    />
                  )}
                />
              )}
            </Field>

            <div className="flex items-end">
              <div className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Accuracy for this block</p>
                <p className="num text-lg font-semibold tabular-nums">
                  {liveAccuracy === null ? "—" : pct(liveAccuracy)}
                </p>
              </div>
            </div>
          </div>

          <Field label="Notes" error={errors.notes?.message}>
            {(p) => (
              <Textarea
                rows={2}
                placeholder="What went well, what tripped you up…"
                {...p}
                {...register("notes")}
              />
            )}
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {entry ? "Save changes" : "Log block"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
