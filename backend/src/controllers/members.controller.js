import createHttpError from "http-errors";
import {
  createProjectMember,
  deleteProjectMember,
  findProjectMember,
  findProjectMembers,
  updateProjectMember,
} from "../services/members.service.js";
import {
  canAccessProject,
  findProjectRow,
  isProjectMember,
} from "../services/projects.service.js";
import { userExists } from "../services/users.service.js";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * 404 if the project is gone, 403 if the caller cannot see it — a PM may only
 * manage the team of a project they belong to, exactly as PATCH /projects/:id.
 * The raw row is enough here; the includes of `findProjectById` are not needed.
 */
const assertProjectAccess = async (user, projectId) => {
  const project = await findProjectRow(projectId);
  if (!project) throw createHttpError(404, "Project not found");

  if (!(await canAccessProject(user, project))) {
    throw createHttpError(
      403,
      "Forbidden: you are not a member of this project",
    );
  }
  return project;
};

/** Loads the membership row and throws the 404 before the handler touches it. */
const loadMember = async (projectId, userId) => {
  const member = await findProjectMember(projectId, userId);
  if (!member) throw createHttpError(404, "Member not found");
  return member;
};

/**
 * @@unique([projectId, userId]) — turns the DB conflict into the 409 APIs.md
 * asks for. Prisma 7 on the pg adapter can bury the SQLSTATE in `meta`, so the
 * raw 23505 is checked as well as P2002 (same sniffing as auth.controller.js).
 */
const isUniqueViolation = (error) => {
  if (error?.code === "P2002") return true;
  return error?.meta?.driverAdapterError?.cause?.code === "23505";
};

// ─────────────────────────────────────────────────────────────
// GET /projects/:id/members
// ─────────────────────────────────────────────────────────────

export async function listMembers(req, res) {
  const { id } = req.valid.params;

  await assertProjectAccess(req.user, id);

  const members = await findProjectMembers(id);

  res.status(200).json({ data: members });
}

// ─────────────────────────────────────────────────────────────
// POST /projects/:id/members
// ─────────────────────────────────────────────────────────────

export async function addMember(req, res) {
  const { id } = req.valid.params;
  const { userId, roleInProject } = req.valid.body;

  await assertProjectAccess(req.user, id);

  if (!(await userExists(userId))) throw createHttpError(404, "User not found");

  if (await isProjectMember(id, userId)) {
    throw createHttpError(409, "User is already a member of this project");
  }

  let member;
  try {
    member = await createProjectMember({ projectId: id, userId, roleInProject });
  } catch (error) {
    // Two concurrent adds can both pass the check above
    if (isUniqueViolation(error)) {
      throw createHttpError(409, "User is already a member of this project");
    }
    throw error;
  }

  res.status(201).json({ message: "Member added", member });
}

// ─────────────────────────────────────────────────────────────
// PATCH /projects/:id/members/:userId
// ─────────────────────────────────────────────────────────────

export async function editMember(req, res) {
  const { id, userId } = req.valid.params;
  const data = req.valid.body;

  await assertProjectAccess(req.user, id);
  await loadMember(id, userId);

  const member = await updateProjectMember(id, userId, data);

  res.status(200).json({ message: "Member updated", member });
}

// ─────────────────────────────────────────────────────────────
// DELETE /projects/:id/members/:userId
// ─────────────────────────────────────────────────────────────

export async function removeMember(req, res) {
  const { id, userId } = req.valid.params;

  await assertProjectAccess(req.user, id);
  await loadMember(id, userId);

  await deleteProjectMember(id, userId);

  res.status(200).json({ message: "Member removed" });
}
