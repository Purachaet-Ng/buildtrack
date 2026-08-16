/**
 * GET    /issues             Member  ?projectId&status&priority
 * POST   /issues             STAFF, PM   → auto-notifies the project's PM
 * GET    /issues/:id         Member
 * PATCH  /issues/:id         ADMIN, PM
 * PATCH  /issues/:id/status  PM, assignee
 *
 * CLIENT never reaches these screens.
 * Sprint 5.
 */

export {};
