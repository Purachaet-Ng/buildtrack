/**
 * The daily report form is a ROUTE, not a dialog — it is too long for a modal and
 * it is filled in on a phone at the end of the day.
 *
 * MOBILE-FIRST (PLAN.md §6.1): designed at 375px before its desktop layout
 * exists, 44px minimum tap targets. Serves both /daily-reports/new and
 * /daily-reports/:id/edit.
 * Needs POST/PATCH /daily-reports. Sprint 5.
 */

import { ComingSoon } from "@/components/common/ComingSoon";
import { PageHeader } from "@/components/common/PageHeader";
import { ClipboardList } from "lucide-react";

export function DailyReportFormPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="ส่งรายงานหน้างาน" subtitle="กรอกจากหน้างาน ออกแบบสำหรับมือถือก่อน" />
      <ComingSoon icon={ClipboardList} title="ส่งรายงานหน้างาน" sprint="5 (Site workflow)" />
    </div>
  );
}

export default DailyReportFormPage;
