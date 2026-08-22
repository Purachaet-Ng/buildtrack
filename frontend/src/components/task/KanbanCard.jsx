/**
 * Priority dot, task name, progress bar + percent, then a footer of assignee
 * avatar, due date, and comment count. Overdue due dates render in #B3261E.
 *
 * Draggable only when the current user may move it: STAFF only for tasks
 * assigned to them, CLIENT never — mirror canTransitionStatus in
 * backend/src/services/tasks.service.js rather than re-deriving the rule.
 *
 * PHASE 2 / OPTIONAL, with KanbanBoard — see the note there.
 */

export function KanbanCard() {
  return null;
}
