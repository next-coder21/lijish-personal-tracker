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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/analytics";
import { sessionSchema, type SessionInput, type SessionValues } from "@/lib/schemas";
import { useTracker } from "@/lib/store";
import { SESSION_TYPES, type SessionRecord } from "@/lib/types";

export function SessionDialog({
  session,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  session?: SessionRecord;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const addSession = useTracker((s) => s.addSession);
  const updateSession = useTracker((s) => s.updateSession);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const defaults = useMemo<SessionInput>(
    () =>
      session
        ? {
            date: session.date,
            sessionType: session.sessionType,
            plannedFocus: session.plannedFocus,
            completed: session.completed,
            keyStrength: session.keyStrength ?? "",
            improvementArea: session.improvementArea ?? "",
            nextAction: session.nextAction ?? "",
          }
        : {
            date: todayISO(),
            sessionType: "Main",
            plannedFocus: "",
            completed: true,
            keyStrength: "",
            improvementArea: "",
            nextAction: "",
          },
    [session],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionInput, unknown, SessionValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      keyStrength: values.keyStrength || undefined,
      improvementArea: values.improvementArea || undefined,
      nextAction: values.nextAction || undefined,
    };
    if (session) {
      updateSession(session.id, payload);
      toast.success("Retro updated", { description: values.date });
    } else {
      addSession(payload);
      toast.success("Retro saved", { description: values.date });
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
              Add retro
            </Button>
          }
        />
      )}

      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{session ? "Edit day retro" : "Log a day retro"}</DialogTitle>
          <DialogDescription>
            The end-of-day summary. Question totals come from that day&rsquo;s
            practice blocks — write down the judgement calls instead.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" error={errors.date?.message}>
              {(p) => <Input type="date" {...p} {...register("date")} />}
            </Field>

            <Field label="Session type" error={errors.sessionType?.message}>
              {(p) => (
                <Controller
                  control={control}
                  name="sessionType"
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
          </div>

          <Field label="Planned focus" error={errors.plannedFocus?.message}>
            {(p) => (
              <Textarea
                rows={2}
                placeholder="What you set out to cover"
                {...p}
                {...register("plannedFocus")}
              />
            )}
          </Field>

          <Controller
            control={control}
            name="completed"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <Label htmlFor="session-completed" className="text-sm font-normal">
                  Completed the plan
                </Label>
                <Switch
                  id="session-completed"
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          <Field label="Key strength" error={errors.keyStrength?.message}>
            {(p) => (
              <Input placeholder="What clicked today" {...p} {...register("keyStrength")} />
            )}
          </Field>

          <Field label="Improvement area" error={errors.improvementArea?.message}>
            {(p) => (
              <Input
                placeholder="What needs another pass"
                {...p}
                {...register("improvementArea")}
              />
            )}
          </Field>

          <Field label="Next action" error={errors.nextAction?.message}>
            {(p) => (
              <Input
                placeholder="The single next thing to do"
                {...p}
                {...register("nextAction")}
              />
            )}
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{session ? "Save changes" : "Save retro"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
