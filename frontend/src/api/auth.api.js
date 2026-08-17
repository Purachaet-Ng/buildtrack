/**
 * POST   /auth/register  → { message, user }
 * POST   /auth/login     → { message, token, user }
 *
 * There is no /auth/logout (the JWT is stateless — drop the token client-side)
 * and no /auth/me (use GET /users/me). See APIs.md.
 *
 * The register screen sends no role — role is assigned by an admin.
 *
 * Neither helper catches: client.js already unwraps the error envelope into an
 * Error with `.message` / `.status` / `.errors`, and swallowing it here would
 * hand the caller `undefined` instead of a reason to show the user.
 * Sprint 2.
 */
import api from "./client.js";

export const postLogin = async (body) => {
  const res = await api.post("/auth/login", body);
  return res.data;
};

export const postRegister = async (body) => {
  const res = await api.post("/auth/register", body);
  return res.data;
};
