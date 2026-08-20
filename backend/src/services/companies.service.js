import { prisma } from "../lib/prisma.js";

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────
/**
 * Find All Companies
 *
 * `_count` is the same idiom the projects list uses: two COUNT sub-queries in
 * the one round trip, so the บริษัท cards can show how many projects and staff
 * a company carries without an N+1 per card. These are also exactly the two
 * relations that block DELETE /companies/:id (both are onDelete: Restrict), so
 * a non-zero count is the screen's advance warning that a delete will fail.
 *
 * `orderBy` is here because the rows feed two alphabetical surfaces — the card
 * grid and the client `<select>` on the project form — and an unordered
 * findMany leaves both in whatever order Postgres returns.
 */
export const findAllCompanies = async () => {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { clientProjects: true, users: true } },
    },
  });
  return companies;
};
//Find Companies
export const findCompanies = async (where) => {
  const companies = await prisma.company.findMany({
    where,
  });
  return companies;
};
//Find Companiy by ID
export const findCompanyById = async (id) => {
  const company = await prisma.company.findUnique({
    where: { id },
  });
  return company;
};
//Check company exist
export const companyExists = async (id) => {
  const company = await prisma.company.findUnique({
    where: { id },
    select: { id: true },
  });
  return Boolean(company);
};

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────
//Create company
export const createCompany = async (data) => {
  const company = await prisma.company.create({
    data,
  });
  return company;
};
//Edit company
export const updateCompany = async (id, data) => {
  await prisma.company.update({
    where: { id },
    data,
  });
};
//Delete company
export const deleteCompany = async (id) => {
  await prisma.company.delete({ where: { id } });
};
