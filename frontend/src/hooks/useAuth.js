/**
 * Reads the current user and token from the auth store and exposes
 * login / logout / isAuthenticated.
 *
 * Thin wrapper over @/store/auth.store — components should not import the
 * store directly, so the storage mechanism stays swappable.
 * Sprint 2.
 */

import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  // One selector per field rather than a single object selector: zustand
  // compares the selected value by identity, and `(s) => ({ user, token })`
  // returns a fresh object on every store write, re-rendering every consumer.
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Actions are created once inside `create`, so these references are stable
  // and safe in dependency arrays.
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    token,
    // Pulled out because it is what usePermission and the route guards read;
    // null (not undefined) when logged out, so `can(role, …)` stays falsy.
    role: user?.role ?? null,

    // The token is the source of truth for "logged in" — routes/index.jsx and
    // the axios interceptor both key off it, and client.js clears it on 401.
    isAuthenticated: !!token,

    // Takes the { token, user } the POST /auth/login response already gives us.
    // Calling the API stays in the page: this hook owns session state, not
    // network state (PLAN.md §6).
    login: setAuth,
    logout,
  };
}
