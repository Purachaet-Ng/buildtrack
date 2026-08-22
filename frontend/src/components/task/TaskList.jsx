/**
 * The task list — the งาน tab on a project, and งานของฉัน across all projects.
 *
 * One component, two modes, because the two screens differ only in scope and in
 * one column:
 *   projectId given → the project's tasks, with a create button
 *   projectId absent → tasks assigned to the signed-in user, with a project column
 *
 * Consumes the shared <DataTable />, so the table chrome, the sortable headers,
 * the pagination bar and the card fallback below `md:` all come from there
 * (PLAN.md §6.1). What lives here is the columns, the filters and the query.
 *
 * Sub-tasks render FLAT, with the parent's name as a secondary line under the
 * task name — the same treatment `location` gets under a project name. A real
 * WBS tree means teaching DataTable about row nesting, which is a bigger change
 * than this sprint needs.
 */

import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusChip } from "@/components/common/StatusChip";
import { AddTask } from "@/components/task/AddTask";
import { DeleteTask } from "@/components/task/DeleteTask";
import { EditTask } from "@/components/task/EditTask";
import { UpdateProgress } from "@/components/task/UpdateProgress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermission } from "@/hooks/usePermission";
import { useTasks } from "@/hooks/useTasks";
import {
  DEFAULT_PAGE_SIZE,
  PRIORITY_META,
  TASK_STATUS_META,
} from "@/lib/constants";
import { formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import {
  EllipsisVertical,
  Gauge,
  ListChecks,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Radix Select refuses an item with value="", so "ทั้งหมด" needs a sentinel.
const ALL = "ALL";

// What backend/src/validators/tasks.validator.js will actually order by —
// anything else silently falls back to -createdAt, so the header must not
// offer it. `assignee` and `project` are absent for that reason: relations.
const SORTABLE_COLUMNS = new Set([
  "name",
  "status",
  "priority",
  "dueDate",
  "progressPercent",
]);

const DEFAULT_SORT = "dueDate";

// The 6px bar from UI-PROMPT.md: track #E8ECED, fill #042630. NOT the brand
// orange — at 2.26:1 the filled and empty halves stop reading as two things.
const PROGRESS_TRACK = "h-1.5 bg-[#E8ECED]";
const PROGRESS_FILL = "bg-primary-900";

const columnHelper = createColumnHelper();

const fullName = (user) =>
  user ? `${user.firstname} ${user.lastname}` : "ยังไม่มอบหมาย";

/**
 * Row menu. Two different rights, and a STAFF user holds only the second:
 *
 *   task:manage  edit and delete        ADMIN, PM
 *   progress     update the percentage  ADMIN, PM, or the assignee
 *
 * The second cannot come from the permission matrix, because it depends on the
 * ROW — hence the explicit assignee comparison. It mirrors canUpdateProgress in
 * backend/src/services/tasks.service.js, which is where it is actually enforced.
 */
function RowActions({ task }) {
  const { can } = usePermission();
  const { user } = useAuth();
  const [dialog, setDialog] = useState(null); // "edit" | "delete" | "progress"

  const closeDialog = (next) => {
    if (!next) setDialog(null);
  };

  const canManage = can("task:manage");
  const canProgress = canManage || task.assignedToUserId === user?.id;

  // A CLIENT, and a STAFF looking at a colleague's task, get no menu at all
  // rather than a menu of disabled items.
  if (!canManage && !canProgress) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`การดำเนินการสำหรับ ${task.name}`}
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canProgress && (
            <DropdownMenuItem onSelect={() => setDialog("progress")}>
              <Gauge />
              อัปเดตความคืบหน้า
            </DropdownMenuItem>
          )}
          {canManage && (
            <>
              {canProgress && <DropdownMenuSeparator />}
              <DropdownMenuItem onSelect={() => setDialog("edit")}>
                <Pencil />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

      {/* Siblings of the menu, never inside DropdownMenuContent: that subtree
          unmounts the moment the menu closes, taking the dialog with it. */}
      {dialog === "progress" && (
        <UpdateProgress task={task} open onOpenChange={closeDialog} />
      )}
      {dialog === "edit" && (
        <EditTask task={task} open onOpenChange={closeDialog} />
      )}
      {dialog === "delete" && (
        <DeleteTask task={task} open onOpenChange={closeDialog} />
      )}
    </>
  );
}

// ------------------------------------------------------------------------------
// Columns
// ------------------------------------------------------------------------------

const nameColumn = columnHelper.accessor("name", {
  header: "งาน",
  cell: ({ row }) => (
    <div className="max-w-88 min-w-0">
      <p className="truncate font-semibold text-heading">{row.original.name}</p>
      {/* Flat nesting: a sub-task says who its parent is rather than being
          indented under it. */}
      {row.original.parentTask && (
        <p className="truncate text-[13px] text-muted-fg">
          ↳ {row.original.parentTask.name}
        </p>
      )}
      {!row.original.parentTask && row.original._count?.subTasks > 0 && (
        <p className="truncate text-[13px] text-muted-fg">
          {row.original._count.subTasks} งานย่อย
        </p>
      )}
    </div>
  ),
});

const projectColumn = columnHelper.display({
  id: "project",
  header: "โครงการ",
  cell: ({ row }) => (
    <Link
      to={`/projects/${row.original.projectId}`}
      onClick={(event) => event.stopPropagation()}
      className="text-muted-fg hover:text-body hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {row.original.project?.name ?? "—"}
    </Link>
  ),
});

const statusColumn = columnHelper.accessor("status", {
  header: "สถานะ",
  cell: ({ row }) => (
    <StatusChip value={row.original.status} map={TASK_STATUS_META} />
  ),
});

/**
 * A 6px dot plus its label. The dot alone would make colour the only signal,
 * which UI-PROMPT.md forbids — the ratios in PRIORITY_META are for a graphical
 * object at 3:1, not for text.
 */
const priorityColumn = columnHelper.accessor("priority", {
  header: "ความสำคัญ",
  cell: ({ row }) => {
    const meta = PRIORITY_META[row.original.priority];
    if (!meta) return <span className="text-muted-fg">—</span>;
    return (
      <span className="flex items-center gap-2 text-[13px]">
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        {meta.label}
      </span>
    );
  },
});

const assigneeColumn = columnHelper.display({
  id: "assignee",
  header: "ผู้รับผิดชอบ",
  cell: ({ row }) => (
    <span
      className={cn(
        "text-[13px]",
        row.original.assignedTo ? "text-body" : "text-muted-fg italic",
      )}
    >
      {fullName(row.original.assignedTo)}
    </span>
  ),
});

const progressColumn = columnHelper.accessor("progressPercent", {
  header: "ความคืบหน้า",
  cell: ({ row }) => {
    const percent = row.original.progressPercent ?? 0;
    return (
      <div className="flex w-36 items-center gap-3">
        <Progress
          value={percent}
          className={cn("flex-1", PROGRESS_TRACK)}
          indicatorClassName={PROGRESS_FILL}
        />
        <span className="tabular w-9 shrink-0 text-right font-mono text-[13px]">
          {formatPercent(percent)}
        </span>
      </div>
    );
  },
});

/** Overdue and unfinished turns #B3261E — the one thing a PM scans this for. */
const dueDateColumn = columnHelper.accessor("dueDate", {
  header: "กำหนดเสร็จ",
  cell: ({ row }) => {
    const { dueDate, status } = row.original;
    if (!dueDate) return <span className="text-muted-fg">—</span>;

    const isOverdue =
      status !== "COMPLETED" &&
      status !== "APPROVED" &&
      new Date(dueDate) < new Date();

    return (
      <span
        className={cn(
          "tabular font-mono text-[13px]",
          isOverdue && "font-medium text-destructive",
        )}
      >
        {formatDate(dueDate)}
      </span>
    );
  },
});

// id "actions" is load-bearing: DataTable stops the row click on that column.
const actionsColumn = columnHelper.display({
  id: "actions",
  header: () => <span className="sr-only">Action</span>,
  cell: ({ row }) => <RowActions task={row.original} />,
});

/**
 * Two static arrays rather than one filtered per render, because the columns
 * array has to keep a stable identity.
 */
const PROJECT_COLUMNS = columnHelper.columns([
  nameColumn,
  statusColumn,
  priorityColumn,
  assigneeColumn,
  progressColumn,
  dueDateColumn,
  actionsColumn,
]);

const MY_TASK_COLUMNS = columnHelper.columns([
  nameColumn,
  projectColumn,
  statusColumn,
  priorityColumn,
  progressColumn,
  dueDateColumn,
  actionsColumn,
]);

/** The narrow-screen form of a row (PLAN.md §6.1). */
function TaskCard({ task, showProject }) {
  const percent = task.progressPercent ?? 0;
  const meta = PRIORITY_META[task.priority];

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-heading">
            {task.name}
          </p>
          {showProject && task.project && (
            <p className="truncate text-[13px] text-muted-fg">
              {task.project.name}
            </p>
          )}
          {task.parentTask && (
            <p className="truncate text-[13px] text-muted-fg">
              ↳ {task.parentTask.name}
            </p>
          )}
        </div>
        <RowActions task={task} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChip value={task.status} map={TASK_STATUS_META} />
        {meta && (
          <span className="flex items-center gap-1.5 text-[13px] text-muted-fg">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            {meta.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Progress
          value={percent}
          className={cn("flex-1", PROGRESS_TRACK)}
          indicatorClassName={PROGRESS_FILL}
        />
        <span className="tabular w-9 shrink-0 text-right font-mono text-[13px]">
          {formatPercent(percent)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted-fg">
        <span>{fullName(task.assignedTo)}</span>
        <span className="tabular font-mono">{formatDate(task.dueDate)}</span>
      </div>
    </div>
  );
}

/**
 * @param projectId  omit for the "assigned to me, across every project" mode
 */
export function TaskList({ projectId }) {
  const { can } = usePermission();
  const { user } = useAuth();

  const isProjectScoped = Boolean(projectId);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  // Any change to what is being asked for invalidates the page number — page 4
  // of the old result set is meaningless against the new one.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority, sort]);

  const query = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      sort,
      ...(isProjectScoped
        ? { projectId }
        : { assignedToId: user?.id }),
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      ...(status !== ALL ? { status } : {}),
      ...(priority !== ALL ? { priority } : {}),
    }),
    [page, sort, debouncedSearch, status, priority, projectId, isProjectScoped, user?.id],
  );

  const { data, isLoading, isError } = useTasks(query, {
    // งานของฉัน is meaningless before the session resolves.
    enabled: isProjectScoped || Boolean(user?.id),
  });

  const isFiltered =
    Boolean(debouncedSearch) || status !== ALL || priority !== ALL;

  const createButton =
    isProjectScoped && can("task:manage") ? (
      <AddTask projectId={projectId} />
    ) : null;

  const emptyState = (
    <EmptyState
      icon={ListChecks}
      description={
        isFiltered
          ? "ไม่พบงานที่ตรงกับการค้นหา"
          : isProjectScoped
            ? "ยังไม่มีงานในโครงการนี้"
            : "ยังไม่มีงานที่มอบหมายให้คุณ"
      }
      action={
        isFiltered ? (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatus(ALL);
              setPriority(ALL);
            }}
          >
            ล้างตัวกรอง
          </Button>
        ) : (
          createButton
        )
      }
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
          <label htmlFor="task-search" className="sr-only">
            ค้นหางาน
          </label>
          <Input
            id="task-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหางาน"
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44" aria-label="กรองตามสถานะ">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>ทุกสถานะ</SelectItem>
            {Object.entries(TASK_STATUS_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-40" aria-label="กรองตามความสำคัญ">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>ทุกความสำคัญ</SelectItem>
            {Object.entries(PRIORITY_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {createButton && <div className="ml-auto">{createButton}</div>}
      </div>

      <DataTable
        columns={isProjectScoped ? PROJECT_COLUMNS : MY_TASK_COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        isError={isError}
        errorMessage="โหลดรายการงานไม่สำเร็จ"
        sort={sort}
        onSortChange={setSort}
        sortableColumns={SORTABLE_COLUMNS}
        pagination={data?.pagination}
        onPageChange={setPage}
        renderCard={(task) => (
          <TaskCard task={task} showProject={!isProjectScoped} />
        )}
        cardGridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2"
        empty={emptyState}
      />
    </div>
  );
}
