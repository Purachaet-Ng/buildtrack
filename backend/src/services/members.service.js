import { prisma } from "../lib/prisma.js";
import { userSelect } from "./users.service.js";

/** The embedded account goes through `userSelect` so `passwordHash` never leaks. */
const memberInclude = { user: { select: userSelect } };

/** A user joins a project once — @@unique([projectId, userId]). */
const memberKey = (projectId, userId) => ({
  projectId_userId: { projectId, userId },
});

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

/**
 * The whole roster, unpaginated — a project team is a handful of people.
 * `joinedAt` is the only timestamp on the row (there is no `createdAt`), so
 * `buildOrderBy` is deliberately not used here.
 */
export const findProjectMembers = async (projectId) =>
  await prisma.projectMember.findMany({
    where: { projectId },
    include: memberInclude,
    orderBy: { joinedAt: "asc" },
  });

export const findProjectMember = async (projectId, userId) =>
  await prisma.projectMember.findUnique({
    where: memberKey(projectId, userId),
    include: memberInclude,
  });

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

export const createProjectMember = async (data) =>
  await prisma.projectMember.create({ data, include: memberInclude });

export const updateProjectMember = async (projectId, userId, data) =>
  await prisma.projectMember.update({
    where: memberKey(projectId, userId),
    data,
    include: memberInclude,
  });

export const deleteProjectMember = async (projectId, userId) => {
  await prisma.projectMember.delete({ where: memberKey(projectId, userId) });
};
