/**
 * GET    /projects                        All     ?page&limit&sort&q&status&clientCompanyId
 * POST   /projects                        ADMIN, PM
 * GET    /projects/:id                    Member
 * PATCH  /projects/:id                    ADMIN, PM
 * DELETE /projects/:id                    ADMIN
 * GET    /projects/:id/summary            Member  KPI strip on the detail page
 * GET    /projects/:id/budget             ADMIN, PM, CLIENT
 * GET    /projects/:id/members            Member
 * POST   /projects/:id/members            ADMIN, PM
 * PATCH  /projects/:id/members/:userId    ADMIN, PM
 * DELETE /projects/:id/members/:userId    ADMIN, PM
 *
 * List response is { data: [...], pagination: { page, limit, total, totalPages } }.
 * `budget` is a STRING and is absent entirely for STAFF — the backend strips it,
 * so guard on `budget === undefined` rather than assuming it is there.
 * `progressPercent` is derived server-side; it is not a column.
 * Sprint 3.
 *
 * Every helper returns the raw envelope (`res.data`), same as users.api.js —
 * unwrapping here would hide `pagination` and `message`. Mind that projects
 * does NOT use the `data` key that users does:
 *
 *   GET  /projects        → { data, pagination }
 *   POST/GET/PATCH /:id   → { message?, project }   ← `project`, not `data`
 *   DELETE /:id           → { message }
 *   GET  /:id/summary     → the summary object itself, unwrapped
 *
 * Errors are not caught: client.js already flattens the envelope into an Error
 * with `.message` / `.status` / `.errors`.
 */

import api from "./client.js";

// ─────────────────────────────────────────────────────────────
// GET    /projects       All   ?page&limit&sort&q&status&clientCompanyId
// ─────────────────────────────────────────────────────────────

/** @param {object} [params] e.g. { page, limit, sort, q, status, clientCompanyId } */
export const getProjects = async (params) => {
  // Passed as an object rather than interpolated: axios encodes the values and
  // drops the undefined ones, so a partial filter cannot produce `?status=undefined`.
  const res = await api.get("/projects", { params });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST   /projects       ADMIN, PM
// ─────────────────────────────────────────────────────────────

/**
 * Required: name, clientCompanyId, startDate, endDate, budget.
 * `status` defaults to PLANNING server-side; omit it rather than guessing.
 * Dates go as "YYYY-MM-DD" strings and `budget` as a string — a JS number
 * loses the 2-decimal precision the Decimal(14,2) column expects.
 */
export const createProject = async (body) => {
  const res = await api.post("/projects", body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// GET    /projects/:id   Member
// ─────────────────────────────────────────────────────────────

export const getProject = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// PATCH  /projects/:id   ADMIN, PM
// ─────────────────────────────────────────────────────────────

/**
 * Partial update — send only the changed fields. An empty body is a 400
 * ("No fields to update"), so callers should skip the request when the form is
 * unchanged rather than firing a no-op patch.
 */
export const editProject = async (id, body) => {
  const res = await api.patch(`/projects/${id}`, body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// DELETE /projects/:id   ADMIN
// ─────────────────────────────────────────────────────────────

/** Hard delete, cascading per the schema (APIs.md) — confirm before calling. */
export const removeProject = async (id) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// GET    /projects/:id/summary   Member
// ─────────────────────────────────────────────────────────────

/**
 * { projectId, name, status, progressPercent, daysRemaining, taskCount,
 *   openIssues } plus budget / spent / remaining / budgetUsedPercent for
 * everyone except STAFF. Unwrapped — there is no envelope on this one.
 */
export const getProjectSummary = async (id) => {
  const res = await api.get(`/projects/${id}/summary`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Budget and members — specified in APIs.md, NOT yet routed
//
// backend/src/routes/projects.route.js currently mounts only the six above;
// these five 404 until the backend lands them. They are written to the APIs.md
// contract so the screens can be built against a stable signature, but do not
// wire them into a query yet.
// ─────────────────────────────────────────────────────────────

/** GET /projects/:id/budget — ADMIN, PM, CLIENT */
export const getProjectBudget = async (id) => {
  const res = await api.get(`/projects/${id}/budget`);
  return res.data;
};

/** GET /projects/:id/members — Member */
export const getProjectMembers = async (id) => {
  const res = await api.get(`/projects/${id}/members`);
  return res.data;
};

/** POST /projects/:id/members — ADMIN, PM */
export const addProjectMember = async (id, body) => {
  const res = await api.post(`/projects/${id}/members`, body);
  return res.data;
};

/** PATCH /projects/:id/members/:userId — ADMIN, PM */
export const editProjectMember = async (id, userId, body) => {
  const res = await api.patch(`/projects/${id}/members/${userId}`, body);
  return res.data;
};

/** DELETE /projects/:id/members/:userId — ADMIN, PM */
export const removeProjectMember = async (id, userId) => {
  const res = await api.delete(`/projects/${id}/members/${userId}`);
  return res.data;
};
