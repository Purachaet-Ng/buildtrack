import { z } from "zod";
import { CompanyType } from "../../generated/prisma/client.js";

const COMPANY_TYPES = Object.values(CompanyType);

// ─────────────────────────────────────────────────────────────
// Field helpers
// ─────────────────────────────────────────────────────────────

/** `?status=` and `?clientCompanyId=` arrive as "" — treat as "not sent". */
const emptyToUndefined = (schema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const positiveId = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message);

const phoneRegex = /^(?:\+66|0)[689]\d{2}[- ]?\d{3}[- ]?\d{3}$/;

const type = z.enum(COMPANY_TYPES, {
  error: `role must be one of ${COMPANY_TYPES.join(", ")}`,
});

const name = (field) =>
  z
    .string({ error: `${field} is reqired` })
    .trim()
    .min(1, `${field} must not empty`);

const contactEmail = z
  .string({ error: "email is required" })
  .trim()
  .email("Invalid email format")
  .toLowerCase()
  .nullish();

const contactPhone = z
  .string()
  .trim()
  .regex(phoneRegex, "Invalid phone number format")
  .transform((val) => val.replace(/[- ]/g, ""))
  .nullish();

//─────────────────────────────────────────────────────────────
// For Params
//─────────────────────────────────────────────────────────────
export const companyParams = z.object({
  id: positiveId("Invalid project id"),
});

//─────────────────────────────────────────────────────────────
// For Body
//─────────────────────────────────────────────────────────────

const companyBody = z.object({
  name: name("name"),
  type,
  contactEmail,
  contactPhone,
});

export const createCompanyBody = companyBody;

export const updateCompanyBody = companyBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "No fields to update",
  });
