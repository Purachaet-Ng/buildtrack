import jwt from "jsonwebtoken";
export const createToken = async (user) => {
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
