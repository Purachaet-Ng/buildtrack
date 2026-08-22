/**
 * GET    /users            ADMIN, PM    ?page&limit&sort&q&role&companyId
 * POST   /users            ADMIN
 * GET    /users/me         All
 * PATCH  /users/me         All
 * GET    /users/:id        ADMIN, PM
 * PATCH  /users/:id        ADMIN
 * DELETE /users/:id        ADMIN
 *
 * The list returns { data: [...], pagination: { page, limit, total, totalPages } };
 * every other helper returns the raw envelope too, same as projects.api.js —
 * unwrapping here would hide `pagination` and `message`.
 *
 * `passwordHash` never appears: the backend projects every user through
 * users.service.js `userSelect`.
 */

import api from "./client.js";

// ─────────────────────────────────────────────────────────────
// GET    /users        ADMIN, PM    ?page&limit&sort&q&role&companyId
// ─────────────────────────────────────────────────────────────

/**
 * @param {object} [params] e.g. { page, limit, sort, q, role, companyId }
 *
 * Passed as an object rather than interpolated into the path, matching
 * getProjects: axios encodes the values and drops the undefined ones, so a
 * partial filter cannot produce `?role=undefined`. It also lets the hook use
 * the same object as its cache key.
 *
 * Sortable fields the backend honours: createdAt, firstname, lastname, email,
 * role. Anything else silently falls back to -createdAt.
 */
export const getUsers = async (params) => {
  const res = await api.get("/users", { params });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST   /users            ADMIN
// ─────────────────────────────────────────────────────────────

export const createUser = async (body) => {
  const res = await api.post("/users", body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// GET    /users/me         All
// ─────────────────────────────────────────────────────────────

export const getMeUser = async () => {
  const res = await api.get(`/users/me`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// PATCH  /users/me         All
// ─────────────────────────────────────────────────────────────

export const editMeUser = async (body) => {
  const res = await api.patch(`/users/me`, body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// GET    /users/:id        ADMIN, PM
// ─────────────────────────────────────────────────────────────

export const getUser = async (params) => {
  const res = await api.get(`/users/${params}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// PATCH  /users/:id        ADMIN
// ─────────────────────────────────────────────────────────────

export const editUser = async (params, body) => {
  const res = await api.patch(`/users/${params}`, body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
//DELETE /users/:id        ADMIN
// ─────────────────────────────────────────────────────────────
export const removeUser = async (params) => {
  const res = await api.delete(`/users/${params}`);
  return res.data;
};
