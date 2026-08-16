/**
 * GET    /projects                        All     ?page&limit&sort&q&status&clientCompanyId
 * POST   /projects                        ADMIN, PM
 * GET    /projects/:id                    Member
 * PATCH  /projects/:id                    ADMIN, PM
 * DELETE /projects/:id                    ADMIN
 * GET    /projects/:id/summary            Member  KPI strip on the detail page
 * GET    /projects/:id/budget             ADMIN, PM, CLIENT
 * GET    /projects/:id/members            Member
 * POST   /projects/:id/members            ADMIN, PM
 * PATCH  /projects/:id/members/:userId    ADMIN, PM
 * DELETE /projects/:id/members/:userId    ADMIN, PM
 *
 * List response is { data: [...], pagination: { page, limit, total, totalPages } }.
 * `budget` is a STRING and is absent entirely for STAFF — the backend strips it,
 * so guard on `budget === undefined` rather than assuming it is there.
 * `progressPercent` is derived server-side; it is not a column.
 * Sprint 3.
 */

export {};
