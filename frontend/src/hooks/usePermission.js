/**
 * `can(action)` for the current user's role, backed by the permission matrix in
 * APIs.md → Business Rules.
 *
 * This decides what to RENDER. It is not access control — the backend returns
 * 401/403 regardless of what the UI shows, and that is the real boundary. A
 * hidden button is a courtesy, not a lock.
 *
 * Sprint 2.
 */

export function usePermission() {
  throw new Error("usePermission: not implemented (Sprint 2)");
}
