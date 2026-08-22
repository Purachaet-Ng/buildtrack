/**
 * ค่าใช้จ่าย: expense table plus the budget-vs-actual bar per project.
 * STAFF must never reach this route — the nav item is hidden for them and the
 * backend blocks financial data outright.
 * Needs GET/POST /expenses and GET /projects/:id/budget. Sprint 6.
 */

import { ComingSoon } from "@/components/common/ComingSoon";
import { PageHeader } from "@/components/common/PageHeader";
import { Wallet } from "lucide-react";

export function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="ค่าใช้จ่าย" subtitle="บันทึกค่าใช้จ่ายและเทียบกับงบประมาณ" />
      <ComingSoon icon={Wallet} title="ค่าใช้จ่าย" sprint="6 (Money & docs)" />
    </div>
  );
}

export default ExpensesPage;
