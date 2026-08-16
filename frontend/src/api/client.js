/**
 * The single axios instance every *.api.js file imports.
 *
 * Sprint 2 fills this in:
 *   - baseURL from import.meta.env.VITE_API_URL  (http://localhost:8000/api/v1)
 *   - request interceptor attaching `Authorization: Bearer <token>` from the
 *     auth store
 *   - response interceptor: on 401 clear the auth store and redirect to /login;
 *     on 403 let the caller handle it (the 403 page or an inline message) —
 *     do NOT log the user out, a 403 means "wrong role", not "bad token"
 *   - unwrap the error envelope { status, message, errors } from
 *     backend/src/middlewares/errorHandler.js into a usable Error
 */

export const api = null;
