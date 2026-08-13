"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DownloadIcon, RotateCcwIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/forms/field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { goalsSchema, type GoalsInput, type GoalsValues } from "@/lib/schemas";
import { useTracker } from "@/lib/store";

export default function SettingsPage() {
  const goals = useTracker((s) => s.goals);
  const setGoals = useTracker((s) => s.setGoals);
  const exportJSON = useTracker((s) => s.exportJSON);
  const importJSON = useTracker((s) => s.importJSON);
  const resetToSeed = useTracker((s) => s.resetToSeed);
  const clearAll = useTracker((s) => s.clearAll);
  const entries = useTracker((s) => s.entries);
  const topics = useTracker((s) => s.topics);
  const sessions = useTracker((s) => s.sessions);
  const hydrated = useTracker((s) => s.hydrated);

  const fileInput = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState<null | "clear" | "reset">(null);

  const defaults = useMemo<GoalsInput>(
    () => ({
      startDate: goals.startDate,
      dailyQuestionTarget: goals.dailyQuestionTarget,
      accuracyTarget: Math.round(goals.accuracyTarget * 100),
      examDate: goals.examDate ?? "",
    }),
    [goals],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<GoalsInput, unknown, GoalsValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: defaults,
  });

  // The persisted goals land after the first render, so re-seed the form once
  // they arrive rather than leaving the seed defaults on screen.
  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const onSubmit = handleSubmit((values) => {
    setGoals({
      startDate: values.startDate,
      dailyQuestionTarget: values.dailyQuestionTarget,
      accuracyTarget: values.accuracyTarget / 100,
      examDate: values.examDate ? values.examDate : undefined,
    });
    toast.success("Goals saved");
  });

  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const onFile = async (file: File, mode: "replace" | "merge") => {
    const result = importJSON(await file.text(), mode);
    if (result.ok) {
      const { entries: e, topics: t, sessions: s } = result.counts;
      toast.success(mode === "replace" ? "Data replaced" : "Data merged", {
        description: `${e} blocks · ${t} topics · ${s} retros`,
      });
    } else {
      toast.error("Import failed", { description: result.error });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Your targets, and the data behind every chart in this app."
      />

      <Card className="gap-0 p-5">
        <h2 className="text-sm font-semibold tracking-tight">Goals</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          These set the target lines on the dashboard and the bar every topic has
          to clear.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Day 1 of your programme"
              error={errors.startDate?.message}
              hint="Drives the “Day N” labels"
            >
              {(p) => <Input type="date" {...p} {...register("startDate")} />}
            </Field>

            <Field
              label="Exam date"
              error={errors.examDate?.message}
              hint="Optional — shows a countdown"
            >
              {(p) => <Input type="date" {...p} {...register("examDate")} />}
            </Field>

            <Field
              label="Daily question goal"
              error={errors.dailyQuestionTarget?.message}
              hint="Questions per day"
            >
              {(p) => (
                <Input type="number" min={1} {...p} {...register("dailyQuestionTarget")} />
              )}
            </Field>

            <Field
              label="Accuracy target (%)"
              error={errors.accuracyTarget?.message}
              hint="The line on the accuracy chart"
            >
              {(p) => (
                <Input type="number" min={1} max={100} {...p} {...register("accuracyTarget")} />
              )}
            </Field>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!isDirty}>
              Save goals
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-4 gap-0 p-5">
        <h2 className="text-sm font-semibold tracking-tight">Your data</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Everything is stored in this browser only — nothing is uploaded
          anywhere. Download a backup before clearing your browser data or moving
          to another machine.
        </p>

        {hydrated ? (
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              ["Practice blocks", entries.length],
              ["Topics", topics.length],
              ["Retros", sessions.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-muted/50 px-3 py-2.5">
                <dd className="text-xl font-semibold leading-none tracking-tight">
                  {value}
                </dd>
                <dt className="mt-1 text-[11px] text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={download}>
            <DownloadIcon className="size-4" />
            Download backup
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInput.current?.click()}
          >
            <UploadIcon className="size-4" />
            Import backup
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              // Merge, not replace: importing should add to what's here unless
              // the user deliberately clears first.
              if (file) void onFile(file, "merge");
              e.target.value = "";
            }}
          />
          <Button variant="outline" size="sm" onClick={() => setConfirming("reset")}>
            <RotateCcwIcon className="size-4" />
            Restore Day 1 sample
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirming("clear")}
          >
            <Trash2Icon className="size-4" />
            Clear everything
          </Button>
        </div>
      </Card>

      <Dialog open={confirming !== null} onOpenChange={() => setConfirming(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirming === "clear"
                ? "Clear all your data?"
                : "Restore the Day 1 sample?"}
            </DialogTitle>
            <DialogDescription>
              {confirming === "clear"
                ? "Every practice block, topic and retro is deleted from this browser. Download a backup first if you might want them back."
                : "This replaces everything currently stored with the original Day 1 data from your workbook. Anything you have logged since will be lost."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirming === "clear") {
                  clearAll();
                  toast.success("All data cleared");
                } else {
                  resetToSeed();
                  toast.success("Day 1 sample restored");
                }
                setConfirming(null);
              }}
            >
              {confirming === "clear" ? "Clear everything" : "Restore sample"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
