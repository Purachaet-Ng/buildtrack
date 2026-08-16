/**
 * GET    /documents        Member  ?projectId&taskId&docType
 * POST   /documents        ADMIN, PM, STAFF   multipart/form-data, field: `file`
 * GET    /documents/:id    Member
 * DELETE /documents/:id    ADMIN, PM, uploader
 *
 * Upload posts FormData — do not set Content-Type by hand, let the browser add
 * the multipart boundary. Use axios `onUploadProgress` for the per-file bar.
 * Sprint 6.
 */

export {};
