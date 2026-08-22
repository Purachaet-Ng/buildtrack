/**
 * Display formatters — money, dates, percent.
 *
 * The three rules below are not style preferences; getting any of them wrong
 * produces visibly wrong data. See UI-PROMPT.md "DATA FORMATTING RULES".
 *
 *   MONEY
 *   Amounts arrive from the API as a STRING, because Prisma stores them as
 *   Decimal(14,2). Never parseFloat / Number them — that is where precision
 *   quietly disappears. Format the string with
 *     Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
 *   and render as "฿25,000,000.00" with font-variant-numeric: tabular-nums.
 *   Money input fields are type="text", never type="number".
 *
 *   DATES
 *   English format, e.g. "13 Aug 2026" (Gregorian year, date-fns default locale).
 *
 *   PERCENT
 *   Whole number plus a % sign. No decimals anywhere in the UI.
 */

import { format, isValid, parseISO } from "date-fns";

/** What every formatter renders for a missing value. */
const EM_DASH = "—";

/**
 * The string overload of `format()` is the whole point: since ES2023 it reads a
 * decimal STRING directly, so "25000000.00" never passes through a double and
 * the two decimals the Decimal(14,2) column guarantees survive intact.
 */
const bahtFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * "25000000.00" → "฿25,000,000.00". Input stays a string throughout.
 *
 * Returns the dash for null/undefined rather than "฿0.00": STAFF responses omit
 * `budget` entirely (the backend strips the key), and a zero would be a lie.
 */
export function formatMoney(amountString) {
  if (
    amountString === null ||
    amountString === undefined ||
    amountString === ""
  ) {
    return EM_DASH;
  }
  return bahtFormatter.format(amountString);
}

/** ISO date string → "13 Aug 2026" */
export function formatDate(isoString) {
  if (!isoString) return EM_DASH;

  const date = isoString instanceof Date ? isoString : parseISO(isoString);
  if (!isValid(date)) return EM_DASH;

  return format(date, "d MMM yyyy");
}

/** ISO timestamp → "2 ชั่วโมงที่แล้ว", for the activity feed. */
// export function formatRelativeThai(/* isoString */) {
//   throw new Error("formatRelativeThai: not implemented (Sprint 7)");
// }

/** 72 → "72%". Tasks only — a PROJECT is measured by formatTaskCount below. */
export function formatPercent(value) {
  const percent = Number(value);
  if (value === null || value === undefined || Number.isNaN(percent))
    return EM_DASH;
  return `${Math.round(percent)}%`;
}

/**
 * { completed: 5, total: 12 } → "5 / 12 งาน".
 *
 * Project progress is a COUNT of finished tasks, never a percentage. The only
 * percentage available at project level would be the average of
 * `task.progressPercent`, and that is an average of estimates — it moves when
 * someone's mood about a task changes, not when work finishes. A completed
 * task is a fact, so the project reports facts.
 *
 * A project with no tasks reads "0 / 0 งาน", not the dash: an empty project is
 * a real state, and the dash is reserved for a value the API did not send.
 */
export function formatTaskCount(taskCount) {
  if (!taskCount) return EM_DASH;

  const { completed = 0, total = 0 } = taskCount;
  return `${completed} / ${total} งาน`;
}

/**
 * The same ratio as a 0–100 number — for the WIDTH of a progress bar and
 * nothing else. Never render this; the label is always the count.
 */
export function taskCompletionPercent(taskCount) {
  const { completed = 0, total = 0 } = taskCount ?? {};
  if (!total) return 0;

  return Math.round((completed / total) * 100);
}

/** Bytes → "2.4 MB", for the documents list. */
// export function formatFileSize(/* bytes */) {
//   throw new Error("formatFileSize: not implemented (Sprint 6)");
// }
