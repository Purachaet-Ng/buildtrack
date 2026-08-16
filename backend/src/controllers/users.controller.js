import createHttpError from "http-errors";
import argon2 from "argon2";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserProfileById,
  findUsers,
  updateUser,
} from "../services/users.service.js";
import { companyExists } from "../services/companies.service.js";
import { buildPagination } from "../utils/query.js";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const loadUser = async (userId) => {
  const user = await findUserProfileById(userId);
  if (!user) throw createHttpError(404, "User not found");
  return user;
};

/** `email` is @unique — this turns the DB conflict into the 409 APIs.md asks for. */
const assertEmailAvailable = async (email, exceptId) => {
  const existing = await findUserByEmail(email);
  if (existing && existing.id !== exceptId) {
    throw createHttpError(409, "Email already in use");
  }
};

const assertCompanyExists = async (companyId) => {
  if (!(await companyExists(companyId))) {
    throw createHttpError(404, "Company not found");
  }
};

/**
 * Turns the plaintext `password` into `passwordHash`; leaves the rest alone.
 */
const withHashedPassword = async ({ password, ...rest }) => {
  if (password === undefined) return rest;
  return { ...rest, passwordHash: await argon2.hash(password) };
};

/**
 * A user referenced by an onDelete: Restrict relation cannot be removed.
 * Prisma 7 on the pg adapter reports this as P2039 with the Postgres SQLSTATE
 * buried in `meta` (23001 restrict_violation / 23503 foreign_key_violation),
 * so the raw code is checked as well as P2003.
 */
const isRestrictViolation = (error) => {
  if (error?.code === "P2003") return true;
  const driverCode = error?.meta?.driverAdapterError?.cause?.code;
  return driverCode === "23001" || driverCode === "23503";
};

// ─────────────────────────────────────────────────────────────
// GET /users
// ─────────────────────────────────────────────────────────────

export async function listUsers(req, res) {
  const { page, limit, skip, orderBy, q, role, companyId } = req.valid.query;

  const where = {};

  if (q) {
    where.OR = [
      { firstname: { contains: q, mode: "insensitive" } },
      { lastname: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (companyId) where.companyId = companyId;

  const { users, total } = await findUsers(where, { skip, limit, orderBy });

  res.status(200).json({
    data: users,
    pagination: buildPagination({ page, limit, total }),
  });
}

// ─────────────────────────────────────────────────────────────
// POST /users
// ─────────────────────────────────────────────────────────────

export async function addUser(req, res) {
  const data = req.valid.body;

  if (data.companyId) await assertCompanyExists(data.companyId);
  await assertEmailAvailable(data.email);

  const user = await createUser(await withHashedPassword(data));

  res.status(201).json({
    message: "User created",
    data: user,
  });
}

// ─────────────────────────────────────────────────────────────
// GET /users/me
// ─────────────────────────────────────────────────────────────

export async function getMe(req, res) {
  const user = await loadUser(req.user.id);

  res.status(200).json({
    data: user,
  });
}

// ─────────────────────────────────────────────────────────────
// PATCH /users/me
// ─────────────────────────────────────────────────────────────

export async function editMe(req, res) {
  const id = req.user.id;
  const data = req.valid.body;

  await loadUser(id);

  if (data.email) await assertEmailAvailable(data.email, id);

  const user = await updateUser(id, data);

  res.status(200).json({
    message: "Profile updated",
    data: user,
  });
}

// ─────────────────────────────────────────────────────────────
// GET /users/:id
// ─────────────────────────────────────────────────────────────

export async function getUser(req, res) {
  const { id } = req.valid.params;
  const user = await loadUser(id);

  res.status(200).json({
    data: user,
  });
}

// ─────────────────────────────────────────────────────────────
// PATCH /users/:id
// ─────────────────────────────────────────────────────────────

export async function editUser(req, res) {
  const { id } = req.valid.params;
  const data = req.valid.body;

  await loadUser(id);

  if (data.email) await assertEmailAvailable(data.email, id);
  if (data.companyId) await assertCompanyExists(data.companyId);

  const user = await updateUser(id, await withHashedPassword(data));

  res.status(200).json({
    message: "User updated",
    data: user,
  });
}

// ─────────────────────────────────────────────────────────────
// DELETE /users/:id
// ─────────────────────────────────────────────────────────────

export async function removeUser(req, res) {
  const { id } = req.valid.params;

  // Deleting yourself would lock the last ADMIN out of the system
  if (req.user.id === id) {
    throw createHttpError(400, "You cannot delete your own account");
  }

  await loadUser(id);

  try {
    await deleteUser(id);
  } catch (error) {
    // Documents / daily reports / issues / expenses are onDelete: Restrict
    if (isRestrictViolation(error)) {
      throw createHttpError(
        409,
        "User has related records and cannot be deleted",
      );
    }
    throw error;
  }

  res.status(200).json({ message: "User deleted" });
}
