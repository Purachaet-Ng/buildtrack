/**
 * Mirrors backend/src/validators/tasks.validator.js so a bad value is caught
 * before the round-trip. The backend re-validates everything regardless.
 *
 * Messages render verbatim under the inputs, so they are written for the person
 * filling the form.
 *
 * The wire name for the assignee is `assignedToId`, not the column name
 * `assignedToUserId` the API returns on a row — EditTask maps between them.
 */

import { PRIORITY, TASK_STATUS } from "@/lib/constants";
import { z } from "zod";

const TASK_STATUSES = Object.values(TASK_STATUS);
const PRIORITIES = Object.values(PRIORITY);

/**
 * The message is repeated on each branch of the union on purpose: an undefined
 * value fails the branches before the union-level error is reached, and zod
 * reports the branch's own message if you leave it unset.
 */
const isoDate = (field) => {
  const message = `${field} must be a valid date`;
  return z
    .union([z.string({ error: message }), z.date({ error: message })], {
      error: message,
    })
    .pipe(z.coerce.date({ error: message }));
};

const name = z
  .string({ error: "Task name is required" })
  .trim()
  .min(1, "Task name is required")
  .max(200, "Task name must be at most 200 characters");

const status = z.enum(TASK_STATUSES, { error: "Select a valid status" });
const priority = z.enum(PRIORITIES, { error: "Select a valid priority" });

const progressPercent = z.coerce
  .number({ error: "Progress must be a number" })
  .int("Progress must be a whole number")
  .min(0, "Progress must be between 0 and 100")
  .max(100, "Progress must be between 0 and 100");

/**
 * Optional foreign keys. The Selects use a `NONE` sentinel for the empty case
 * (Radix refuses value="") and the form maps it back to null before this schema
 * sees it — the same trick UserFormDialog uses for `companyId`.
 */
const optionalId = (label) =>
  z
    .union([z.literal(""), z.null(), z.undefined(), z.coerce.number()])
    .transform((value) =>
      value === "" || value === undefined ? null : value,
    )
    .refine(
      (value) => value === null || (Number.isInteger(value) && value > 0),
      { error: `Select a valid ${label}` },
    );

/** A blank date field means "no date", not an invalid one. */
const optionalDate = (field) =>
  z
    .union([z.literal(""), z.null(), z.undefined(), isoDate(field)])
    .transform((value) =>
      value === "" || value === undefined ? null : value,
    );

const taskShape = {
  name,
  description: z.string().trim().nullish(),
  status,
  priority,
  assignedToId: optionalId("assignee"),
  parentTaskId: optionalId("parent task"),
  startDate: optionalDate("Start date"),
  dueDate: optionalDate("Due date"),
  progressPercent,
};

/** Only checkable when both dates are present — either may be blank. */
const endsAfterStart = (data) =>
  !(data.startDate && data.dueDate) || data.dueDate >= data.startDate;
const endsAfterStartError = {
  error: "Due date must be after the start date",
  path: ["dueDate"],
};

export const createTaskSchema = z
  .object({
    projectId: z.coerce
      .number({ error: "Select a project" })
      .int()
      .positive("Select a project"),
    ...taskShape,
  })
  .refine(endsAfterStart, endsAfterStartError);

/**
 * `.partial()` so a complete body is valid — EditTask sends every field rather
 * than diffing, exactly as EditProject does, and relies on `requireDirty` to
 * keep an untouched form from firing a no-op PATCH.
 *
 * `projectId` is absent by design: a task cannot move between projects.
 */
export const updateTaskSchema = z
  .object(taskShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "No fields to update",
  })
  .refine(endsAfterStart, endsAfterStartError);

/** The standalone progress write, used by ProgressInput. */
export const progressSchema = z.object({ progressPercent });
