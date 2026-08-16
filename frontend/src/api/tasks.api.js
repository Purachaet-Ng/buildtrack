/**
 * GET    /tasks                       Member  ?projectId&status&priority&assignedToId
 *                                             &parentTaskId&dueBefore
 * POST   /tasks                       ADMIN, PM
 * GET    /tasks/:id                   Member
 * PATCH  /tasks/:id                   ADMIN, PM
 * DELETE /tasks/:id                   ADMIN, PM
 * PATCH  /tasks/:id/status            PM, assignee    ← Kanban drag
 * PATCH  /tasks/:id/progress          PM, assignee
 * GET    /projects/:id/tasks/board    Member          ← grouped by status
 *
 * The drag handler updates optimistically and rolls the card back on failure.
 * Sprint 4.
 */

export {};
