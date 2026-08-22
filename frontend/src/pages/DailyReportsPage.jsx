/**
 * รายงานหน้างาน list: filter by project and date, one row per report.
 * CLIENT never reaches this route.
 * Needs GET /daily-reports. Sprint 5.
 */

import { ComingSoon } from "@/components/common/ComingSoon";
import { PageHeader } from "@/components/common/PageHeader";
import { ClipboardList } from "lucide-react";

export function DailyReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="รายงานหน้างาน" subtitle="บันทึกสภาพหน้างานประจำวัน" />
      <ComingSoon icon={ClipboardList} title="รายงานหน้างาน" sprint="5 (Site workflow)" />
    </div>
  );
}

export default DailyReportsPage;
