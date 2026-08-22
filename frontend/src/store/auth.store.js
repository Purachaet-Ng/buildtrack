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
      /**
       * Clearing the token swaps routes/index.jsx to guestRouter, but it does
       * NOT change the URL — and a router instance that was created at module
       * load does not re-read window.location when it is swapped in. Log out at
       * /projects/23 and you get the guest tree asked to render a path it has
       * no route for, which left the screen blank.
       *
       * So the redirect is a real navigation, not a router one. It cannot be
       * useNavigate(): this is a store, not a component, and calling a hook out
       * here throws "Invalid hook call" before the app even mounts.
       *
       * assign() over a router push is also the better answer on its own
       * merits — a full reload drops every cached query, every mounted
       * component and anything still held in memory, which is exactly what
       * signing out should do. queryClient.clear() above covers the cache; this
       * covers the rest.
       *
       * Note this runs for expiry too: client.js calls logout() on any 401, so
       * a session that dies mid-session also lands back on the login page.
       */
      logout: () => {
        queryClient.clear();
        set({ user: null, token: null });
        window.location.assign("/");
      },
    }),
    {
      name: "user-store",
    },
  ),
);
