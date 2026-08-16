/**
 * GET    /daily-reports        Member  ?projectId&from&to&reportedById
 * POST   /daily-reports        STAFF, PM
 * GET    /daily-reports/:id    Member
 * PATCH  /daily-reports/:id    Owner, PM
 * DELETE /daily-reports/:id    ADMIN, PM
 *
 * One report per project + date + reporter, so POST can return 409. Do not show
 * that as a generic error — the form offers a link to edit the existing report.
 * Sprint 5.
 */

export {};
