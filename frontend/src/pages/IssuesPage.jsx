/**
 * ปัญหาหน้างาน: table + filter chips, right-side 480px detail drawer, and a
 * new-issue dialog whose form is MOBILE-FIRST. CLIENT never reaches this route.
 * Needs GET/POST /issues. Sprint 5.
 */

import { ComingSoon } from "@/components/common/ComingSoon";
import { PageHeader } from "@/components/common/PageHeader";
import { TriangleAlert } from "lucide-react";

export function IssuesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="ปัญหาหน้างาน" subtitle="แจ้งและติดตามปัญหาที่เกิดขึ้นในโครงการ" />
      <ComingSoon icon={TriangleAlert} title="ปัญหาหน้างาน" sprint="5 (Site workflow)" />
    </div>
  );
}

export default IssuesPage;
