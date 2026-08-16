import { z } from "zod";
import { ProjectStatus } from "../../generated/prisma/client.js";
import { buildOrderBy, DEFAULT_LIMIT, MAX_LIMIT } from "../utils/query.js";

const PROJECT_STATUSES = Object.values(ProjectStatus);
const SORTABLE_FIELDS = ["createdAt", "name", "startDate", "endDate", "status", "budget"];

// ─────────────────────────────────────────────────────────────
// Field helpers
// ─────────────────────────────────────────────────────────────

/** `?status=` and `?clientCompanyId=` arrive as "" — treat as "not sent". */
const emptyToUndefined = (schema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const positiveId = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message);

/**
 * z.coerce.date() would happily read a raw number as epoch ms,
 * so only strings / Date objects get through.
 */
const isoDate = (field) => {
  const message = `${field} must be a valid date (YYYY-MM-DD)`;
  return z
    .union([z.string(), z.date()], { error: message })
    .pipe(z.coerce.date({ error: message }));
};

// Money is Decimal(14,2) — 12 digits before the point, 2 after
const MAX_BUDGET = 999_999_999_999.99;
const BUDGET_FORMAT = "budget must be a number with at most 2 decimal places";

/**
 * The same rule has to hold for a JSON number and for a numeric string, so
 * both are checked in their text form — a regex on the string branch alone
 * would let 10.555 through to be silently rounded by Postgres.
 * z.coerce.number() is avoided here because it reads "" and null as 0.
 */
const budget = z
  .union([z.number(), z.string().trim()], { error: BUDGET_FORMAT })
  .superRefine((value, ctx) => {
    const text = String(value);

    if (text.startsWith("-")) {
      ctx.addIssue({ code: "custom", message: "budget must not be negative" });
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
      ctx.addIssue({ code: "custom", message: BUDGET_FORMAT });
      return;
    }
    if (Number(text) > MAX_BUDGET) {
      ctx.addIssue({ code: "custom", message: "budget must not exceed 999,999,999,999.99" });
    }
  })
  .transform(Number);

const status = z.enum(PROJECT_STATUSES, {
  error: `status must be one of ${PROJECT_STATUSES.join(", ")}`,
});

const endsAfterStart = (data) => data.endDate >= data.startDate;
const endsAfterStartError = {
  error: "endDate must be after startDate",
  path: ["endDate"],
};

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

export const projectParams = z.object({
  id: positiveId("Invalid project id"),
});

export const projectListQuery = z
  .object({
    // "" and junk fall back to the defaults instead of erroring
    page: emptyToUndefined(z.coerce.number().int().catch(1)),
    limit: emptyToUndefined(z.coerce.number().int().catch(DEFAULT_LIMIT)),
    sort: z.string().optional(),
    q: z.string().trim().optional(),
    status: emptyToUndefined(status.optional()),
    clientCompanyId: emptyToUndefined(
      positiveId("clientCompanyId must be a positive integer").optional(),
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

export const createProjectBody = z
  .object({
    name: z.string({ error: "name is required" }).trim().min(1, "name must not be empty"),
    location: z.string().trim().nullish(),
    description: z.string().trim().nullish(),
    clientCompanyId: positiveId("clientCompanyId must be a positive integer"),
    startDate: isoDate("startDate"),
    endDate: isoDate("endDate"),
    budget,
    status: status.default("PLANNING"),
  })
  .refine(endsAfterStart, endsAfterStartError);

export const updateProjectBody = z
  .object({
    name: z.string().trim().min(1, "name must not be empty"),
    location: z.string().trim().nullable(),
    description: z.string().trim().nullable(),
    clientCompanyId: positiveId("clientCompanyId must be a positive integer"),
    startDate: isoDate("startDate"),
    endDate: isoDate("endDate"),
    budget,
    status,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { error: "No fields to update" })
  // Only checkable here when both dates are sent; otherwise the controller
  // compares against the stored row.
  .refine(
    (data) => !(data.startDate && data.endDate) || endsAfterStart(data),
    endsAfterStartError,
  );
