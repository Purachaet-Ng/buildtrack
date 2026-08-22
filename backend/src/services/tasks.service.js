import { prisma } from "../lib/prisma.js";
import { buildProjectScope, isProjectMember } from "./projects.service.js";
import { findUserById } from "./users.service.js";

/**
 * What every task response carries. The assignee goes through an explicit
 * select rather than users.service.js `userSelect` — a task list does not need
 * the assignee's email, phone and company on every row.
 */
const taskInclude = {
  project: { select: { id: true, name: true, clientCompanyId: true } },
  assignedTo: {
    select: { id: true, firstname: true, lastname: true, role: true },
  },
  parentTask: { select: { id: true, name: true } },
  _count: { select: { subTasks: true, comments: true } },
};

// ─────────────────────────────────────────────────────────────
// Visibility
// ─────────────────────────────────────────────────────────────

/**
 * A task is visible when its PROJECT is visible, so the project scope from
 * projects.service.js nests straight into the task `where` rather than being
 * reimplemented:
 *   ADMIN   → every task
 *   CLIENT  → tasks on projects owned by their company
 *   PM/STAFF→ tasks on projects they are a member of
 */
export const buildTaskScope = async (user) => {
  const projectScope = await buildProjectScope(user);

  // ADMIN's scope is {} — nesting that would emit `project: {}`, which Prisma
  // reads as "has a project" rather than "no filter". Harmless but pointless.
  if (Object.keys(projectScope).length === 0) return {};

  return { project: projectScope };
};

/** Can this user read the given task? Mirrors canAccessProject. */
export const canAccessTask = async (user, task) => {
  if (user.role === "ADMIN") return true;

  if (user.role === "CLIENT") {
    const account = await findUserById(user.id);
    return (
      Boolean(account?.companyId) &&
      account.companyId === task.project.clientCompanyId
    );
  }

  return isProjectMember(task.projectId, user.id);
};

const isAssignee = (user, task) => task.assignedToUserId === user.id;

/**
 * PATCH /tasks/:id/status — the one rule in this app that is per-role AND
 * per-transition, which is why it cannot live in requireRole.
 *
 *   ADMIN   any transition
 *   PM      any transition (on a project they belong to — checked by the caller)
 *   STAFF   only their own assigned tasks, and never to APPROVED: signing off
 *           your own work is exactly what the REVIEW state exists to prevent
 *   CLIENT  only to APPROVED, and nothing else — this is the single write a
 *           CLIENT is permitted anywhere in the system (WORKFLOWS.md U-3.9)
 *
 * Callers must have already established that the user can SEE the task; this
 * answers only "may they make this particular change".
 */
export const canTransitionStatus = (user, task, nextStatus) => {
  switch (user.role) {
    case "ADMIN":
    case "PROJECT_MANAGER":
      return true;
    case "STAFF":
      return isAssignee(user, task) && nextStatus !== "APPROVED";
    case "CLIENT":
      return nextStatus === "APPROVED";
    default:
      return false;
  }
};

/** PATCH /tasks/:id/progress — ADMIN, PM, or the person doing the work. */
export const canUpdateProgress = (user, task) => {
  if (user.role === "ADMIN" || user.role === "PROJECT_MANAGER") return true;
  if (user.role === "STAFF") return isAssignee(user, task);
  return false;
};

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export const findTasks = async (where, { skip, limit, orderBy }) => {
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take: limit, orderBy, include: taskInclude }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total };
};

export const findTaskById = async (id) =>
  await prisma.task.findUnique({ where: { id }, include: taskInclude });

/** Raw row without the includes — for ownership checks before update/delete. */
export const findTaskRow = async (id) =>
  await prisma.task.findUnique({ where: { id } });

export const taskExists = async (id) => {
  const task = await prisma.task.findUnique({ where: { id }, select: { id: true } });
  return Boolean(task);
};

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

export const createTask = async (data) =>
  await prisma.task.create({ data, include: taskInclude });

export const updateTask = async (id, data) =>
  await prisma.task.update({ where: { id }, data, include: taskInclude });

/**
 * Hard delete. `parentTaskId` is onDelete: Cascade, so deleting a parent takes
 * its sub-tasks with it — the confirm dialog has to say so.
 */
export const deleteTask = async (id) => {
  await prisma.task.delete({ where: { id } });
};
