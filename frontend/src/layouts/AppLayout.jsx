/**
 * The signed-in shell: 240px left sidebar + 56px top bar + <Outlet />,
 * content max-width 1280px with 32px horizontal padding.
 *
 * RESPONSIVE (PLAN.md §6.1): the sidebar is an off-canvas DRAWER in the base
 * state and becomes permanent from `lg:` up. Build the drawer first —
 * retrofitting it onto a fixed sidebar is worse than writing it now.
 *
 * Nav items come from NAV_ITEMS / ADMIN_NAV_ITEMS in @/lib/constants, filtered
 * by the current role. That filtering is cosmetic; the backend enforces access.
 *
 * Sprint 2.
 */

export function AppLayout() {
  return null;
}
