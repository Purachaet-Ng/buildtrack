/**
 * The engineer's one recurring action: move a task's % along.
 *
 * MOBILE-FIRST (PLAN.md §6.1) — designed at 375px before any desktop layout,
 * with 44px minimum tap targets, because it is used on site with gloves on. The
 * base styles here ARE the phone layout; nothing scales it down.
 *
 * Preset buttons rather than a slider, deliberately. A slider needs a precise
 * drag on a small target, which is the opposite of what a gloved thumb can do,
 * and dragging to an exact 60 is fiddly even indoors. Five presets cover how
 * progress is actually reported, and the number input is there for the rest.
 *
 * Writes through PATCH /tasks/:id/progress, which is ADMIN, PM or the assignee.
 * A 403 here is a normal outcome for a STAFF user looking at a colleague's
 * task, so the message is surfaced rather than swallowed.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useChangeTaskProgress } from "@/hooks/useTasks";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** How progress actually gets reported from a site: in quarters. */
const PRESETS = [0, 25, 50, 75, 100];

// Same pair as everywhere else: dark teal on a light track, never the brand
// orange — at 2.26:1 the filled and empty halves stop reading as two things.
const PROGRESS_TRACK = "h-2 bg-[#E8ECED]";
const PROGRESS_FILL = "bg-primary-900";

/** 44px minimum, per §6.1. Hard hats mean gloves. */
const TAP_TARGET = "h-11 min-w-11";

export function ProgressInput({ task, className }) {
  const [value, setValue] = useState(task.progressPercent ?? 0);
  const changeProgress = useChangeTaskProgress();

  // The row can change under us — a refetch, or someone else moving the same
  // task. Re-seed from the server value unless the user is mid-edit.
  useEffect(() => {
    setValue(task.progressPercent ?? 0);
  }, [task.progressPercent]);

  const isDirty = value !== (task.progressPercent ?? 0);
  const isValid = Number.isInteger(Number(value)) && value >= 0 && value <= 100;

  const save = async (next) => {
    try {
      await changeProgress.mutateAsync({
        id: task.id,
        progressPercent: Number(next),
      });
      toast.success("อัปเดตความคืบหน้าแล้ว", {
        description: `${task.name} · ${formatPercent(next)}`,
      });
    } catch (error) {
      // Roll the control back to what the server still believes.
      setValue(task.progressPercent ?? 0);
      toast.error("อัปเดตไม่สำเร็จ", { description: error.message });
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3">
        <Progress
          value={value}
          className={cn("flex-1", PROGRESS_TRACK)}
          indicatorClassName={PROGRESS_FILL}
        />
        <span className="tabular w-12 shrink-0 text-right font-mono text-[15px] font-medium">
          {formatPercent(value)}
        </span>
      </div>

      {/* wrap, not scroll: five presets fit at 375px, and a horizontally
          scrolling row of buttons is the thing §6.1 forbids at the page level. */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={value === preset ? "default" : "outline"}
            aria-pressed={value === preset}
            className={cn(TAP_TARGET, "flex-1 px-3 font-mono")}
            onClick={() => {
              setValue(preset);
              save(preset);
            }}
            disabled={changeProgress.isPending}
          >
            {preset}%
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={`progress-${task.id}`} className="sr-only">
          ระบุความคืบหน้าเป็นตัวเลข
        </label>
        <Input
          id={`progress-${task.id}`}
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={cn(TAP_TARGET, "font-mono")}
          aria-invalid={!isValid}
        />
        <Button
          type="button"
          className={TAP_TARGET}
          onClick={() => save(value)}
          disabled={!isDirty || !isValid || changeProgress.isPending}
        >
          <Check />
          บันทึก
        </Button>
      </div>
    </div>
  );
}
