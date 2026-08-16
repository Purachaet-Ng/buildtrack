/**
 * GET    /expenses         ADMIN, PM, CLIENT  ?projectId&category&from&to
 * POST   /expenses         ADMIN, PM
 * PATCH  /expenses/:id     ADMIN, PM
 * DELETE /expenses/:id     ADMIN, PM
 *
 * `amount` is a STRING in both directions — send the validated input string
 * straight through, never a JS number.
 * STAFF gets 403 on every endpoint here; that is enforced by the backend, the
 * hidden nav item is only cosmetic.
 * Sprint 6.
 */

export {};
