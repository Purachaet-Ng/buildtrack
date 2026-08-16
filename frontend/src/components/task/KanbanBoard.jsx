/**
 * Five columns in TASK_STATUS_ORDER, dnd-kit drag and drop.
 *
 * DELIBERATELY DESKTOP-ONLY (PLAN.md §6.1). Rendered from `lg:` (1024px) up;
 * below that the task LIST view is shown and the board toggle is hidden. Touch
 * DnD is not a shortcut we skipped — it is a product decision. Nobody drags
 * cards between columns on a phone.
 *
 * Drop → PATCH /tasks/:id/status optimistically; on failure roll the card back
 * and toast "เปลี่ยนสถานะไม่สำเร็จ".
 *
 * Sprint 4. Install @dnd-kit/core + @dnd-kit/sortable then.
 */

export function KanbanBoard() {
  return null;
}
