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

export function ProtectedRoute() {
  return null;
}
