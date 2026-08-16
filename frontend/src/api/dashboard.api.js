/**
 * GET /dashboard/summary          All              KPI cards
 * GET /dashboard/tasks-by-status  All              bar chart
 * GET /dashboard/budget-usage     ADMIN, PM, CLIENT  budget vs actual chart
 * GET /dashboard/activities       All              recent activity list
 * GET /search                     All              global search
 *
 * Responses are already scoped to the caller's role — STAFF receives no
 * budgetUsedPercent at all, so the budget chart must be hidden, not zeroed.
 * Sprint 7.
 */

export {};
