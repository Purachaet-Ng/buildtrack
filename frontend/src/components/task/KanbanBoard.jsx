/**
 * Five columns in TASK_STATUS_ORDER, dnd-kit drag and drop.
 *
 * ── PHASE 2 / OPTIONAL (PLAN.md §4) ──────────────────────────────────
 * Moved out of the MVP on 2026-08-22 once the task LIST shipped. The board adds
 * no capability the list does not already have — both drive the same
 * PATCH /tasks/:id/status — and it is the largest block of unestimatable work
 * left in the plan. Nothing else depends on this file; it stays as a stub so
 * the intent is not lost.
 *
 * DELIBERATELY DESKTOP-ONLY (PLAN.md §6.1). Rendered from `lg:` (1024px) up;
 * below that the task LIST view is shown and the board toggle is hidden. Touch
 * DnD is not a shortcut we skipped — it is a product decision. Nobody drags
 * cards between columns on a phone.
 *
 * When it is built:
 *   - install @dnd-kit/core + @dnd-kit/sortable
 *   - add GET /projects/:id/tasks/board (the one task endpoint not yet written)
 *   - drop → PATCH /tasks/:id/status OPTIMISTICALLY, via useChangeTaskStatus in
 *     hooks/useTasks.js, which deliberately has no optimistic path today
 *   - on failure roll the card back and toast "เปลี่ยนสถานะไม่สำเร็จ"
 *   - a 403 here is a NORMAL outcome, not a bug: a STAFF user may not drag a
 *     card into APPROVED, and a CLIENT may drag into nothing else
 */

export function KanbanBoard() {
  return null;
}
