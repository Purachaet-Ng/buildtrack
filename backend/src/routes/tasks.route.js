import { Router } from "express";

import {
  addTask,
  changeTaskProgress,
  changeTaskStatus,
  editTask,
  getTask,
  listTasks,
  removeTask,
} from "../controllers/tasks.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createTaskBody,
  taskListQuery,
  taskParams,
  updateProgressBody,
  updateStatusBody,
  updateTaskBody,
} from "../validators/tasks.validator.js";

const taskRoute = Router();
//{{base_url}}/tasks

// Every /tasks endpoint needs a logged-in user
taskRoute.use(requireAuth);

/**
 * The role gates here are coarse. The controller additionally checks that the
 * caller can reach the task's PROJECT, so a PM cannot touch tasks on a job they
 * are not staffed to — same layering as projects.route.js.
 */

taskRoute.get("/", validate({ query: taskListQuery }), listTasks);

taskRoute.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ body: createTaskBody }),
  addTask,
);

// ─── Sub-resources before "/:id" is not required (the paths differ), but they
// ─── are grouped here because their authorisation is the unusual part.

/**
 * Deliberately NO requireRole on these two.
 *
 * Every other write in this app is a flat role list, which requireRole covers.
 * These are not: who may change a status depends on the task (are you the
 * assignee?) AND on the target value (a CLIENT may set APPROVED and nothing
 * else; a STAFF may set anything BUT approved). That decision needs the loaded
 * row, so it lives in the controller via canTransitionStatus / canUpdateProgress.
 *
 * Putting a requireRole here as well would be actively wrong — it would have to
 * list all four roles, which reads as "anyone may do this".
 */
taskRoute.patch(
  "/:id/status",
  validate({ params: taskParams, body: updateStatusBody }),
  changeTaskStatus,
);

taskRoute.patch(
  "/:id/progress",
  validate({ params: taskParams, body: updateProgressBody }),
  changeTaskProgress,
);

taskRoute.get("/:id", validate({ params: taskParams }), getTask);

taskRoute.patch(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ params: taskParams, body: updateTaskBody }),
  editTask,
);

taskRoute.delete(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ params: taskParams }),
  removeTask,
);

export default taskRoute;
