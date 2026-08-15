import { prisma } from "../lib/prisma.js";

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────
//Find All Companies
export const findAllCompanies = async () => {
  const companies = await prisma.company.findMany();
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
