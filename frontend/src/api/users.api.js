/**
 * GET    /users            ADMIN        ?page&limit&sort&q&role
 * POST   /users            ADMIN
 * GET    /users/me         All
 * PATCH  /users/me         All
 * GET    /users/:id        ADMIN, PM
 * PATCH  /users/:id        ADMIN
 * DELETE /users/:id        ADMIN
 *
 * Sprint 2 (me) / Sprint 8 (admin screens).
 */

import api from "./client.js";

// ─────────────────────────────────────────────────────────────
// GET    /users            ADMIN        ?page&limit&sort&q&role
// ─────────────────────────────────────────────────────────────

export const getUsers = async (q) => {
  const res = await api.get(`/users?${q}`);
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
