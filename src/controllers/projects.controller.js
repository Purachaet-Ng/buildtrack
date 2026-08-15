import createHttpError from "http-errors";
import {
  buildProjectScope,
  canAccessProject,
  companyExists,
  createProject,
  deleteProject,
  findProjectById,
  findProjectRow,
  findProjects,
  getProjectStats,
  updateProject,
} from "../services/projects.service.js";
import { buildPagination } from "../utils/query.js";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * STAFF must never see money (APIs.md → Business Rules), so the budget is
 * stripped in the response layer, not just hidden in the UI.
 */
const toProjectResponse = (project, viewerRole) => {
  const { budget, ...rest } = project;
  if (viewerRole === "STAFF") return rest;
  return { ...rest, budget: budget.toFixed(2) };
};

/** Loads the project and throws 404 / 403 before the handler touches it. */
const loadAccessibleProject = async (user, id) => {
  const project = await findProjectById(id);
  if (!project) throw createHttpError(404, "Project not found");

  if (!(await canAccessProject(user, project))) {
    throw createHttpError(403, "Forbidden: you are not a member of this project");
  }
  return project;
};

const assertCompanyExists = async (clientCompanyId) => {
  if (!(await companyExists(clientCompanyId))) {
    throw createHttpError(404, "Client company not found");
  }
};

// ─────────────────────────────────────────────────────────────
// GET /projects
// ─────────────────────────────────────────────────────────────

export async function listProjects(req, res) {
  const { page, limit, skip, orderBy, q, status, clientCompanyId } = req.valid.query;

  const where = { ...(await buildProjectScope(req.user)) };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (clientCompanyId) where.clientCompanyId = clientCompanyId;

  const { projects, total } = await findProjects(where, { skip, limit, orderBy });

  res.status(200).json({
    data: projects.map((project) => toProjectResponse(project, req.user.role)),
    pagination: buildPagination({ page, limit, total }),
  });
}

// ─────────────────────────────────────────────────────────────
// POST /projects
// ─────────────────────────────────────────────────────────────

export async function addProject(req, res) {
  const data = req.valid.body;

  await assertCompanyExists(data.clientCompanyId);

  const project = await createProject(
    {
      ...data,
      location: data.location ?? null,
      description: data.description ?? null,
    },
    req.user,
  );

  res.status(201).json({
    message: "Project created",
    project: toProjectResponse(project, req.user.role),
  });
}

// ─────────────────────────────────────────────────────────────
// GET /projects/:id
// ─────────────────────────────────────────────────────────────

export async function getProject(req, res) {
  const project = await loadAccessibleProject(req.user, req.valid.params.id);

  res.status(200).json({
    project: toProjectResponse(project, req.user.role),
  });
}

// ─────────────────────────────────────────────────────────────
// PATCH /projects/:id
// ─────────────────────────────────────────────────────────────

export async function editProject(req, res) {
  const { id } = req.valid.params;
  const data = req.valid.body;

  const existing = await findProjectRow(id);
  if (!existing) throw createHttpError(404, "Project not found");

  // A PM may only edit a project they belong to; ADMIN may edit any.
  if (!(await canAccessProject(req.user, existing))) {
    throw createHttpError(403, "Forbidden: you are not a member of this project");
  }

  if (data.clientCompanyId !== undefined) {
    await assertCompanyExists(data.clientCompanyId);
  }

  // One date sent, the other kept — compare against what is stored
  const start = data.startDate ?? existing.startDate;
  const end = data.endDate ?? existing.endDate;
  if (end < start) throw createHttpError(400, "endDate must be after startDate");

  const project = await updateProject(id, data);

  res.status(200).json({
    message: "Project updated",
    project: toProjectResponse(project, req.user.role),
  });
}

// ─────────────────────────────────────────────────────────────
// DELETE /projects/:id
// ─────────────────────────────────────────────────────────────

export async function removeProject(req, res) {
  const { id } = req.valid.params;

  if (!(await findProjectRow(id))) {
    throw createHttpError(404, "Project not found");
  }

  await deleteProject(id);

  res.status(200).json({ message: "Project deleted" });
}

// ─────────────────────────────────────────────────────────────
// GET /projects/:id/summary
// ─────────────────────────────────────────────────────────────

export async function getProjectSummary(req, res) {
  const project = await loadAccessibleProject(req.user, req.valid.params.id);
  const stats = await getProjectStats(project);

  const summary = {
    projectId: project.id,
    name: project.name,
    status: project.status,
    progressPercent: stats.progressPercent,
    daysRemaining: stats.daysRemaining,
    taskCount: stats.taskCount,
    openIssues: stats.openIssues,
  };

  // Financial KPIs are hidden from STAFF
  if (req.user.role !== "STAFF") {
    summary.budget = stats.budget.toFixed(2);
    summary.spent = stats.spent.toFixed(2);
    summary.remaining = stats.remaining.toFixed(2);
    summary.budgetUsedPercent = stats.budgetUsedPercent;
  }

  res.status(200).json(summary);
}
