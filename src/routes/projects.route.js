import { Router } from "express";
import {
  addProject,
  editProject,
  getProject,
  getProjectSummary,
  listProjects,
  removeProject,
} from "../controllers/projects.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createProjectBody,
  projectListQuery,
  projectParams,
  updateProjectBody,
} from "../validators/projects.validator.js";

const projectRoute = Router();

// Every /projects endpoint needs a logged-in user
projectRoute.use(requireAuth);

projectRoute.get("/", validate({ query: projectListQuery }), listProjects);

projectRoute.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ body: createProjectBody }),
  addProject,
);

projectRoute.get("/:id", validate({ params: projectParams }), getProject);

projectRoute.patch(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ params: projectParams, body: updateProjectBody }),
  editProject,
);

projectRoute.delete(
  "/:id",
  requireRole("ADMIN"),
  validate({ params: projectParams }),
  removeProject,
);

projectRoute.get("/:id/summary", validate({ params: projectParams }), getProjectSummary);

export default projectRoute;
