import { Router } from "express";

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  addCompany,
  editCompany,
  getCompany,
  removeCompany,
} from "../controllers/companies.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  companyParams,
  createCompanyBody,
  updateCompanyBody,
} from "../validators/companies.validator.js";

const companyRoute = Router();
//{{base_url}}/companies

companyRoute.use(requireAuth);
// companyRoute.get("/")
companyRoute.post(
  "/",
  requireRole("ADMIN"),
  validate({ body: createCompanyBody }),
  addCompany,
);
companyRoute.get("/:id", validate({ params: companyParams }), getCompany);

companyRoute.patch(
  "/:id",
  requireRole("ADMIN"),
  validate({ body: updateCompanyBody, params: companyParams }),
  editCompany,
);

companyRoute.delete(
  "/:id",
  requireRole("ADMIN"),
  validate({ params: companyParams }),
  removeCompany,
);

export default companyRoute;
