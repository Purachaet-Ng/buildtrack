import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Field helpers
// ─────────────────────────────────────────────────────────────

const positiveId = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message);

/**
 * Free text on the model ("Site Engineer", "Architect", "Foreman") — it is a job
 * title on the project, not the RBAC `UserRole`, so there is no enum to check.
 */
const roleInProject = z
  .string({ error: "roleInProject is required" })
  .trim()
  .min(1, "roleInProject must not be empty")
  .max(100, "roleInProject must be at most 100 characters");

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

// The sub-resource is keyed by `userId`, not by the project_member row id
export const memberParams = z.object({
  id: positiveId("Invalid project id"),
  userId: positiveId("Invalid user id"),
});

export const createMemberBody = z.object({
  userId: positiveId("userId must be a positive integer"),
  roleInProject,
});

// Only one editable field, so `.partial()` + "No fields to update" adds nothing
export const updateMemberBody = z.object({
  roleInProject,
});
