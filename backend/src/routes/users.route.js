import { Router } from "express";

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  addUser,
  editMe,
  editUser,
  getMe,
  getUser,
  listUsers,
  removeUser,
} from "../controllers/users.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createUserBody,
  updateMeBody,
  updateUserBody,
  userListQuery,
  userParams,
} from "../validators/users.validator.js";

const userRoute = Router();
//{{base_url}}/users

userRoute.use(requireAuth);

userRoute.get(
  "/",
  requireRole("ADMIN"),
  validate({ query: userListQuery }),
  listUsers,
);

userRoute.post(
  "/",
  requireRole("ADMIN"),
  validate({ body: createUserBody }),
  addUser,
);

// "/me" must stay above "/:id" — otherwise userParams rejects "me" with a 400
userRoute.get("/me", getMe);

userRoute.patch("/me", validate({ body: updateMeBody }), editMe);

userRoute.get(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate({ params: userParams }),
  getUser,
);

userRoute.patch(
  "/:id",
  requireRole("ADMIN"),
  validate({ body: updateUserBody, params: userParams }),
  editUser,
);

userRoute.delete(
  "/:id",
  requireRole("ADMIN"),
  validate({ params: userParams }),
  removeUser,
);

export default userRoute;
