/**
 * Delete Project confirmation. Opened from the row menu in ProjectsPage behind
 * `can("project:delete")` — ADMIN only, matching requireRole on the route.
 *
 * DELETE /projects/:id is a HARD delete. Every relation in schema.prisma is
 * onDelete: Cascade, so the tasks, members, documents, daily reports, expenses,
 * issues and comments go with it. There is no soft delete and nothing to undo,
 * which is why this dialog names the project and counts what it is taking
 * rather than asking a generic "are you sure?".
 *
 * Controlled by the caller: the trigger is a DropdownMenuItem, and a dialog
 * rendered inside DropdownMenuContent is unmounted the instant the menu closes.
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
import { useDeleteProject } from "@/hooks/useProject";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** "3 tasks", "1 task", or null when there is nothing of that kind to lose. */
const countLabel = (count, singular) => {
  if (!count) return null;
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
};

export function DeleteProject({ project, open, onOpenChange }) {
  const deleteProject = useDeleteProject();
  const [error, setError] = useState(null);

  // _count rides along on every row from GET /projects. Documents, reports and
  // expenses cascade too but are not counted there, hence "and everything else
  // attached to it" below rather than a list that pretends to be exhaustive.
  const losses = [
    countLabel(project._count?.tasks, "task"),
    countLabel(project._count?.issues, "issue"),
    countLabel(project._count?.members, "team member"),
  ].filter(Boolean);

  const hdlOpenChange = (next) => {
    if (!next) setError(null);
    onOpenChange(next);
  };

  const hdlDelete = async () => {
    setError(null);
    try {
      await deleteProject.mutateAsync(project.id);
      // Toast before closing: the invalidation refetch removes this row, which
      // unmounts the dialog along with it.
      toast.success("Project deleted", { description: project.name });
      onOpenChange(false);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={hdlOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-heading">{project.name}</span>{" "}
            will be permanently deleted
            {losses.length > 0 && <>, along with its {losses.join(", ")}</>} and
            everything else attached to it. This cannot be undone.
          </DialogDescription>
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
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={hdlDelete}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? "Deleting…" : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
