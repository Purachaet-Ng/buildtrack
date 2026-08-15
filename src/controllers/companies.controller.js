import createHttpError from "http-errors";
import {
  companyExists,
  createCompany,
  deleteCompany,
  findAllCompanies,
  findCompanies,
  findCompanyById,
  updateCompany,
} from "../services/companies.service";

const checkCompanyExistence = async (companyId) => {
  const company = await findCompanyById(companyId);
  if (!company) throw createHttpError(404, "Company not found");
  return company;
};

// ─────────────────────────────────────────────────────────────
// GET /companies
// ─────────────────────────────────────────────────────────────

export async function listCompanies(req, res) {}
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
  company = await checkCompanyExistence(id);

  res.status(200).json({
    company,
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
    company,
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
