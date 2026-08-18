import { z } from "zod";
import { UserRole } from "../../generated/prisma/client.js";
import { buildOrderBy, DEFAULT_LIMIT, MAX_LIMIT } from "../utils/query.js";

const USER_ROLES = Object.values(UserRole);
const SORTABLE_FIELDS = ["createdAt", "firstname", "lastname", "email", "role"];

// ─────────────────────────────────────────────────────────────
// Field helpers
// ─────────────────────────────────────────────────────────────

/** `?role=` and `?companyId=` arrive as "" — treat as "not sent". */
const emptyToUndefined = (schema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const positiveId = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message);

const phoneRegex = /^(?:\+66|0)[689]\d[- ]?\d{3}[- ]?\d{4}$/;

const role = z.enum(USER_ROLES, {
  error: `role must be one of ${USER_ROLES.join(", ")}`,
});

const name = (field) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(1, `${field} must not be empty`);

// Stored lowercase so the @unique index also blocks case variants
const email = z
  .string({ error: "email is required" })
  .trim()
  .email("Invalid email format")
  .toLowerCase();

const password = z
  .string({ error: "password is required" })
  .min(8, "password must be at least 8 characters");

const phone = z
  .string()
  .trim()
  .regex(phoneRegex, "Invalid phone number format")
  .transform((val) => val.replace(/[- ]/g, ""))
  .nullish();

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

export const userParams = z.object({
  id: positiveId("Invalid user id"),
});

export const userListQuery = z
  .object({
    // "" and junk fall back to the defaults instead of erroring
    page: emptyToUndefined(z.coerce.number().int().catch(1)),
    limit: emptyToUndefined(z.coerce.number().int().catch(DEFAULT_LIMIT)),
    sort: z.string().optional(),
    q: z.string().trim().optional(),
    role: emptyToUndefined(role.optional()),
    companyId: emptyToUndefined(
      positiveId("companyId must be a positive integer").optional(),
    ),
  })
  .transform(({ page, limit, sort, ...rest }) => {
    // Out-of-range paging is clamped rather than rejected (APIs.md: max 100)
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));

    return {
      ...rest,
      page: safePage,
      limit: safeLimit,
      skip: (safePage - 1) * safeLimit,
      orderBy: buildOrderBy(sort, SORTABLE_FIELDS),
    };
  });

const userBody = z.object({
  firstname: name("firstname"),
  lastname: name("lastname"),
  email,
  password,
  role,
  phone,
  companyId: positiveId("companyId must be a positive integer").nullish(),
});

// `.default()` lives here and not on the shared shape: `.partial()` keeps a
// default alive, so PATCH with no `role` would quietly reset it to STAFF.
export const createUserBody = userBody.extend({
  role: role.default("STAFF"),
});

export const updateUserBody = userBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "No fields to update",
  });

/**
 * Self-service profile edit. `role`, `companyId` and `password` are absent by
 * design — a user must not be able to promote or reassign themselves, and a
 * password change needs current-password verification.
 */
export const updateMeBody = userBody
  .pick({ firstname: true, lastname: true, email: true, phone: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "No fields to update",
  });
