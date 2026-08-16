import createHttpError from "http-errors";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return next(createHttpError(401, "Please login to view this page"));
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(createHttpError(403, "Invalid or expired token"));
  }
}

export function requireRole(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role))
      return next(createHttpError(403, "Forbidden"));
    next();
  };
}
