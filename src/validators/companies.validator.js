import { z } from "zod";
import { CompanyType } from "@prisma/client";
/** `?status=` and `?clientCompanyId=` arrive as "" — treat as "not sent". */
const emptyToUndefined = (schema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const positiveId = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message);

const phoneRegex = /^(?:\+66|0)[689]\d{2}[- ]?\d{3}[- ]?\d{3}$/;

const roleSchema = z.enum(ROLE_VALUES);

export const companyParams = z.object({
  id: positiveId("Invalid project id"),
});

const companyBody = z.object({
  name: z
    .string({ error: "name is required" })
    .trim()
    .min(1, "name must not be empty"),
  type: z.enum(CompanyType),
  contactEmail: z.string().trim().email().nullish(),
  contactPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Invalid phone number format")
    .transform((val) => val.replace(/[- ]/g, ""))
    .nullish(),
});

export const companyParams = z.object({
  id: positiveId("Invalid project id"),
});

export const createCompanyBody = companyBody;

export const updateCompanyBody = companyBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "No fields to update",
  });
