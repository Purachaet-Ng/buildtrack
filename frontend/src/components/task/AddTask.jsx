/**
 * Create Task dialog — the trigger button plus a TaskDialog seeded empty.
 * Rendered behind `can("task:manage")`: ADMIN and PM. The backend 403s everyone
 * else regardless.
 *
 * `projectId` comes from the caller rather than a picker in the form: this is
 * always opened from inside a project, and a task cannot move between projects
 * afterwards, so choosing one here would be a decision with no undo.
 */

import { TaskDialog } from "@/components/task/TaskDialog";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { useCreateTask } from "@/hooks/useTasks";
import { emptyToNull } from "@/lib/utils";
import { createTaskSchema } from "@/validators/task.validator";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const emptyTask = (projectId) => ({
  projectId,
  name: "",
  description: "",
  // The backend defaults to these too, but the schema requires the fields, so
  // the form has to carry real values.
  status: "TODO",
  priority: "MEDIUM",
  assignedToId: null,
  parentTaskId: null,
  startDate: null,
  dueDate: null,
  progressPercent: 0,
});

/** @param parentTaskId optional — pre-selects this task as the parent. */
export function AddTask({ projectId, parentTaskId = null, label = "สร้างงาน" }) {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask();

  const hdlCreate = async (values) => {
    // zodResolver hands over the TRANSFORMED output: the ids are already
    // numbers or null and the dates are Date objects, which axios serialises to
    // ISO strings and the backend coerces back. Only the free text needs a
    // touch-up, so that a blank field is absent rather than "".
    const body = { ...values, description: emptyToNull(values.description) };

    // Not caught: TaskDialog needs the rejection to map error.errors onto its
    // fields, and "assignee must be a member of this project" is server-only.
    await createTask.mutateAsync(body);
    toast.success("สร้างงานแล้ว", { description: body.name });
    setOpen(false);
  };

  return (
    <TaskDialog
      open={open}
      onOpenChange={setOpen}
      projectId={projectId}
      schema={createTaskSchema}
      defaultValues={{ ...emptyTask(projectId), parentTaskId }}
      onSubmit={hdlCreate}
      title="สร้างงาน"
      description="เพิ่มงานใหม่เข้าโครงการนี้ มอบหมายให้คนในทีมได้ทันที"
      submitLabel="สร้างงาน"
      pendingLabel="กำลังสร้าง…"
      trigger={
        <DialogTrigger asChild>
          <Button>
            <Plus /> {label}
          </Button>
        </DialogTrigger>
      }
    />
  );
}
