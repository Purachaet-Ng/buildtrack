/**
 * The task form, shared by AddTask (POST) and EditTask (PATCH). Owns the dialog
 * chrome, the nine fields, react-hook-form, and the mapping of server errors
 * back onto fields. Callers supply the schema, the starting values, and what to
 * do with the submitted values.
 *
 * The form lives INSIDE DialogContent, not around <Dialog>. DialogContent
 * renders through a portal, so a <form> wrapped around the dialog ends up with
 * none of its inputs and no submit button in the DOM — the submit event never
 * fires.
 *
 * The zod schema is the only validator, hence noValidate: the browser's own
 * constraint checks would block submit before the resolver runs.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjectMembers } from "@/hooks/useMember";
import { useTasks } from "@/hooks/useTasks";
import { PRIORITY_META, TASK_STATUS_META } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

/** The form's field names — also the set of server error fields it can show. */
const FORM_FIELDS = new Set([
  "name",
  "description",
  "status",
  "priority",
  "assignedToId",
  "parentTaskId",
  "startDate",
  "dueDate",
  "progressPercent",
]);

/** Radix Select refuses an item with value="", so "unset" needs a sentinel. */
export const NONE = "NONE";

/** A date field the user has not filled in. Shared by both pickers. */
function DateField({ id, label, control, name, errors }) {
  return (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                id={id}
                aria-invalid={!!errors[name]}
                className="justify-start px-2.5 font-normal"
              >
                <CalendarIcon data-icon="inline-start" />
                {field.value ? (
                  format(field.value, "d MMM yyyy")
                ) : (
                  <span className="text-muted-foreground">ยังไม่กำหนด</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                defaultMonth={field.value ?? undefined}
                selected={field.value ?? undefined}
                // shouldDirty is implicit through field.onChange, but the null
                // branch matters: clearing a date must send null, not undefined,
                // or the PATCH silently leaves the old value in place.
                onSelect={(picked) => field.onChange(picked ?? null)}
              />
              {field.value && (
                <div className="border-t p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => field.onChange(null)}
                  >
                    ล้างวันที่
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      />
      <FieldError errors={errors[name] ? [errors[name]] : undefined} />
    </Field>
  );
}

/**
 * @param projectId    which project's members and top-level tasks to offer
 * @param currentTaskId on edit, the task being edited — excluded from the
 *                      parent picker so it cannot be its own parent
 * @param trigger      optional element rendered as DialogTrigger; omit when the
 *                     caller drives `open` itself (a DropdownMenuItem cannot be
 *                     a trigger — the menu unmounts on close)
 * @param onSubmit     async (values) => void. Throw to surface an error.
 * @param requireDirty disable submit until something changes
 */
export function TaskDialog({
  open,
  onOpenChange,
  projectId,
  currentTaskId,
  schema,
  defaultValues,
  onSubmit,
  title,
  description,
  submitLabel,
  pendingLabel,
  requireDirty = false,
  trigger,
}) {
  // Both only while the dialog is open — a task list has no use for either.
  const { data: members, isLoading: isLoadingMembers } = useProjectMembers(
    open ? projectId : undefined,
  );

  /**
   * Only TOP-LEVEL tasks are offered as parents. The schema supports arbitrary
   * nesting, but a WBS deeper than two levels is unreadable in a flat list and
   * there is no tree view yet — so the depth limit lives here, in the picker,
   * rather than as a rule nobody can see.
   */
  const { data: parentOptions } = useTasks(
    { projectId, parentTaskId: "null", limit: 100, sort: "name" },
    { enabled: open && Boolean(projectId) },
  );

  const memberOptions = members?.data ?? [];
  const parents = (parentOptions?.data ?? []).filter(
    (task) => task.id !== currentTaskId,
  );

  const {
    control,
    register,
    handleSubmit: hdlSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  // Edit seeds its values from a table row, and the same dialog instance is
  // reused for whichever row is open. Re-seeding on open keeps a stale row's
  // values from showing for a moment, and clears a cancelled draft.
  useEffect(() => {
    if (open) reset(defaultValues);
    // defaultValues is rebuilt each render by the caller; keying the effect on
    // `open` alone is what makes this "re-seed on open" rather than a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  const hdlSubmitValues = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // The validate middleware sends errors: [{ field, message }]; client.js
      // flattens it onto error.errors. Anything without a field — a 403 from
      // requireRole, "assignee must be a member of this project" — goes in the
      // banner.
      const named = (error.errors ?? []).filter((issue) =>
        FORM_FIELDS.has(issue.field),
      );

      for (const issue of named) {
        setError(issue.field, { message: issue.message });
      }
      if (named.length === 0) {
        setError("root", { message: error.message });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}

      {/* Same height cap as ProjectFormDialog — see the note there for why both
          vh and svh are needed. */}
      <DialogContent className="flex max-h-[min(90vh,90svh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={hdlSubmit(hdlSubmitValues)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {errors.root && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle />
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}

            {/* gap-5, not FieldGroup's default gap-7: UI-PROMPT.md PROMPT 0
                puts form field gap at 20px. */}
            <FieldGroup className="gap-5">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="task-name">ชื่องาน</FieldLabel>
                <Input
                  id="task-name"
                  type="text"
                  placeholder="เช่น งานเทคอนกรีตชั้น 3"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="task-description">
                  รายละเอียด (ไม่บังคับ)
                </FieldLabel>
                <Textarea
                  id="task-description"
                  rows={3}
                  aria-invalid={!!errors.description}
                  {...register("description")}
                />
                <FieldError
                  errors={errors.description ? [errors.description] : undefined}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={!!errors.status}>
                  <FieldLabel htmlFor="task-status">สถานะ</FieldLabel>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="task-status"
                          className="w-full"
                          aria-invalid={!!errors.status}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TASK_STATUS_META).map(
                            ([value, meta]) => (
                              <SelectItem key={value} value={value}>
                                {meta.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError
                    errors={errors.status ? [errors.status] : undefined}
                  />
                </Field>

                <Field data-invalid={!!errors.priority}>
                  <FieldLabel htmlFor="task-priority">ความสำคัญ</FieldLabel>
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="task-priority"
                          className="w-full"
                          aria-invalid={!!errors.priority}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_META).map(
                            ([value, meta]) => (
                              <SelectItem key={value} value={value}>
                                <span
                                  aria-hidden="true"
                                  className="inline-block size-1.5 rounded-full"
                                  style={{ backgroundColor: meta.color }}
                                />
                                {meta.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError
                    errors={errors.priority ? [errors.priority] : undefined}
                  />
                </Field>
              </div>

              <Field data-invalid={!!errors.assignedToId}>
                <FieldLabel htmlFor="task-assignee">ผู้รับผิดชอบ</FieldLabel>
                <Controller
                  control={control}
                  name="assignedToId"
                  render={({ field }) => (
                    <Select
                      value={
                        field.value === null || field.value === undefined
                          ? NONE
                          : String(field.value)
                      }
                      onValueChange={(value) =>
                        field.onChange(value === NONE ? null : value)
                      }
                      disabled={isLoadingMembers}
                    >
                      <SelectTrigger
                        id="task-assignee"
                        className="w-full"
                        aria-invalid={!!errors.assignedToId}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingMembers ? "กำลังโหลด…" : "ยังไม่มอบหมาย"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>ยังไม่มอบหมาย</SelectItem>
                        {memberOptions.map((member) => (
                          <SelectItem
                            key={member.userId}
                            value={String(member.userId)}
                          >
                            {member.user.firstname} {member.user.lastname} ·{" "}
                            {member.roleInProject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {/* The backend 400s an assignee who is not on the team, so the
                    picker only ever offers members. Saying why keeps that from
                    looking like a missing person. */}
                <FieldDescription>
                  เลือกได้เฉพาะคนที่อยู่ในทีมของโครงการนี้
                </FieldDescription>
                <FieldError
                  errors={errors.assignedToId ? [errors.assignedToId] : undefined}
                />
              </Field>

              <Field data-invalid={!!errors.parentTaskId}>
                <FieldLabel htmlFor="task-parent">
                  งานหลัก (ไม่บังคับ)
                </FieldLabel>
                <Controller
                  control={control}
                  name="parentTaskId"
                  render={({ field }) => (
                    <Select
                      value={
                        field.value === null || field.value === undefined
                          ? NONE
                          : String(field.value)
                      }
                      onValueChange={(value) =>
                        field.onChange(value === NONE ? null : value)
                      }
                    >
                      <SelectTrigger
                        id="task-parent"
                        className="w-full"
                        aria-invalid={!!errors.parentTaskId}
                      >
                        <SelectValue placeholder="เป็นงานหลัก" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>เป็นงานหลัก</SelectItem>
                        {parents.map((task) => (
                          <SelectItem key={task.id} value={String(task.id)}>
                            {task.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  errors={errors.parentTaskId ? [errors.parentTaskId] : undefined}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <DateField
                  id="task-start"
                  label="วันเริ่ม"
                  name="startDate"
                  control={control}
                  errors={errors}
                />
                <DateField
                  id="task-due"
                  label="กำหนดเสร็จ"
                  name="dueDate"
                  control={control}
                  errors={errors}
                />
              </div>

              <Field data-invalid={!!errors.progressPercent}>
                <FieldLabel htmlFor="task-progress">
                  ความคืบหน้า (%)
                </FieldLabel>
                <Input
                  id="task-progress"
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  inputMode="numeric"
                  aria-invalid={!!errors.progressPercent}
                  {...register("progressPercent")}
                />
                <FieldError
                  errors={
                    errors.progressPercent ? [errors.progressPercent] : undefined
                  }
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                ยกเลิก
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || (requireDirty && !isDirty)}
            >
              {isSubmitting ? pendingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
