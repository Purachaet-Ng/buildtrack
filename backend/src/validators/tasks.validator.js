import { z } from "zod";
import { Priority, TaskStatus } from "../../generated/prisma/client.js";
import { buildOrderBy, DEFAULT_LIMIT, MAX_LIMIT } from "../utils/query.js";

const TASK_STATUSES = Object.values(TaskStatus);
const PRIORITIES = Object.values(Priority);

const SORTABLE_FIELDS = [
  "createdAt",
  "name",
  "status",
  "priority",
  "dueDate",
  "progressPercent",
];

// ─────────────────────────────────────────────────────────────
// Field helpers
// ─────────────────────────────────────────────────────────────

/** `?status=` and `?assignedToId=` arrive as "" — treat as "not sent". */
const emptyToUndefined = (schema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const positiveId = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message);

/**
 * z.coerce.date() would happily read a raw number as epoch ms,
 * so only strings / Date objects get through.
 */
const isoDate = (field) => {
  const message = `${field} must be a valid date (YYYY-MM-DD)`;
  return z
    .union([z.string(), z.date()], { error: message })
    .pipe(z.coerce.date({ error: message }));
};

const status = z.enum(TASK_STATUSES, {
  error: `status must be one of ${TASK_STATUSES.join(", ")}`,
});

const priority = z.enum(PRIORITIES, {
  error: `priority must be one of ${PRIORITIES.join(", ")}`,
});

const name = z
  .string({ error: "name is required" })
  .trim()
  .min(1, "name must not be empty")
  .max(200, "name must be at most 200 characters");

/**
 * 0–100. This is the only numeric field a STAFF user can write, so these bounds
 * are the whole guard — the column itself is a plain Int with no CHECK.
 */
const progressPercent = z.coerce
  .number({ error: "progressPercent must be a number" })
  .int("progressPercent must be a whole number")
  .min(0, "progressPercent must be between 0 and 100")
  .max(100, "progressPercent must be between 0 and 100");

const endsAfterStart = (data) =>
  !(data.startDate && data.dueDate) || data.dueDate >= data.startDate;
const endsAfterStartError = {
  error: "dueDate must be after startDate",
  path: ["dueDate"],
};

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

export const taskParams = z.object({
  id: positiveId("Invalid task id"),
});

/**
 * APIs.md names the filter `assignedToId`, but the Prisma column is
 * `assignedToUserId`. The rename happens HERE, in the transform, so the service
 * layer only ever deals in the domain name and no controller has to remember
 * which of the two it is holding.
 *
 * `parentTaskId` carries three distinct meanings and they must stay distinct:
 *   absent  → do not filter on parent at all
 *   "null"  → top-level tasks only (an explicit SQL NULL)
 *   a number→ the sub-tasks of that parent
 * Coercing "null" with positiveId would produce NaN and silently filter nothing,
 * which is why it is pulled out before the number branch ever sees it.
 */
export const taskListQuery = z
  .object({
    // "" and junk fall back to the defaults instead of erroring
    page: emptyToUndefined(z.coerce.number().int().catch(1)),
    limit: emptyToUndefined(z.coerce.number().int().catch(DEFAULT_LIMIT)),
    sort: z.string().optional(),
    q: z.string().trim().optional(),
    projectId: emptyToUndefined(
      positiveId("projectId must be a positive integer").optional(),
    ),
    status: emptyToUndefined(status.optional()),
    priority: emptyToUndefined(priority.optional()),
    assignedToId: emptyToUndefined(
      positiveId("assignedToId must be a positive integer").optional(),
    ),
    parentTaskId: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .union([
          z.literal("null").transform(() => null),
          positiveId("parentTaskId must be a positive integer or null"),
        ])
        .optional(),
    ),
    dueBefore: emptyToUndefined(isoDate("dueBefore").optional()),
  })
  .transform(({ page, limit, sort, assignedToId, ...rest }) => {
    // Out-of-range paging is clamped rather than rejected (APIs.md: max 100)
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));

    return {
      ...rest,
      assignedToUserId: assignedToId,
      page: safePage,
      limit: safeLimit,
      skip: (safePage - 1) * safeLimit,
      orderBy: buildOrderBy(sort, SORTABLE_FIELDS),
    };
  });

/**
 * `projectId` is required and immutable: a task cannot be moved between
 * projects, because its parent task, assignee and expenses are all scoped to
 * the one it was created in. That is why it is absent from updateTaskBody.
 *
 * The wire name for the assignee is `assignedToId` (APIs.md / WORKFLOWS.md);
 * `.transform()` renames it to the column name on the way through.
 */
const taskShape = {
  name,
  description: z.string().trim().nullish(),
  status,
  priority,
  assignedToId: positiveId("assignedToId must be a positive integer").nullish(),
  parentTaskId: positiveId("parentTaskId must be a positive integer").nullish(),
  startDate: isoDate("startDate").nullish(),
  dueDate: isoDate("dueDate").nullish(),
  progressPercent,
};

/** Wire name → column name, applied after parsing on both create and update. */
const renameAssignee = ({ assignedToId, ...rest }) =>
  assignedToId === undefined ? rest : { ...rest, assignedToUserId: assignedToId };

/**
 * The three `.default()`s live HERE and not on the shared shape, for the same
 * reason they do in users.validator.js: `.partial()` keeps a default alive, so
 * a PATCH that only renames a task would quietly reset its status to TODO and
 * its progress to 0.
 */
export const createTaskBody = z
  .object({
    projectId: positiveId("projectId must be a positive integer"),
    ...taskShape,
    status: status.default("TODO"),
    priority: priority.default("MEDIUM"),
    progressPercent: progressPercent.default(0),
  })
  .refine(endsAfterStart, endsAfterStartError)
  .transform(renameAssignee);

export const updateTaskBody = z
  .object(taskShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "No fields to update",
  })
  // Only checkable here when both dates are sent; otherwise the controller
  // compares against the stored row.
  .refine(endsAfterStart, endsAfterStartError)
  .transform(renameAssignee);

/** PATCH /tasks/:id/status — the Kanban drag and the approve action. */
export const updateStatusBody = z.object({
  status: z.enum(TASK_STATUSES, {
    error: `status must be one of ${TASK_STATUSES.join(", ")}`,
  }),
});

/** PATCH /tasks/:id/progress — the engineer's recurring write. */
export const updateProgressBody = z.object({ progressPercent });
