/**
 * Display formatters — money, dates, percent.
 *
 * Sprint 3 fills these in. The three rules below are not style preferences;
 * getting any of them wrong produces visibly wrong data. See UI-PROMPT.md
 * "DATA FORMATTING RULES".
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
 *   Thai Buddhist era, e.g. "13 ส.ค. 2569" (Gregorian year + 543).
 *   Use date-fns with the `th` locale.
 *
 *   PERCENT
 *   Whole number plus a % sign. No decimals anywhere in the UI.
 */

/** "25000000.00" → "฿25,000,000.00". Input stays a string throughout. */
export function formatMoney(/* amountString */) {
  throw new Error("formatMoney: not implemented (Sprint 3)");
}

/** ISO date string → "13 ส.ค. 2569" */
export function formatThaiDate(/* isoString */) {
  throw new Error("formatThaiDate: not implemented (Sprint 3)");
}

/** ISO timestamp → "2 ชั่วโมงที่แล้ว", for the activity feed. */
export function formatRelativeThai(/* isoString */) {
  throw new Error("formatRelativeThai: not implemented (Sprint 7)");
}

/** 72 → "72%" */
export function formatPercent(/* value */) {
  throw new Error("formatPercent: not implemented (Sprint 3)");
}

/** Bytes → "2.4 MB", for the documents list. */
export function formatFileSize(/* bytes */) {
  throw new Error("formatFileSize: not implemented (Sprint 6)");
}
