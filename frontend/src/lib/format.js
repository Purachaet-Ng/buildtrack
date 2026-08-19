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

/** 72 → "72%" */
export function formatPercent(value) {
  const percent = Number(value);
  if (value === null || value === undefined || Number.isNaN(percent))
    return EM_DASH;
  return `${Math.round(percent)}%`;
}

/** Bytes → "2.4 MB", for the documents list. */
// export function formatFileSize(/* bytes */) {
//   throw new Error("formatFileSize: not implemented (Sprint 6)");
// }
