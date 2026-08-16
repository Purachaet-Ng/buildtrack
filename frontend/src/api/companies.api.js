/**
 * GET    /companies        ADMIN, PM
 * POST   /companies        ADMIN
 * GET    /companies/:id    ADMIN, PM
 * PATCH  /companies/:id    ADMIN
 * DELETE /companies/:id    ADMIN
 *
 * Deleting a company that still has users or projects returns an error listing
 * what blocks it — surface that list, not a generic toast.
 * Sprint 3 (select options) / Sprint 8 (admin screen).
 */

export {};
