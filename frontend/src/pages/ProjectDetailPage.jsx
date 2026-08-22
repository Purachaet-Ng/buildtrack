/**
 * Project detail: header, inline summary strip, and underline tabs —
 * ภาพรวม · งาน · รายงานหน้างาน · ปัญหา · เอกสาร · ค่าใช้จ่าย · ทีมงาน.
 * The ค่าใช้จ่าย tab is hidden for STAFF.
 *
 * Sprint 3 builds the shell plus the two tabs whose API already exists —
 * ภาพรวม and ทีมงาน. The other four render an EmptyState naming the sprint they
 * arrive in, rather than an empty panel that reads as a bug.
 *
 * Two queries, deliberately not one: GET /projects/:id is the row, and
 * GET /projects/:id/summary aggregates over tasks, expenses and issues. They go
 * stale on different writes, so they get separate keys. The detail query is the
 * same one AppBreadcrumb calls, so the crumb costs no extra request.
 */

import { ComingSoon } from "@/components/common/ComingSoon";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { DeleteProject } from "@/components/project/DeleteProject";
import { EditProject } from "@/components/project/EditProject";
import { MemberList } from "@/components/project/MemberList";
import { TaskList } from "@/components/task/TaskList";
import { UpcomingTasks } from "@/components/task/UpcomingTasks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermission } from "@/hooks/usePermission";
import { useProjectDetail, useProjectSummary } from "@/hooks/useProject";
import { PROJECT_STATUS_META } from "@/lib/constants";
import {
  formatDate,
  formatMoney,
  formatTaskCount,
  taskCompletionPercent,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  EllipsisVertical,
  FileText,
  Pencil,
  Trash2,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Same pair as the projects list: dark teal on a light track. NOT the brand
// orange — at 2.26:1 the filled and empty halves stop reading as two things.
const PROGRESS_TRACK = "h-1.5 bg-[#E8ECED]";
const PROGRESS_FILL = "bg-primary-900";

/**
 * UI-PROMPT.md: the active tab is a 2px #E08A00 underline, never a pill. The
 * `line` variant supplies the underline; this repaints it in the action color,
 * which the shadcn default leaves as `foreground`.
 */
const TAB_TRIGGER =
  "flex-none px-3 after:bg-action-500 data-[state=active]:text-heading";

/** One inline stat in the summary strip. */
function Stat({ label, children, className }) {
  return (
    <div className={cn("min-w-0 flex-1 px-4 first:pl-0 last:pr-0", className)}>
      <p className="text-[13px] text-muted-fg">{label}</p>
      <div className="mt-1 text-[15px] font-medium text-heading">{children}</div>
    </div>
  );
}

/**
 * Inline stats separated by 1px dividers — not cards (UI-PROMPT.md).
 *
 * STAFF gets a different set, because the backend omits budget / spent /
 * remaining from the summary entirely for that role. The test is on the KEY,
 * not on falsiness: a project with a zero budget is a real thing.
 *
 * ความคืบหน้า now spends the two numbers STAFF used to get as separate
 * งานทั้งหมด / งานเสร็จแล้ว stats, so those are gone — repeating "5" and "12"
 * three inches apart is noise. งานเกินกำหนด takes the free slot: `overdue` was
 * already in the summary payload and had nowhere to show.
 */
function SummaryStrip({ summary }) {
  const showsMoney = summary.budget !== undefined;
  const overBudget = showsMoney && Number(summary.budgetUsedPercent) > 100;
  const overdueTasks = summary.taskCount?.overdue ?? 0;

  return (
    <div className="flex flex-wrap divide-x rounded-lg border bg-card px-4 py-4">
      {/* Wider basis than its neighbours and a narrower bar: "1 / 5 งาน" is a
          longer label than the "72%" this stat used to hold, and the four
          stats share one row. nowrap so it breaks the row before it breaks
          the number in half. */}
      <Stat label="ความคืบหน้า" className="sm:flex-[1.4]">
        <div className="flex items-center gap-2">
          <Progress
            value={taskCompletionPercent(summary.taskCount)}
            className={cn("w-16 shrink-0", PROGRESS_TRACK)}
            indicatorClassName={PROGRESS_FILL}
          />
          <span className="tabular font-mono text-[15px] whitespace-nowrap">
            {formatTaskCount(summary.taskCount)}
          </span>
        </div>
      </Stat>

      {showsMoney ? (
        <>
          <Stat label="งบประมาณ">
            <span className="tabular font-mono">
              {formatMoney(summary.budget)}
            </span>
          </Stat>
          <Stat label="ใช้ไปแล้ว">
            {/* #B3261E when spent exceeds budget — the seed data has a
                deliberately over-budget project, so this is reachable. */}
            <span
              className={cn(
                "tabular font-mono",
                overBudget && "text-destructive",
              )}
            >
              {formatMoney(summary.spent)}
            </span>
          </Stat>
          <Stat label="เหลือ">
            <span
              className={cn(
                "tabular font-mono",
                overBudget && "text-destructive",
              )}
            >
              {formatMoney(summary.remaining)}
            </span>
          </Stat>
        </>
      ) : (
        <>
          <Stat label="งานเกินกำหนด">
            {/* Same #B3261E the money stats use for over-budget: a late task
                is the one number here that asks for something to be done. */}
            <span
              className={cn(
                "tabular font-mono",
                overdueTasks > 0 && "text-destructive",
              )}
            >
              {overdueTasks}
            </span>
          </Stat>
          <Stat label="ปัญหาที่เปิดอยู่">
            <span className="tabular font-mono">{summary.openIssues ?? 0}</span>
          </Stat>
        </>
      )}
    </div>
  );
}

/** Header actions — the same edit/delete pair the list row offers. */
function ProjectActions({ project }) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const [dialog, setDialog] = useState(null); // "edit" | "delete" | null

  const closeDialog = (next) => {
    if (!next) setDialog(null);
  };

  if (!can("project:update") && !can("project:delete")) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={`การดำเนินการสำหรับ ${project.name}`}
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {can("project:update") && (
            <DropdownMenuItem onSelect={() => setDialog("edit")}>
              <Pencil />
              แก้ไข
            </DropdownMenuItem>
          )}
          {can("project:delete") && (
            <>
              {can("project:update") && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDialog("delete")}
              >
                <Trash2 />
                ลบ
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === "edit" && (
        <EditProject project={project} open onOpenChange={closeDialog} />
      )}
      {dialog === "delete" && (
        <DeleteProject
          project={project}
          open
          onOpenChange={closeDialog}
          // This page is sitting on a URL that no longer exists.
          onDeleted={() => navigate("/projects", { replace: true })}
        />
      )}
    </>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const { can } = usePermission();

  const { data, isLoading, isError, error } = useProjectDetail(id);
  const { data: summary } = useProjectSummary(id);

  const project = data?.project;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // 403 and 404 both land here. The backend does not distinguish "you may not
  // see this" from "this does not exist" for a non-member, and neither should
  // the copy.
  if (isError || !project) {
    return (
      <EmptyState
        title="ไม่พบโครงการนี้"
        description={
          error?.message ?? "โครงการอาจถูกลบไปแล้ว หรือคุณไม่มีสิทธิ์เข้าถึง"
        }
        className="rounded-lg border bg-card"
      />
    );
  }

  const dateRange = `${formatDate(project.startDate)} – ${formatDate(project.endDate)}`;
  const subtitle = [project.location, dateRange].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {project.name}
            <StatusChip value={project.status} map={PROJECT_STATUS_META} />
          </span>
        }
        subtitle={subtitle}
        actions={<ProjectActions project={project} />}
      />

      {summary && <SummaryStrip summary={summary} />}

      <Tabs defaultValue="overview">
        {/* overflow-x-auto, because seven Thai labels do not fit at 375px and
            the page itself must never scroll sideways (PLAN.md §6.1). */}
        <TabsList
          variant="line"
          className="h-auto w-full justify-start overflow-x-auto"
        >
          <TabsTrigger value="overview" className={TAB_TRIGGER}>
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="tasks" className={TAB_TRIGGER}>
            งาน
          </TabsTrigger>
          <TabsTrigger value="reports" className={TAB_TRIGGER}>
            รายงานหน้างาน
          </TabsTrigger>
          <TabsTrigger value="issues" className={TAB_TRIGGER}>
            ปัญหา
          </TabsTrigger>
          <TabsTrigger value="documents" className={TAB_TRIGGER}>
            เอกสาร
          </TabsTrigger>
          {/* STAFF must not reach financial data anywhere in the app. */}
          {can("money:view") && (
            <TabsTrigger value="expenses" className={TAB_TRIGGER}>
              ค่าใช้จ่าย
            </TabsTrigger>
          )}
          <TabsTrigger value="team" className={TAB_TRIGGER}>
            ทีมงาน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <section className="rounded-lg border bg-card p-5">
                <h2 className="text-[15px] font-semibold text-heading">
                  รายละเอียดโครงการ
                </h2>
                <p className="mt-3 text-[13px] whitespace-pre-line text-muted-fg">
                  {project.description || "ยังไม่มีคำอธิบายโครงการ"}
                </p>

                <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[13px] text-muted-fg">ลูกค้า</dt>
                    <dd className="mt-0.5 text-[15px] text-heading">
                      {project.clientCompany?.name ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-muted-fg">สถานที่</dt>
                    <dd className="mt-0.5 text-[15px] text-heading">
                      {project.location || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-muted-fg">วันเริ่ม</dt>
                    <dd className="tabular mt-0.5 font-mono text-[15px] text-heading">
                      {formatDate(project.startDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-muted-fg">
                      วันสิ้นสุด
                      {summary?.daysRemaining !== undefined &&
                        ` (เหลือ ${summary.daysRemaining} วัน)`}
                    </dt>
                    <dd className="tabular mt-0.5 font-mono text-[15px] text-heading">
                      {formatDate(project.endDate)}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* The five most urgent, as a read-only peek. The full list with
                  its filters lives one tab over rather than being duplicated. */}
              <section className="rounded-lg border bg-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[15px] font-semibold text-heading">
                    งานที่ใกล้ถึงกำหนด
                  </h2>
                </div>
                <UpcomingTasks projectId={id} />
              </section>
            </div>

            <div className="flex flex-col gap-6">
              <ComingSoon
                icon={TriangleAlert}
                title="ปัญหาที่เปิดอยู่"
                sprint="5 (Site workflow)"
              />

              <section className="rounded-lg border bg-card p-5">
                <h2 className="text-[15px] font-semibold text-heading">
                  ทีมงาน
                </h2>
                <MemberList projectId={id} compact className="mt-2" />
              </section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <TaskList projectId={id} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ComingSoon
            icon={ClipboardList}
            title="รายงานหน้างาน"
            sprint="5 (Site workflow)"
          />
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <ComingSoon
            icon={TriangleAlert}
            title="ปัญหาหน้างาน"
            sprint="5 (Site workflow)"
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <ComingSoon icon={FileText} title="เอกสาร" sprint="6 (Money & docs)" />
        </TabsContent>

        {can("money:view") && (
          <TabsContent value="expenses" className="mt-6">
            <ComingSoon
              icon={Wallet}
              title="ค่าใช้จ่าย"
              sprint="6 (Money & docs)"
            />
          </TabsContent>
        )}

        <TabsContent value="team" className="mt-6">
          <section className="rounded-lg border bg-card p-5">
            <MemberList projectId={id} />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
