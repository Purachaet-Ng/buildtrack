/**
 * แดชบอร์ด: 4 KPI cards, 2 Recharts charts, recent activity list. Desktop-first.
 * STAFF sees no budget chart and no currency anywhere; CLIENT sees no overdue card.
 * Needs GET /dashboard/summary and Recharts. Sprint 7.
 *
 * Until then this is the same ComingSoon placeholder the other unbuilt screens
 * use — it is the landing route, so a debug string here is the first thing
 * anyone signing in would see.
 */

import { ComingSoon } from "@/components/common/ComingSoon";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";
import { LayoutDashboard } from "lucide-react";

function DashboardPage() {
  // GET /users/me — the greeting is the one real thing on this screen, and it
  // doubles as a check that the session survived a reload.
  const { data, isLoading } = useUser();
  const firstname = data?.data?.firstname;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="แดชบอร์ด"
        subtitle={
          isLoading ? undefined : `ยินดีต้อนรับ${firstname ? ` ${firstname}` : ""}`
        }
      />
      {isLoading && <Skeleton className="h-4 w-48" />}
      <ComingSoon
        icon={LayoutDashboard}
        title="ภาพรวมทั้งระบบ"
        sprint="7 (Dashboard & polish)"
      />
    </div>
  );
}

export default DashboardPage;
