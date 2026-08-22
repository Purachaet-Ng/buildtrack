/**
 * The compact wrapper that gives ProgressInput a way in from a task row.
 *
 * WORKFLOWS.md U-2 step 3 makes this the engineer's most frequent action of the
 * day, so it is deliberately NOT buried inside the full edit form — that dialog
 * is ADMIN/PM only, and it asks for nine fields when the answer is one number.
 *
 * Controlled by the caller: the trigger is a DropdownMenuItem, and a dialog
 * rendered inside DropdownMenuContent is unmounted the instant the menu closes.
 */

import { ProgressInput } from "@/components/task/ProgressInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UpdateProgress({ task, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>อัปเดตความคืบหน้า</DialogTitle>
          <DialogDescription>{task.name}</DialogDescription>
        </DialogHeader>

        {/* ProgressInput writes on every press and toasts the result, so there
            is no footer here — no Save to press twice, and nothing to cancel
            once a preset has been tapped. */}
        <ProgressInput task={task} className="pt-2" />
      </DialogContent>
    </Dialog>
  );
}
