import createHttpError from "http-errors";
import {
  buildTaskScope,
  canAccessTask,
  canTransitionStatus,
  canUpdateProgress,
  createTask,
  deleteTask,
  findTaskById,
  findTasks,
  updateTask,
} from "../services/tasks.service.js";
import {
  canAccessProject,
  findProjectRow,
  isProjectMember,
} from "../services/projects.service.js";
import { buildPagination } from "../utils/query.js";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Loads the task and throws 404 / 403 before the handler touches it.
 *
 * 403 and not 404 for a task on a project you cannot see: WORKFLOWS.md asks for
 * one answer applied consistently, and the projects and members controllers
 * already answer 403.
 */
const loadAccessibleTask = async (user, id) => {
  const task = await findTaskById(id);
  if (!task) throw createHttpError(404, "Task not found");

  if (!(await canAccessTask(user, task))) {
    throw createHttpError(
      403,
      "Forbidden: you are not a member of this project",
    );
  }
  return task;
};

/** 404 if the project is gone, 403 if the caller cannot reach it. */
const assertProjectAccess = async (user, projectId) => {
  const project = await findProjectRow(projectId);
  if (!project) throw createHttpError(404, "Project not found");

  if (!(await canAccessProject(user, project))) {
    throw createHttpError(
      403,
      "Forbidden: you are not a member of this project",
    );
  }
  return project;
};

/**
 * A sub-task must belong to the same project as its parent. Without this a
 * task could be nested under a parent in a project the caller cannot even see,
 * which would leak the parent's name through the task's own response.
 */
const assertParentInProject = async (parentTaskId, projectId, selfId) => {
  if (parentTaskId === null || parentTaskId === undefined) return;

  if (selfId !== undefined && parentTaskId === selfId) {
    throw createHttpError(400, "A task cannot be its own parent");
  }

  const parent = await findTaskById(parentTaskId);
  if (!parent) throw createHttpError(404, "Parent task not found");

  if (parent.projectId !== projectId) {
    throw createHttpError(400, "Parent task must be in the same project");
  }
};

/**
 * You can only assign work to someone on the project team. ADMIN is exempt from
 * nothing here — an admin assigning a non-member would create a task its
 * assignee cannot see, because task visibility runs through project membership.
 */
const assertAssigneeIsMember = async (assignedToUserId, projectId) => {
  if (assignedToUserId === null || assignedToUserId === undefined) return;

  if (!(await isProjectMember(projectId, assignedToUserId))) {
    throw createHttpError(
      400,
      "Assignee must be a member of this project — add them to the team first",
    );
  }
};

// ─────────────────────────────────────────────────────────────
// GET /tasks
// ─────────────────────────────────────────────────────────────

export async function listTasks(req, res) {
  const {
    page,
    limit,
    skip,
    orderBy,
    q,
    projectId,
    status,
    priority,
    assignedToUserId,
    parentTaskId,
    dueBefore,
  } = req.valid.query;

  const where = { ...(await buildTaskScope(req.user)) };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assignedToUserId) where.assignedToUserId = assignedToUserId;

  // `null` is a real filter here (top-level tasks only) and `undefined` means
  // "do not filter", so this cannot collapse into a truthiness check.
  if (parentTaskId !== undefined) where.parentTaskId = parentTaskId;

  if (dueBefore) where.dueDate = { lt: dueBefore };

  const { tasks, total } = await findTasks(where, { skip, limit, orderBy });

  res.status(200).json({
    data: tasks,
    pagination: buildPagination({ page, limit, total }),
  });
}

// ─────────────────────────────────────────────────────────────
// POST /tasks
// ─────────────────────────────────────────────────────────────

export async function addTask(req, res) {
  const data = req.valid.body;

  // A PM may only create tasks on a project they belong to; ADMIN, anywhere.
  await assertProjectAccess(req.user, data.projectId);
  await assertParentInProject(data.parentTaskId, data.projectId);
  await assertAssigneeIsMember(data.assignedToUserId, data.projectId);

  const task = await createTask({
    ...data,
    description: data.description ?? null,
  });

  res.status(201).json({ message: "Task created", task });
}

// ─────────────────────────────────────────────────────────────
// GET /tasks/:id
// ─────────────────────────────────────────────────────────────

export async function getTask(req, res) {
  const task = await loadAccessibleTask(req.user, req.valid.params.id);

  res.status(200).json({ task });
}

// ─────────────────────────────────────────────────────────────
// PATCH /tasks/:id
// ─────────────────────────────────────────────────────────────

export async function editTask(req, res) {
  const { id } = req.valid.params;
  const data = req.valid.body;

  const existing = await loadAccessibleTask(req.user, id);

  // projectId is not editable — a task cannot move between projects, so every
  // check below is against the project it already belongs to.
  await assertParentInProject(data.parentTaskId, existing.projectId, id);
  await assertAssigneeIsMember(data.assignedToUserId, existing.projectId);

  // One date sent, the other kept — compare against what is stored
  const start = data.startDate ?? existing.startDate;
  const due = data.dueDate ?? existing.dueDate;
  if (start && due && due < start) {
    throw createHttpError(400, "dueDate must be after startDate");
  }

  const task = await updateTask(id, data);

  res.status(200).json({ message: "Task updated", task });
}

// ─────────────────────────────────────────────────────────────
// DELETE /tasks/:id
// ─────────────────────────────────────────────────────────────

export async function removeTask(req, res) {
  const { id } = req.valid.params;

  await loadAccessibleTask(req.user, id);

  // Sub-tasks cascade from the schema — the client is warned before it calls.
  await deleteTask(id);

  res.status(200).json({ message: "Task deleted" });
}

// ─────────────────────────────────────────────────────────────
// PATCH /tasks/:id/status      ← the Kanban drag and the approve action
// ─────────────────────────────────────────────────────────────

export async function changeTaskStatus(req, res) {
  const { id } = req.valid.params;
  const { status } = req.valid.body;

  const existing = await loadAccessibleTask(req.user, id);

  if (!canTransitionStatus(req.user, existing, status)) {
    throw createHttpError(
      403,
      "Forbidden: You can update only your assigned task",
    );
  }

  const task = await updateTask(id, { status });

  res.status(200).json({ message: "Task status updated", task });
}

// ─────────────────────────────────────────────────────────────
// PATCH /tasks/:id/progress
// ─────────────────────────────────────────────────────────────

export async function changeTaskProgress(req, res) {
  const { id } = req.valid.params;
  const { progressPercent } = req.valid.body;

  const existing = await loadAccessibleTask(req.user, id);

  if (!canUpdateProgress(req.user, existing)) {
    throw createHttpError(
      403,
      "Forbidden: You can update only your assigned task",
    );
  }

  const task = await updateTask(id, { progressPercent });

  res.status(200).json({ message: "Task progress updated", task });
}
