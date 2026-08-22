/**
 * Mirrors backend/src/validators/users.validator.js so a bad value is caught
 * before the round-trip. The backend re-validates everything regardless — this
 * is a courtesy to the person filling the form, not a security boundary.
 *
 * Messages are rendered verbatim under the inputs, so they are written for that
 * person and not for a stack trace.
 */

import { ROLES } from "@/lib/constants";
import { z } from "zod";

const USER_ROLES = Object.values(ROLES);

/**
 * The documented 3/3/4 grouping: +66 or a leading 0, then 8/9/6 as the mobile
 * prefix. Separators are optional and are stripped before the value is sent,
 * matching the backend's `.transform()`.
 */
const PHONE_FORMAT = /^(?:\+66|0)[689]\d[- ]?\d{3}[- ]?\d{4}$/;

const name = (field, label) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

// Lowercased here as well as on the backend: the @unique index is on the stored
// value, so "A@x.com" and "a@x.com" must collide rather than both be accepted.
const email = z
  .string({ error: "Email is required" })
  .trim()
  .email("Invalid email format")
  .toLowerCase();

const password = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters");

const role = z.enum(USER_ROLES, {
  error: `Role must be one of ${USER_ROLES.join(", ")}`,
});

/**
 * Optional. "" from an untouched field means "absent", not an empty string —
 * `phone` is nullable in the schema, so a blank must arrive as null rather than
 * be stored as "" and then be treated as "empty" everywhere it is read.
 */
const phone = z
  .string()
  .trim()
  .refine((value) => value === "" || PHONE_FORMAT.test(value), {
    error: "Invalid phone number format (e.g. 081-234-5678)",
  })
  .transform((value) => (value === "" ? null : value.replace(/[- ]/g, "")))
  .nullish();

/**
 * Optional: a CLIENT belongs to their company, but an internal user need not.
 * The Select uses a "NONE" sentinel for the empty case (Radix refuses value="")
 * and the form maps it back to null before this schema sees it.
 */
const companyId = z
  .union([z.literal(""), z.null(), z.undefined(), z.coerce.number()])
  .transform((value) =>
    value === "" || value === undefined ? null : value,
  )
  .refine(
    (value) => value === null || (Number.isInteger(value) && value > 0),
    { error: "Select a valid company" },
  );

const userBody = z.object({
  firstname: name("firstname", "First name"),
  lastname: name("lastname", "Last name"),
  email,
  role,
  phone,
  companyId,
});

export const createUserSchema = userBody.extend({ password });

/**
 * `.partial()` so a complete body is valid — EditUser sends every field rather
 * than diffing, exactly as EditProject does, and relies on `requireDirty` to
 * keep an untouched form from firing a no-op PATCH.
 *
 * `password` is optional and blank means "leave it alone": EditUser strips the
 * key when it is empty, because the backend's min(8) would reject "".
 */
export const updateUserSchema = userBody.partial().extend({
  password: z.union([z.literal(""), password]).optional(),
});
