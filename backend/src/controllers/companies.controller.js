import createHttpError from "http-errors";
import {
  companyExists,
  createCompany,
  deleteCompany,
  findAllCompanies,
  findCompanies,
  findCompanyById,
  updateCompany,
} from "../services/companies.service.js";

const checkCompanyExistence = async (companyId) => {
  const company = await findCompanyById(companyId);
  if (!company) throw createHttpError(404, "Company not found");
  return company;
};

// ─────────────────────────────────────────────────────────────
// GET /companies
// ─────────────────────────────────────────────────────────────

/**
 * The whole list, unpaginated and unfiltered: APIs.md documents no query params
 * here, and this exists to fill a `<select>` — three rows today, and a company
 * table that grows by a handful a year. `{ data }` with no `pagination` key
 * matches the sibling GET /companies/:id rather than the paged GET /users.
 */
export async function listCompanies(req, res) {
  const companies = await findAllCompanies();

  res.status(200).json({
    data: companies,
  });
}
// ─────────────────────────────────────────────────────────────
// POST /companies
// ─────────────────────────────────────────────────────────────
export async function addCompany(req, res) {
  const data = req.valid.body;
  const company = await createCompany(data);

  res.status(201).json({
    message: "Company created",
    company,
  });
}
// ─────────────────────────────────────────────────────────────
// GET /companies/:id
// ─────────────────────────────────────────────────────────────
export async function getCompany(req, res) {
  const { id } = req.valid.params;
  const company = await checkCompanyExistence(id);
  res.status(200).json({
    data: company,
  });
}
// ─────────────────────────────────────────────────────────────
// PATCH /companies/:id
// ─────────────────────────────────────────────────────────────
export async function editCompany(req, res) {
  const { id } = req.valid.params;
  const data = req.valid.body;

  const existing = await checkCompanyExistence(id);

  const company = await updateCompany(id, data);

  res.status(200).json({
    message: "Company updated",
    data: company,
  });
}
// ─────────────────────────────────────────────────────────────
// DELETE /companies/:id
// ─────────────────────────────────────────────────────────────
export async function removeCompany(req, res) {
  const { id } = req.valid.params;
  await checkCompanyExistence(id);

  await deleteCompany(id);

  res.status(200).json({ message: "Company deleted" });
}
