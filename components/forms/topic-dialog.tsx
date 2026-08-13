"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { topicSchema, type TopicInput, type TopicValues } from "@/lib/schemas";
import { useTracker } from "@/lib/store";
import {
  PRIORITIES,
  SUBJECTS,
  TOPIC_STATUSES,
  type TopicRecord,
} from "@/lib/types";

export function TopicDialog({
  topic,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  topic?: TopicRecord;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const addTopic = useTracker((s) => s.addTopic);
  const updateTopic = useTracker((s) => s.updateTopic);
  const defaultTarget = useTracker((s) => s.goals.accuracyTarget);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  // Targets are a 0–1 fraction in the model but a whole percentage in the form,
  // because typing "85" is what anyone actually wants to do.
  const defaults = useMemo<TopicInput>(
    () =>
      topic
        ? {
            subject: topic.subject,
            topic: topic.topic,
            status: topic.status,
            targetAccuracy: Math.round(topic.targetAccuracy * 100),
            priority: topic.priority,
            notes: topic.notes ?? "",
          }
        : {
            subject: "Quantitative Aptitude",
            topic: "",
            status: "Not Started",
            targetAccuracy: Math.round(defaultTarget * 100),
            priority: "High",
            notes: "",
          },
    [topic, defaultTarget],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopicInput, unknown, TopicValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      targetAccuracy: values.targetAccuracy / 100,
      notes: values.notes || undefined,
    };
    if (topic) {
      updateTopic(topic.id, payload);
      toast.success("Topic updated", { description: values.topic });
    } else {
      addTopic(payload);
      toast.success("Topic added", { description: values.topic });
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
              Add topic
            </Button>
          }
        />
      )}

      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{topic ? "Edit topic" : "Add a topic"}</DialogTitle>
          <DialogDescription>
            Your syllabus. Live accuracy is read from the practice log — you only
            set the target and priority here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
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

            <Field label="Topic" error={errors.topic?.message}>
              {(p) => (
                <Input placeholder="e.g. Simplification" {...p} {...register("topic")} />
              )}
            </Field>

            <Field label="Status" error={errors.status?.message}>
              {(p) => (
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <OptionSelect
                      id={p.id}
                      invalid={p["aria-invalid"]}
                      value={field.value}
                      onChange={field.onChange}
                      options={TOPIC_STATUSES}
                    />
                  )}
                />
              )}
            </Field>

            <Field label="Priority" error={errors.priority?.message}>
              {(p) => (
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <OptionSelect
                      id={p.id}
                      invalid={p["aria-invalid"]}
                      value={field.value}
                      onChange={field.onChange}
                      options={PRIORITIES}
                    />
                  )}
                />
              )}
            </Field>
          </div>

          <Field
            label="Target accuracy (%)"
            error={errors.targetAccuracy?.message}
            hint="The bar this topic has to clear"
          >
            {(p) => (
              <Input type="number" min={1} max={100} {...p} {...register("targetAccuracy")} />
            )}
          </Field>

          <Field label="Notes" error={errors.notes?.message}>
            {(p) => (
              <Textarea
                rows={2}
                placeholder="Shortcuts to remember, traps to avoid…"
                {...p}
                {...register("notes")}
              />
            )}
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{topic ? "Save changes" : "Add topic"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
