/**
 * งานของฉัน: every task assigned to the signed-in user, across all projects.
 * The engineer's home screen — responsive with no fuss, cards stack below `md:`
 * through the shared DataTable (PLAN.md §6.1).
 *
 * The list itself is TaskList in its user-scoped mode; this page is the route,
 * the heading and nothing else.
 */

import { PageHeader } from "@/components/common/PageHeader";
import { TaskList } from "@/components/task/TaskList";

export function MyTasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="งานของฉัน"
        subtitle="งานที่มอบหมายให้คุณ จากทุกโครงการ เรียงตามกำหนดส่ง"
      />
      <TaskList />
    </div>
  );
}

export default MyTasksPage;
