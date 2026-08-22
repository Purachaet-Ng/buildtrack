/**
 * Destructive confirmation. Names the thing being deleted in the body text —
 * "ลบรายการนี้?" alone is not enough to act on.
 * Confirm button uses the destructive variant (#B3261E, white text — 6.54:1).
 *
 * Controlled by the caller, because the trigger is almost always a
 * DropdownMenuItem and a dialog rendered inside DropdownMenuContent is
 * unmounted the instant the menu closes.
 *
 * The dialog owns the pending and error state rather than taking them as
 * props: it awaits `onConfirm`, so a rejection lands in the alert here and a
 * caller only has to write the mutation. `onConfirm` must therefore THROW on
 * failure — a promise that resolves is read as success and closes nothing on
 * its own (closing stays the caller's job, so it can toast first).
 *
 * @param description node, not a string — callers highlight the name inside it
 * @param onConfirm   async () => void. Throw to surface the error.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  pendingLabel = "Working…",
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
}) {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const hdlOpenChange = (next) => {
    // Reopening after a failure should start clean, not show the stale error.
    if (!next) setError(null);
    onOpenChange(next);
  };

  const hdlConfirm = async () => {
    setError(null);
    setIsPending(true);
    try {
      await onConfirm();
    } catch (confirmError) {
      setError(confirmError.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={hdlOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={variant}
            onClick={hdlConfirm}
            disabled={isPending}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
