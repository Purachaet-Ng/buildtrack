/**
 * <ProtectedRoute roles={["ADMIN", "PROJECT_MANAGER"]}>
 *
 *   - not authenticated  → redirect to /login, remembering where they were
 *   - authenticated, wrong role → render the 403 page (do NOT redirect; the
 *     user should see why)
 *   - otherwise → <Outlet />
 *
 * Route-level role checks mirror the backend's requireRole middleware. They
 * exist so the user gets a clean message instead of a broken screen — the
 * enforcement itself is server-side.
 *
 * Sprint 2.
 */

import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/permissions";
import ForbiddenPage from "@/pages/ForbiddenPage";
import React from "react";
import { Outlet } from "react-router-dom";

function ProtectedRoute({ roles, action }) {
  const { user } = useAuth();
  if (!user) return <ForbiddenPage />;
  const allowed = roles ? roles.includes(user.role) : can(user.role, action);
  return allowed ? <Outlet /> : <ForbiddenPage />;
}

export default ProtectedRoute;
