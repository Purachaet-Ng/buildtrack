import { PROJECT_STATUS } from "@/lib/constants";
import { z } from "zod";
const PROJECT_STATUSES = Object.values(PROJECT_STATUS);
const MAX_BUDGET = 999_999_999_999.99;
const BUDGET_FORMAT = "budget must be a number with at most 2 decimal places";

/**
 * These messages are rendered verbatim under the inputs, so they are written for
 * the person filling the form, not for a stack trace. The message is repeated on
 * each branch of the union on purpose: an `undefined` value fails the branches
 * before the union-level error is reached, and zod reports the branch's own
 * message ("expected string, received undefined") if you leave it unset.
 */
const isoDate = (field) => {
  const message = `${field} is required`;
  return z
    .union([z.string({ error: message }), z.date({ error: message })], {
      error: message,
    })
    .pipe(z.coerce.date({ error: `${field} must be a valid date` }));
};
const positiveId = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message);

const name = z.string().trim().min(1, "Project name is required");
const location = z.string().trim().nullish();
const description = z.string().trim().nullish();
const clientCompanyId = positiveId("Select a client company");
const budget = z
  .union([z.number(), z.string().trim()], { error: BUDGET_FORMAT })
  .superRefine((value, ctx) => {
    const text = String(value).trim();

    // An untouched field arrives as "" and would otherwise fall through to the
    // format regex, which reports a decimal-places problem for a blank input.
    if (text === "") {
      ctx.addIssue({ code: "custom", message: "Budget is required" });
      return;
    }
    if (text.startsWith("-")) {
      ctx.addIssue({ code: "custom", message: "budget must not be negative" });
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
      ctx.addIssue({ code: "custom", message: BUDGET_FORMAT });
      return;
    }
    if (Number(text) > MAX_BUDGET) {
      ctx.addIssue({
        code: "custom",
        message: "budget must not exceed 999,999,999,999.99",
      });
    }
  })
  .transform(Number);

const status = z.enum(PROJECT_STATUSES, {
  error: `status must be one of ${PROJECT_STATUSES.join(", ")}`,
});

const projectBody = z.object({
  name,
  location,
  description,
  clientCompanyId,
  startDate: isoDate("startDate"),
  endDate: isoDate("endDate"),
  budget,
  status,
});

export const createProjectSchema = projectBody;

export const updateProjectSchema = projectBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "No fields to update",
  });
