/**
 * Zustand: the logged-in user and JWT. Persisted to localStorage.
 *
 * This store holds auth ONLY. Server data belongs to TanStack Query — copying
 * projects or tasks in here is the #1 source of stale-UI bugs (PLAN.md §6).
 *
 * Shape: { token, user: { id, email, role, firstname, lastname }, setAuth, clear }
 * Sprint 2.
 */

export const useAuthStore = null;
