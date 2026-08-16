import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginBody, registerBody } from "../validators/auth.validator.js";

const authRoute = Router();

authRoute.post("/register", validate({ body: registerBody }), registerUser);
authRoute.post("/login", validate({ body: loginBody }), loginUser);

export default authRoute;
