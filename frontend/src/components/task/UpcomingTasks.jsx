/**
 * The ภาพรวม tab's read-only peek at what is due next — five rows, no filters,
 * no actions. The full list with its controls lives one tab over; duplicating
 * it here would mean two places to keep in step.
 *
 * Sorted by dueDate ascending, which puts anything overdue at the top by
 * construction.
 */

import { EmptyState } from "@/components/common/EmptyState";
import { StatusChip } from "@/components/common/StatusChip";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/useTasks";
import { PRIORITY_META, TASK_STATUS_META } from "@/lib/constants";
import { formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const UPCOMING = 5;

const isOverdue = (task) =>
  task.dueDate &&
  task.status !== "COMPLETED" &&
  task.status !== "APPROVED" &&
  new Date(task.dueDate) < new Date();

export function UpcomingTasks({ projectId }) {
  const { data, isLoading, isError } = useTasks({
    projectId,
    limit: UPCOMING,
    sort: "dueDate",
  });

  if (isLoading) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="mt-3 text-[13px] text-muted-fg">โหลดรายการงานไม่สำเร็จ</p>
    );
  }

  const tasks = data?.data ?? [];

  if (tasks.length === 0) {
    return <EmptyState description="ยังไม่มีงานในโครงการนี้" className="py-8" />;
  }

  return (
    <ul className="mt-2 divide-y">
      {tasks.map((task) => {
        const meta = PRIORITY_META[task.priority];
        return (
          <li key={task.id} className="flex items-center gap-3 py-3">
            {meta && (
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-heading">{task.name}</p>
              <p className="truncate text-[13px] text-muted-fg">
                {task.assignedTo
                  ? `${task.assignedTo.firstname} ${task.assignedTo.lastname}`
                  : "ยังไม่มอบหมาย"}
                {" · "}
                <span
                  className={cn(
                    "tabular font-mono",
                    isOverdue(task) && "font-medium text-destructive",
                  )}
                >
                  {formatDate(task.dueDate)}
                </span>
              </p>
            </div>

            <span className="tabular shrink-0 font-mono text-[13px] text-muted-fg">
              {formatPercent(task.progressPercent ?? 0)}
            </span>
            <StatusChip
              value={task.status}
              map={TASK_STATUS_META}
              className="shrink-0"
            />
          </li>
        );
      })}
    </ul>
  );
}
