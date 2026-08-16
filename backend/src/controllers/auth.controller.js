import { createUser, findUserByEmail } from "../services/users.service.js";
import createHttpError from "http-errors";
import argon2 from "argon2";
import { createToken } from "../utils/jwt.js";

/**
 * `email` is @unique, so the check-then-create below is racy — two concurrent
 * registers can both pass `findUserByEmail` and one hits the constraint.
 * Prisma 7 on the pg adapter reports it as P2002, with the Postgres SQLSTATE
 * (23505 unique_violation) buried in `meta`, so both are checked.
 */
const isUniqueViolation = (error) => {
  if (error?.code === "P2002") return true;
  return error?.meta?.driverAdapterError?.cause?.code === "23505";
};

/** The public shape of a user in auth responses — see APIs.md. */
const publicUser = (user) => ({
  id: user.id,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  role: user.role,
});

// ─────────────────────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────────────────────

export async function registerUser(req, res) {
  const { firstname, lastname, email, password, phone } = req.valid.body;

  const existing = await findUserByEmail(email);
  if (existing) {
    throw createHttpError(409, "Email already exists");
  }

  const passwordHash = await argon2.hash(password);

  // Self-signup never sets `role` or `companyId` — an ADMIN assigns those
  // later via POST/PATCH /users.
  let newUser;
  try {
    newUser = await createUser({
      firstname,
      lastname,
      email,
      passwordHash,
      phone,
      role: "STAFF",
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createHttpError(409, "Email already exists");
    }
    throw error;
  }

  res.status(201).json({
    message: "Register success",
    user: publicUser(newUser),
  });
}

// ─────────────────────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────────────────────

export async function loginUser(req, res) {
  const { email, password } = req.valid.body;

  const user = await findUserByEmail(email);

  // `user` may be null, and argon2.verify rejects (rather than returning
  // false) on a malformed hash — neither is a 500.
  let isMatch = false;
  if (user) {
    try {
      isMatch = await argon2.verify(user.passwordHash, password);
    } catch {
      isMatch = false;
    }
  }

  if (!user || !isMatch) {
    throw createHttpError(401, "Invalid credentials");
  }

  const token = createToken(user);

  res.status(200).json({
    message: "Login success",
    token,
    user: publicUser(user),
  });
}
