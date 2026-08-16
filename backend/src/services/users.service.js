import { prisma } from "../lib/prisma.js";

/**
 * Every user shape that leaves the API goes through this projection —
 * `passwordHash` must never reach a response.
 */
export const userSelect = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  role: true,
  phone: true,
  companyId: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, name: true, type: true } },
};

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

/** Full row including `passwordHash` — used by auth, never by a response. */
export const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
};

export const findUserByEmail = async (email) => {
  const user = await prisma.user.findFirst({
    where: { email },
  });
  return user;
};

//Find Users (paginated)
export const findUsers = async (where, { skip, limit, orderBy }) => {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: userSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

//Find user by ID, safe to return
export const findUserProfileById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
  return user;
};

//Check user exist
export const userExists = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  return Boolean(user);
};

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

//Create user
export const createUser = async (data) => {
  const user = await prisma.user.create({
    data,
    select: userSelect,
  });
  return user;
};

//Edit user
export const updateUser = async (id, data) => {
  const user = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
  return user;
};

//Delete user
export const deleteUser = async (id) => {
  await prisma.user.delete({ where: { id } });
};
