/**
 * แดชบอร์ด: 4 KPI cards, 2 Recharts charts, recent activity list. Desktop-first. STAFF sees no budget chart and no currency anywhere; CLIENT sees no overdue card.
 * Sprint 7.
 */

import { SkeletonTable } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";
import React from "react";

function DashboardPage() {
  const { data: user, isLoading, isError } = useUser();

  if (isLoading) return <SkeletonTable className="h-20 w-full" />;
  if (isError) return <div>Failed to load dashboard.</div>;

  return <div>DashboardPage — {user?.data?.firstname}</div>;
}

export default DashboardPage;
