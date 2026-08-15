import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { findUserById } from "./users.service.js";

const clientCompanySelect = { select: { id: true, name: true, type: true } };

// ─────────────────────────────────────────────────────────────
// Visibility (APIs.md → GET /projects must filter by role)
// ─────────────────────────────────────────────────────────────

/**
 * Prisma `where` fragment describing the projects a user may see.
 *   ADMIN   → every project
 *   CLIENT  → only projects owned by their own company
 *   PM/STAFF→ only projects they are a member of
 */
export const buildProjectScope = async (user) => {
  if (user.role === "ADMIN") return {};

  if (user.role === "CLIENT") {
    const account = await findUserById(user.id);
    // A client without a company matches nothing (ids start at 1)
    return { clientCompanyId: account?.companyId ?? 0 };
  }

  return { members: { some: { userId: user.id } } };
};

export const isProjectMember = async (projectId, userId) => {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { id: true },
  });
  return Boolean(member);
};

/** Can this user read the given project? (ADMIN / member / owning client) */
export const canAccessProject = async (user, project) => {
  if (user.role === "ADMIN") return true;

  if (user.role === "CLIENT") {
    const account = await findUserById(user.id);
    return Boolean(account?.companyId) && account.companyId === project.clientCompanyId;
  }

  return isProjectMember(project.id, user.id);
};

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export const findProjects = async (where, { skip, limit, orderBy }) => {
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        clientCompany: clientCompanySelect,
        _count: { select: { tasks: true, members: true, issues: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return { projects: await withProgress(projects), total };
};

export const findProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      clientCompany: clientCompanySelect,
      _count: { select: { tasks: true, members: true, issues: true, documents: true } },
    },
  });
  if (!project) return null;

  const [withPercent] = await withProgress([project]);
  return withPercent;
};

/** Raw row without the includes — for ownership checks before update/delete. */
export const findProjectRow = (id) =>
  prisma.project.findUnique({ where: { id } });

/**
 * `progressPercent` is derived from the average of task.progressPercent
 * (APIs.md) — it is never stored on the project row.
 */
const withProgress = async (projects) => {
  if (projects.length === 0) return projects;

  const grouped = await prisma.task.groupBy({
    by: ["projectId"],
    where: { projectId: { in: projects.map((project) => project.id) } },
    _avg: { progressPercent: true },
  });

  const averageByProject = new Map(
    grouped.map((row) => [row.projectId, row._avg.progressPercent ?? 0]),
  );

  return projects.map((project) => ({
    ...project,
    progressPercent: Math.round(averageByProject.get(project.id) ?? 0),
  }));
};

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

/**
 * Creates the project and — unless the creator is an ADMIN, who sees every
 * project anyway — enrolls the creator as a member so it stays visible to them.
 */
export const createProject = async (data, creator) =>
  prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data,
      include: { clientCompany: clientCompanySelect },
    });

    if (creator.role !== "ADMIN") {
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: creator.id,
          roleInProject: "Project Manager",
        },
      });
    }

    return { ...project, progressPercent: 0 };
  });

export const updateProject = (id, data) =>
  prisma.project.update({
    where: { id },
    data,
    include: { clientCompany: clientCompanySelect },
  });

// Hard delete — members / tasks / documents / reports / expenses / issues
// cascade from the schema. Switch to a soft delete if history must be kept.
export const deleteProject = (id) => prisma.project.delete({ where: { id } });

export const companyExists = async (id) => {
  const company = await prisma.company.findUnique({
    where: { id },
    select: { id: true },
  });
  return Boolean(company);
};

// ─────────────────────────────────────────────────────────────
// Summary (KPI)
// ─────────────────────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getProjectStats = async (project) => {
  const now = new Date();

  const [taskAggregate, completedTasks, overdueTasks, expenseAggregate, openIssues] =
    await Promise.all([
      prisma.task.aggregate({
        where: { projectId: project.id },
        _count: { _all: true },
        _avg: { progressPercent: true },
      }),
      prisma.task.count({
        where: { projectId: project.id, status: "COMPLETED" },
      }),
      prisma.task.count({
        where: {
          projectId: project.id,
          status: { not: "COMPLETED" },
          dueDate: { lt: now },
        },
      }),
      prisma.expense.aggregate({
        where: { projectId: project.id },
        _sum: { amount: true },
      }),
      prisma.issue.count({ where: { projectId: project.id, status: "OPEN" } }),
    ]);

  // Money stays Decimal all the way out — never Float (APIs.md)
  const spent = expenseAggregate._sum.amount ?? new Prisma.Decimal(0);
  const budget = project.budget; // Decimal(14,2)

  return {
    progressPercent: Math.round(taskAggregate._avg.progressPercent ?? 0),
    daysRemaining: Math.ceil((project.endDate.getTime() - now.getTime()) / MS_PER_DAY),
    budget,
    spent,
    remaining: budget.minus(spent),
    budgetUsedPercent: budget.isZero()
      ? 0
      : Math.round((spent.toNumber() / budget.toNumber()) * 100),
    taskCount: {
      total: taskAggregate._count._all,
      completed: completedTasks,
      overdue: overdueTasks,
    },
    openIssues,
  };
};
