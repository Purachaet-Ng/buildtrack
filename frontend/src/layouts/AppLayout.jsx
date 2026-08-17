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
 * CHROME: the sidebar and top bar are DARK TEAL (#042630) against the light
 * content area — use bg-sidebar / text-sidebar-foreground, never a hardcoded
 * hex. Three things here are contrast-critical:
 *
 *   - Inactive nav labels and the "ผู้ดูแลระบบ" divider label use
 *     text-sidebar-muted-foreground (#A0ADB0, 6.87:1). The brand neutral
 *     #6B7C80 is only 3.64:1 on the sidebar and FAILS as text there.
 *   - The active item is a 2px #E08A00 left bar (5.89:1) PLUS the #07465A
 *     background. That background is 1.53:1 on its own, so the orange bar is
 *     the accessible indicator and must not be dropped for a subtler look.
 *   - The notification badge cannot be --destructive: #B3261E is 2.42:1 on the
 *     dark bar. Use #FF6B6B with a #042630 count (5.71:1 both ways).
 *
 * Sprint 2.
 */

import React from "react";
import { Outlet } from "react-router-dom";

function AppLayout() {
  // Shell still to build (sidebar + top bar, see above). The Outlet is here so
  // the authenticated routes actually mount in the meantime.
  return (
    <div>
      AppLayout
      <Outlet />
    </div>
  );
}

export default AppLayout;
