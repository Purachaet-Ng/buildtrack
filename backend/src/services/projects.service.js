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
    return (
      Boolean(account?.companyId) &&
      account.companyId === project.clientCompanyId
    );
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

  return { projects: await withTaskCount(projects), total };
};

export const findProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      clientCompany: clientCompanySelect,
      _count: {
        select: { tasks: true, members: true, issues: true, documents: true },
      },
    },
  });
  if (!project) return null;

  const [withCount] = await withTaskCount([project]);
  return withCount;
};

/** Raw row without the includes — for ownership checks before update/delete. */
export const findProjectRow = async (id) =>
  await prisma.project.findUnique({ where: { id } });

/**
 * Prisma `where` fragment for the tasks a project's progress is measured over.
 *
 * TOP-LEVEL ONLY. Sub-tasks carry the same `projectId` as their parent, so
 * counting every row would let one task broken into three sub-tasks weigh four
 * times as much as one that was never broken down — the number would move as
 * the WBS is refined rather than as work gets finished. Leaves are reported,
 * parents roll them up, the project counts the roots.
 */
const rootTasksOf = (projectIds) => ({
  projectId: Array.isArray(projectIds) ? { in: projectIds } : projectIds,
  parentTaskId: null,
});

/**
 * What counts as "finished" for the progress ratio.
 *
 * APPROVED is in here even though the TaskStatus enum orders it BEFORE
 * COMPLETED. A task the client has signed off is done as far as anyone
 * standing on site is concerned — leaving it out meant a delivered, approved
 * deliverable still read as outstanding work on the project card.
 *
 * The same list drives `overdue`: an approved task past its due date is not
 * late, it is finished.
 */
const FINISHED_STATUSES = ["COMPLETED", "APPROVED"];

/**
 * `taskCount` is derived at read time (APIs.md) — it is never stored on the
 * project row. Progress is "N of M tasks finished", NOT the average of
 * `task.progressPercent`: the per-task percent is one person's estimate, and
 * averaging estimates produces a number nobody can defend. A finished task is
 * a fact.
 *
 * Distinct from the `_count.tasks` that rides along on the include — that one
 * counts EVERY task including sub-tasks, because it answers a different
 * question (how much a delete would take with it).
 */
const withTaskCount = async (projects) => {
  if (projects.length === 0) return projects;

  // One round trip for both numbers: group the root tasks by status, then fold
  // the finished buckets into `completed` and every bucket into `total`.
  const grouped = await prisma.task.groupBy({
    by: ["projectId", "status"],
    where: rootTasksOf(projects.map((project) => project.id)),
    _count: { _all: true },
  });

  const countByProject = new Map();
  for (const row of grouped) {
    const tally = countByProject.get(row.projectId) ?? {
      completed: 0,
      total: 0,
    };
    tally.total += row._count._all;
    if (FINISHED_STATUSES.includes(row.status))
      tally.completed += row._count._all;
    countByProject.set(row.projectId, tally);
  }

  return projects.map((project) => ({
    ...project,
    taskCount: countByProject.get(project.id) ?? { completed: 0, total: 0 },
  }));
};

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

/**
 * Creates the project and — unless the creator is an ADMIN, who sees every
 * project anyway — enrolls the creator as a member so it stays visible to them.
 */
export const createProject = async (projectData, creator) => {
  const isNotAdmin = creator.role !== "ADMIN";
  const project = await prisma.project.create({
    data: {
      ...projectData,
      ...(isNotAdmin && {
        // `members` is the relation on Project — `projectMembers` is the one on User
        members: {
          create: {
            userId: creator.id,
            roleInProject: "Project Manager",
          },
        },
      }),
    },
    include: { clientCompany: clientCompanySelect },
  });

  // A brand new project has no tasks — say so explicitly rather than letting
  // the key be absent, so the card renders "0 / 0 งาน" and not a dash.
  return { ...project, taskCount: { completed: 0, total: 0 } };
};
// prisma.$transaction(async (tx) => {
//   const project = await tx.project.create({
//     projectData,
//     include: { clientCompany: clientCompanySelect },
//   });

//   if (creator.role !== "ADMIN") {
//     await tx.projectMember.create({
//       data: {
//         projectId: project.id,
//         userId: creator.id,
//         roleInProject: "Project Manager",
//       },
//     });
//   }

//   return { ...project, taskCount: { completed: 0, total: 0 } };
// });

export const updateProject = async (id, data) =>
  await prisma.project.update({
    where: { id },
    data,
    include: { clientCompany: clientCompanySelect },
  });

// Hard delete — members / tasks / documents / reports / expenses / issues
// cascade from the schema. Switch to a soft delete if history must be kept.
export const deleteProject = async (id) => {
  await prisma.project.delete({ where: { id } });
};

// ─────────────────────────────────────────────────────────────
// Summary (KPI)
// ─────────────────────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getProjectStats = async (project) => {
  const now = new Date();

  // All three task numbers are scoped to top-level tasks by rootTasksOf, for
  // the same reason withTaskCount is — and so the summary strip on the detail
  // page can never disagree with the ratio on the list row.
  const rootTasks = rootTasksOf(project.id);

  const [totalTasks, completedTasks, overdueTasks, expenseAggregate, openIssues] =
    await Promise.all([
      prisma.task.count({ where: rootTasks }),
      prisma.task.count({
        where: { ...rootTasks, status: { in: FINISHED_STATUSES } },
      }),
      prisma.task.count({
        where: {
          ...rootTasks,
          status: { notIn: FINISHED_STATUSES },
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
    daysRemaining: Math.ceil(
      (project.endDate.getTime() - now.getTime()) / MS_PER_DAY,
    ),
    budget,
    spent,
    remaining: budget.minus(spent),
    budgetUsedPercent: budget.isZero()
      ? 0
      : Math.round((spent.toNumber() / budget.toNumber()) * 100),
    // `completed` / `total` ARE the progress figure — the same pair the list
    // rows carry, so both screens tell the same story.
    taskCount: {
      total: totalTasks,
      completed: completedTasks,
      overdue: overdueTasks,
    },
    openIssues,
  };
};
