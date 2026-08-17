/**
 * Budget vs actual: a 10px stacked bar, spent in #042630, remaining in #E8ECED
 * (13.32:1 — the two halves have to be separable, which is why the fill is the
 * dark teal and NOT the brand orange: #E08A00 on that track is only 2.26:1).
 * When spent exceeds budget the whole bar turns #B3261E and a "เกินงบประมาณ"
 * chip appears — the seed data has a deliberately over-budget project, so this
 * branch is reachable on day one.
 *
 * Takes budget/spent as STRINGS. Compare them without parseFloat.
 * Sprint 6.
 */

export function BudgetBar() {
  return null;
}
