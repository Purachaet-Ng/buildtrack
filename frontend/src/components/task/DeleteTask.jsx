/**
 * Delete Task confirmation. Opened from the row menu behind `can("task:manage")`
 * — ADMIN and PM, matching requireRole on the route.
 *
 * `task.parentTaskId` is onDelete: Cascade in schema.prisma, so deleting a
 * parent silently takes its whole sub-tree. That is the one thing this dialog
 * exists to say out loud — `_count.subTasks` rides along on every row from
 * GET /tasks, so the number is already in hand.
 */

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useDeleteTask } from "@/hooks/useTasks";
import { toast } from "sonner";

export function DeleteTask({ task, open, onOpenChange }) {
  const deleteTask = useDeleteTask();

  const subTaskCount = task._count?.subTasks ?? 0;

  // Not caught: ConfirmDialog awaits this and puts the rejection in its alert.
  const hdlDelete = async () => {
    await deleteTask.mutateAsync(task.id);
    // Toast before closing: the invalidation refetch removes this row, which
    // unmounts the dialog along with it.
    toast.success("ลบงานแล้ว", { description: task.name });
    onOpenChange(false);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="ลบงานนี้?"
      description={
        <>
          <span className="font-medium text-heading">{task.name}</span>{" "}
          จะถูกลบถาวร
          {subTaskCount > 0 && (
            <>
              {" "}
              <span className="font-medium text-destructive">
                พร้อมงานย่อยอีก {subTaskCount} งาน
              </span>
            </>
          )}{" "}
          การกระทำนี้ย้อนกลับไม่ได้
        </>
      }
      confirmLabel="ลบงาน"
      pendingLabel="กำลังลบ…"
      cancelLabel="ยกเลิก"
      onConfirm={hdlDelete}
    />
  );
}
