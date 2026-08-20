/**
 * GET    /companies        ADMIN, PM
 * POST   /companies        ADMIN
 * GET    /companies/:id    ADMIN, PM
 * PATCH  /companies/:id    ADMIN
 * DELETE /companies/:id    ADMIN
 *
 * Deleting a company that still has users or projects returns an error listing
 * what blocks it — surface that list, not a generic toast.
 * Sprint 3 (select options) / Sprint 8 (admin screen).
 */

import api from "./client.js";
// ─────────────────────────────────────────────────────────────
// GET    /companies      ADMIN, PM
// ─────────────────────────────────────────────────────────────

/**
 * The whole list — APIs.md documents no query params here, so there is nothing
 * to page or filter by. Returns `{ data: [...] }`, each row carrying
 * `_count: { clientProjects, users }`.
 */
export const getCompanies = async () => {
  const res = await api.get("/companies");
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// * POST   /companies        ADMIN
// ─────────────────────────────────────────────────────────────
export const createCompanies = async (body) => {
  const res = await api.post("/companies", body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// * GET    /companies/:id    ADMIN, PM
// ─────────────────────────────────────────────────────────────
export const getCompanie = async (id) => {
  const res = await api.get(`/companies/${id}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// * PATCH  /companies/:id    ADMIN
// ─────────────────────────────────────────────────────────────
export const editCompanie = async (id, body) => {
  const res = await api.patch(`/companies/${id}`, body);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// * DELETE /companies/:id    ADMIN
// ─────────────────────────────────────────────────────────────
export const removeCompanie = async (id) => {
  const res = await api.delete(`/companies/${id}`);
  return res.data;
};
