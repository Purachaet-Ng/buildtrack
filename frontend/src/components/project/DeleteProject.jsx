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
 * The chrome, the pending state and the error alert live in ConfirmDialog; what
 * stays here is the sentence and the mutation. Controlled by the caller: the
 * trigger is a DropdownMenuItem, and a dialog rendered inside
 * DropdownMenuContent is unmounted the instant the menu closes.
 */

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useDeleteProject } from "@/hooks/useProject";
import { toast } from "sonner";

/** "3 tasks", "1 task", or null when there is nothing of that kind to lose. */
const countLabel = (count, singular) => {
  if (!count) return null;
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
};

/**
 * @param onDeleted optional. ProjectsPage does not need it — the invalidation
 *                  refetch drops the row and unmounts this dialog with it. The
 *                  DETAIL page does: it is sitting on a URL that has just
 *                  stopped existing, so it passes a navigate back to /projects.
 */
export function DeleteProject({ project, open, onOpenChange, onDeleted }) {
  const deleteProject = useDeleteProject();

  // _count rides along on every row from GET /projects. Documents, reports and
  // expenses cascade too but are not counted there, hence "and everything else
  // attached to it" below rather than a list that pretends to be exhaustive.
  const losses = [
    countLabel(project._count?.tasks, "task"),
    countLabel(project._count?.issues, "issue"),
    countLabel(project._count?.members, "team member"),
  ].filter(Boolean);

  // Not caught: ConfirmDialog awaits this and puts the rejection in its alert.
  const hdlDelete = async () => {
    await deleteProject.mutateAsync(project.id);
    // Toast before closing: the invalidation refetch removes this row, which
    // unmounts the dialog along with it.
    toast.success("Project deleted", { description: project.name });
    onOpenChange(false);
    onDeleted?.();
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete project?"
      description={
        <>
          <span className="font-medium text-heading">{project.name}</span> will
          be permanently deleted
          {losses.length > 0 && <>, along with its {losses.join(", ")}</>} and
          everything else attached to it. This cannot be undone.
        </>
      }
      confirmLabel="Delete Project"
      pendingLabel="Deleting…"
      onConfirm={hdlDelete}
    />
  );
}
