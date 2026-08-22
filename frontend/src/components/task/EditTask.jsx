/**
 * Edit Task dialog. Opened from the row menu behind `can("task:manage")`:
 * ADMIN and PM. The backend additionally 403s a PM who is not a member of the
 * task's project.
 *
 * Controlled by the caller rather than owning a DialogTrigger: the trigger is a
 * DropdownMenuItem, and a dialog rendered inside DropdownMenuContent is
 * unmounted the instant the menu closes.
 */

import { TaskDialog } from "@/components/task/TaskDialog";
import { useUpdateTask } from "@/hooks/useTasks";
import { emptyToNull } from "@/lib/utils";
import { updateTaskSchema } from "@/validators/task.validator";
import { parseISO } from "date-fns";
import { toast } from "sonner";

/**
 * The list response already carries every field the form needs, so editing a
 * row costs no extra request.
 *
 * Three conversions matter. The dates arrive as ISO strings and the Calendar
 * wants Date objects. `description` is nullable, and feeding null to a textarea
 * flips it from uncontrolled to controlled on the first keystroke — React warns
 * and the field misbehaves. And the row carries `assignedToUserId` (the column)
 * while the form and the API body both use `assignedToId` (the wire name).
 */
const toFormValues = (task) => ({
  name: task.name ?? "",
  description: task.description ?? "",
  status: task.status ?? "TODO",
  priority: task.priority ?? "MEDIUM",
  assignedToId: task.assignedToUserId ?? null,
  parentTaskId: task.parentTaskId ?? null,
  startDate: task.startDate ? parseISO(task.startDate) : null,
  dueDate: task.dueDate ? parseISO(task.dueDate) : null,
  progressPercent: task.progressPercent ?? 0,
});

export function EditTask({ task, open, onOpenChange }) {
  const updateTask = useUpdateTask();

  const hdlUpdate = async (values) => {
    // The full body, not a diff. updateTaskSchema is .partial() so a complete
    // body is valid, and the backend re-validates every field anyway. What
    // APIs.md asks for — no no-op patch — is handled by requireDirty on the
    // submit button, which is far more reliable than diffing react-hook-form's
    // dirtyFields (its equality check on Date objects is the part that would
    // quietly break the dates).
    const body = { ...values, description: emptyToNull(values.description) };

    // Not caught: TaskDialog maps error.errors onto its fields.
    await updateTask.mutateAsync({ id: task.id, body });
    toast.success("บันทึกการแก้ไขแล้ว", { description: body.name });
    onOpenChange(false);
  };

  return (
    <TaskDialog
      open={open}
      onOpenChange={onOpenChange}
      projectId={task.projectId}
      currentTaskId={task.id}
      schema={updateTaskSchema}
      defaultValues={toFormValues(task)}
      onSubmit={hdlUpdate}
      title="แก้ไขงาน"
      description={`ปรับรายละเอียดของ ${task.name}`}
      submitLabel="บันทึก"
      pendingLabel="กำลังบันทึก…"
      requireDirty
    />
  );
}
