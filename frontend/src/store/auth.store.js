/**
 * Zustand: the logged-in user and JWT. Persisted to localStorage.
 *
 * This store holds auth ONLY. Server data belongs to TanStack Query — copying
 * projects or tasks in here is the #1 source of stale-UI bugs (PLAN.md §6).
 *
 * Shape: { token, user: { id, email, role, firstname, lastname }, setAuth, clear }
 * Sprint 2.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "@/lib/queryCllient";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      // Login returns both at once — set them together so no render ever sees
      // a token without the user (and therefore without the role).
      setAuth: ({ token, user }) => set({ token, user }),
      logout: () => {
        queryClient.clear();
        set({ user: null, token: null });
      },
    }),
    {
      name: "user-store",
    },
  ),
);
