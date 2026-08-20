import { Router } from "express";
import {
  addProject,
  editProject,
  getProject,
  getProjectSummary,
  listProjects,
  removeProject,
} from "../controllers/projects.controller.js";
import {
  addMember,
  editMember,
  listMembers,
  removeMember,
} from "../controllers/members.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createProjectBody,
  projectListQuery,
  projectParams,
  updateProjectBody,
} from "../validators/projects.validator.js";
import {
  createMemberBody,
  memberParams,
  updateMemberBody,
} from "../validators/members.validator.js";

const projectRoute = Router();

// Every /projects endpoint needs a logged-in user
projectRoute.use(requireAuth);

projectRoute.get("/:id", validate({ params: projectParams }), getProject);

projectRoute.get("/", validate({ query: projectListQuery }), listProjects);

projectRoute.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ body: createProjectBody }),
  addProject,
);

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

projectRoute.get(
  "/:id/summary",
  validate({ params: projectParams }),
  getProjectSummary,
);

// ─── Project members ─────────────────────────────────────────
// The role gate here is coarse; the controller also checks that the caller can
// reach the project itself, so a PM cannot staff someone else's project.

projectRoute.get(
  "/:id/members",
  validate({ params: projectParams }),
  listMembers,
);

projectRoute.post(
  "/:id/members",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ params: projectParams, body: createMemberBody }),
  addMember,
);

projectRoute.patch(
  "/:id/members/:userId",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ params: memberParams, body: updateMemberBody }),
  editMember,
);

projectRoute.delete(
  "/:id/members/:userId",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ params: memberParams }),
  removeMember,
);

export default projectRoute;
