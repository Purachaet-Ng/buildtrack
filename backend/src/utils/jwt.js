import jwt from "jsonwebtoken";

// Fail at boot rather than 500-ing on every login. `server.js` loads dotenv
// before importing the app, so the env is populated by the time this runs.
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set — check your .env");
}

export const createToken = (user) => {
  const { id, email, role } = user;
  const payload = {
    id,
    email,
    role, // ADMIN | PROJECT_MANAGER | STAFF | CLIENT — requireRole reads this
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1d",
  });
  return token;
};

export const verifyToken = (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
  });
  return payload;
};
