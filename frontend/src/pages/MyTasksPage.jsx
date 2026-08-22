/**
 * งานของฉัน: every task assigned to the signed-in user across all projects,
 * grouped by due date. The engineer's home screen — responsive, cards stack.
 * Needs GET /tasks?assignedToId=me. Sprint 4.
 */

import { ComingSoon } from "@/components/common/ComingSoon";
import { PageHeader } from "@/components/common/PageHeader";
import { CircleCheck } from "lucide-react";

export function MyTasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="งานของฉัน" subtitle="งานที่มอบหมายให้คุณ จากทุกโครงการ" />
      <ComingSoon icon={CircleCheck} title="งานของฉัน" sprint="4 (Tasks & Kanban)" />
    </div>
  );
}

export default MyTasksPage;
