/**
 * Delete User confirmation. Opened from the row menu in UsersPage behind
 * `can("user:manage")` — ADMIN only.
 *
 * This one frequently FAILS on purpose, and that is the interesting case.
 * `document.uploaded_by`, `daily_report.reported_by`, `expense.recorded_by` and
 * `issue.reported_by` are all onDelete: Restrict, so a user who has actually
 * done work on a site cannot be removed. The controller turns the Postgres
 * restrict violation into a specific message; ConfirmDialog shows it in place
 * rather than closing on a toast that says nothing useful.
 *
 * What does NOT block a delete: project memberships and assigned tasks, which
 * cascade and SetNull respectively.
 */

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useDeleteUser } from "@/hooks/useUsers";
import { toast } from "sonner";

export function DeleteUser({ user, open, onOpenChange }) {
  const deleteUser = useDeleteUser();

  const fullName = `${user.firstname} ${user.lastname}`;

  // Not caught: ConfirmDialog awaits this and puts the rejection in its alert.
  const hdlDelete = async () => {
    await deleteUser.mutateAsync(user.id);
    // Toast before closing: the invalidation refetch removes this row, which
    // unmounts the dialog along with it.
    toast.success("User deleted", { description: user.email });
    onOpenChange(false);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete user?"
      description={
        <>
          <span className="font-medium text-heading">{fullName}</span> will lose
          access immediately and be removed from every project team. Tasks
          assigned to them stay on their projects, unassigned. This cannot be
          undone.
        </>
      }
      confirmLabel="Delete User"
      pendingLabel="Deleting…"
      onConfirm={hdlDelete}
    />
  );
}
