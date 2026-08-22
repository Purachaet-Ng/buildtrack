/**
 * GET    /tasks                 Member  ?projectId&status&priority&assignedToId
 *                                       &parentTaskId&dueBefore&q&page&limit&sort
 * POST   /tasks                 ADMIN, PM
 * GET    /tasks/:id             Member
 * PATCH  /tasks/:id             ADMIN, PM
 * DELETE /tasks/:id             ADMIN, PM
 * PATCH  /tasks/:id/status      ADMIN, PM, assignee — and CLIENT for APPROVED only
 * PATCH  /tasks/:id/progress    ADMIN, PM, assignee
 *
 * Envelopes, same split as projects.api.js:
 *   GET  /tasks       → { data, pagination }
 *   POST/GET/PATCH /:id → { message?, task }   ← `task`, not `data`
 *   DELETE /:id       → { message }
 *
 * The wire name for the assignee is `assignedToId` on the way IN (both the
 * filter and the body) but the row comes back with `assignedToUserId`, because
 * that is the column. The backend renames it in tasks.validator.js; this file
 * just has to be consistent about which side is which.
 *
 * `GET /projects/:id/tasks/board` is deliberately absent — it exists only to
 * feed the Kanban board, which is PHASE 2 / OPTIONAL (PLAN.md §4). Add it with
 * the board, not before: an endpoint with no caller is untested by definition.
 *
 * Errors are not caught: client.js already flattens the envelope into an Error
 * with `.message` / `.status` / `.errors`.
 */

import api from "./client.js";

// ─────────────────────────────────────────────────────────────
// GET /tasks
// ─────────────────────────────────────────────────────────────

/**
 * @param {object} [params] e.g. { projectId, status, priority, assignedToId,
 *                                 parentTaskId, dueBefore, q, page, limit, sort }
 *
 * Passed as an object rather than interpolated, matching getProjects: axios
 * encodes the values and drops the undefined ones, so a partial filter cannot
 * produce `?status=undefined`.
 *
 * `parentTaskId: "null"` is meaningful — it asks for top-level tasks only, and
 * is NOT the same as omitting the param.
 */
export const getTasks = async (params) => {
  const res = await api.get("/tasks", { params });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST /tasks
// ─────────────────────────────────────────────────────────────

/**
 * Required: projectId, name. Everything else has a server-side default —
 * status TODO, priority MEDIUM, progressPercent 0.
 *
 * The assignee must already be a member of the project; the API answers 400
 * otherwise, because task visibility runs through project membership and an
 * outsider would not be able to see the task assigned to them.
 */
export const createTask = async (body) => {
  const res = await api.post("/tasks", body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// GET /tasks/:id
// ─────────────────────────────────────────────────────────────

export const getTask = async (id) => {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// PATCH /tasks/:id
// ─────────────────────────────────────────────────────────────

/**
 * Partial update — an empty body is a 400 ("No fields to update").
 * `projectId` is NOT editable: a task cannot move between projects, since its
 * parent, assignee and expenses are all scoped to the one it was created in.
 */
export const editTask = async (id, body) => {
  const res = await api.patch(`/tasks/${id}`, body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// DELETE /tasks/:id
// ─────────────────────────────────────────────────────────────

/** Hard delete. Sub-tasks cascade — confirm before calling. */
export const removeTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// PATCH /tasks/:id/status
// ─────────────────────────────────────────────────────────────

/**
 * The one endpoint whose permission depends on the VALUE being sent, not just
 * on the caller's role:
 *
 *   ADMIN / PM  any transition
 *   STAFF       own tasks only, and never to APPROVED
 *   CLIENT      only to APPROVED — their single write in the whole app
 *
 * A 403 here is therefore a normal outcome for a legitimate user, not a bug.
 * Surface `error.message`; the API sends the specific reason.
 */
export const changeTaskStatus = async (id, status) => {
  const res = await api.patch(`/tasks/${id}/status`, { status });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// PATCH /tasks/:id/progress
// ─────────────────────────────────────────────────────────────

/** 0–100, whole numbers. ADMIN, PM, or the assignee. */
export const changeTaskProgress = async (id, progressPercent) => {
  const res = await api.patch(`/tasks/${id}/progress`, { progressPercent });
  return res.data;
};
