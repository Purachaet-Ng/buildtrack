import { prisma } from "../lib/prisma.js";

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

export const createUSer = async (
  firstname,
  lastname,
  email,
  hashPassword,
  phone,
  role,
  companyId,
) => {
  const newUser = await prisma.user.create({
    data: {
      firstname,
      lastname,
      email,
      passwordHash: hashPassword,
      phone,
      role,
      companyId,
    },
  });
  return newUser;
};
