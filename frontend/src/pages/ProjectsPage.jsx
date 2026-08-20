/**
 * โครงการ list. Search, status filter, client filter, sortable columns, and a
 * ตาราง / การ์ด toggle. The card grid is also the automatic fallback below `md:`
 * (PLAN.md §6.1). 'สร้างโครงการ' is hidden for STAFF and CLIENT.
 *
 * Filtering, sorting and paging are all SERVER side — every control writes to
 * the query params of GET /projects and the response is rendered as-is. That is
 * why no row models are registered below: TanStack Table is here for the column
 * definitions and header/cell plumbing, not to compute anything.
 */

import { StatusChip } from "@/components/common/StatusChip";
import { AddProject } from "@/components/project/AddProject";
import { DeleteProject } from "@/components/project/DeleteProject";
import { EditProject } from "@/components/project/EditProject";
import ProjectCard from "@/components/project/ProjectCard";
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
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanies } from "@/hooks/useCompany";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermission } from "@/hooks/usePermission";
import { useProject } from "@/hooks/useProject";
import { DEFAULT_PAGE_SIZE, PROJECT_STATUS_META } from "@/lib/constants";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createColumnHelper,
  FlexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Eye,
  LayoutGrid,
  Pencil,
  Search,
  Table2,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Radix Select refuses an item with value="", so "ทั้งหมด" needs a sentinel.
// It is translated back to "param not sent" when the query is assembled.
const ALL = "ALL";

// The fields backend/src/utils/query.js will actually order by — anything else
// silently falls back to -createdAt, so the header must not offer it.
// progressPercent is absent on purpose: it is averaged from tasks at read time
// and is not a column Prisma can sort on.
const SORTABLE_COLUMNS = new Set(["name", "status", "budget", "endDate"]);

const DEFAULT_SORT = "-createdAt";

// The 6px bar from UI-PROMPT.md: track #E8ECED, fill #042630. NOT the brand
// orange — at 2.26:1 on that track the filled and empty halves stop reading as
// two different things.
const PROGRESS_TRACK = "h-1.5 bg-[#E8ECED]";
const PROGRESS_FILL = "bg-primary-900";

/**
 * Static — v9 warns against recreating features/columns/fallback data on every
 * render, and re-creating the feature set would rebuild the whole table.
 */
const features = tableFeatures({});
const columnHelper = createColumnHelper();
const EMPTY_PROJECTS = [];

//Row Action : 3-point button
function RowActions({ project }) {
  const navigate = useNavigate();
  const { can } = usePermission();

  // One slot, not a boolean per dialog: only ever one of them is open, and this
  // makes that impossible to get wrong.
  const [dialog, setDialog] = useState(null); // "edit" | "delete" | null
  const closeDialog = (next) => {
    if (!next) setDialog(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`การดำเนินการสำหรับ ${project.name}`}
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onSelect={() => navigate(`/projects/${project.id}`)}
          >
            <Eye />
            ดูรายละเอียด
          </DropdownMenuItem>
          {/* Hiding these is cosmetic — the backend returns 403 either way. */}
          {can("project:update") && (
            <DropdownMenuItem onSelect={() => setDialog("edit")}>
              <Pencil />
              แก้ไข
            </DropdownMenuItem>
          )}
          {can("project:delete") && (
            <>
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
          unmounts the moment the menu closes, taking the dialog with it before
          it can ever paint. Mounted only while open so each one re-seeds from
          the current row. */}
      {dialog === "edit" && (
        <EditProject project={project} open onOpenChange={closeDialog} />
      )}
      {dialog === "delete" && (
        <DeleteProject project={project} open onOpenChange={closeDialog} />
      )}
    </>
  );
}
// ------------------------------------------------------------------------------
// Coloumn
// ------------------------------------------------------------------------------
const nameColumn = columnHelper.accessor("name", {
  header: "Project Name",
  cell: ({ row }) => (
    <div className="max-w-88 min-w-0">
      {/* A real link inside the row: the whole <tr> is clickable for the mouse,
          but a <tr> is not focusable, so this is the keyboard's way in. */}
      <Link
        to={`/projects/${row.original.id}`}
        onClick={(event) => event.stopPropagation()}
        className="truncate font-semibold text-heading hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {row.original.name}
      </Link>
      {row.original.location && (
        <p className="truncate text-[13px] text-muted-fg">
          {row.original.location}
        </p>
      )}
    </div>
  ),
});

const clientColumn = columnHelper.display({
  id: "client",
  header: "Client",
  cell: ({ row }) => (
    <span className="text-muted-fg">
      {row.original.clientCompany?.name ?? "—"}
    </span>
  ),
});

const statusColumn = columnHelper.accessor("status", {
  header: "Status",
  cell: ({ row }) => (
    <StatusChip value={row.original.status} map={PROJECT_STATUS_META} />
  ),
});

const progressColumn = columnHelper.accessor("progressPercent", {
  header: "Progress",
  cell: ({ row }) => {
    const percent = row.original.progressPercent ?? 0;
    return (
      <div className="flex w-40 items-center gap-3">
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

const budgetColumn = columnHelper.accessor("budget", {
  header: () => <span className="block w-full text-right">Budget</span>,
  cell: ({ row }) => (
    <div className="tabular text-left font-mono">
      {formatMoney(row.original.budget)}
    </div>
  ),
});

const dueDateColumn = columnHelper.accessor("endDate", {
  header: "Due date",
  cell: ({ row }) => (
    <span className="tabular font-mono text-[13px]">
      {formatDate(row.original.endDate)}
    </span>
  ),
});

const actionsColumn = columnHelper.display({
  id: "actions",
  header: () => <span className="sr-only">Action</span>,
  cell: ({ row }) => <RowActions project={row.original} />,
});
// ------------------------------------------------------------------------------

/**
 * Two static arrays rather than one filtered per render, because the columns
 * array has to keep a stable identity. STAFF responses have no `budget` key at
 * all — the backend strips it — so the column is removed, not blanked.
 */
// split budget for admin,pm only
const COLUMNS = columnHelper.columns([
  nameColumn,
  clientColumn,
  statusColumn,
  progressColumn,
  budgetColumn,
  dueDateColumn,
  actionsColumn,
]);
const COLUMNS_NO_BUDGET = columnHelper.columns([
  nameColumn,
  clientColumn,
  statusColumn,
  progressColumn,
  dueDateColumn,
  actionsColumn,
]);

/** A window of at most five page numbers centred on the current one. */
function pageWindow(current, totalPages) {
  const size = Math.min(5, totalPages);
  const start = Math.min(
    Math.max(1, current - Math.floor(size / 2)),
    totalPages - size + 1,
  );
  return Array.from({ length: size }, (_, index) => start + index);
}

//Position at below table
function PaginationBar({
  firstOnPage,
  lastOnPage,
  total,
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-[13px] text-muted-fg">
        List {firstOnPage}-{lastOnPage} out of {total} total.
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
        </Button>
        {pageWindow(currentPage, totalPages).map((pageNumber) => (
          <Button
            key={pageNumber}
            size="icon-sm"
            variant={pageNumber === currentPage ? "default" : "outline"}
            aria-current={pageNumber === currentPage ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const navigate = useNavigate();
  const { can } = usePermission();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [companyId, setCompanyId] = useState(ALL);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [view, setView] = useState("table");

  const debouncedSearch = useDebounce(search);

  // Any change to what is being asked for invalidates the page number — page 4
  // of the old result set is meaningless against the new one.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, companyId, sort]);

  const query = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      sort,
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      ...(status !== ALL ? { status } : {}),
      ...(companyId !== ALL ? { clientCompanyId: Number(companyId) } : {}),
    }),
    [page, sort, debouncedSearch, status, companyId],
  );

  const { data, isLoading, isError } = useProject(query);

  const projects = data?.data ?? EMPTY_PROJECTS;
  const pagination = data?.pagination;

  /**
   * The client filter's options, with two sources.
   *
   * ADMIN and PM read the real list from GET /companies, so they can filter by a
   * company whose projects are not on the current page. That endpoint is 403 for
   * STAFF and CLIENT, who fall back to the companies seen on the rows loaded so
   * far — a partial list, but they only ever see their own handful of projects
   * anyway. Accumulating rather than recomputing per page is what keeps the
   * current selection from vanishing out from under them when they page.
   */
  const { data: companies } = useCompanies({ enabled: can("company:view") });

  const [seenCompanies, setSeenCompanies] = useState([]);
  useEffect(() => {
    if (projects.length === 0) return;

    setSeenCompanies((previous) => {
      const byId = new Map(previous.map((company) => [company.id, company]));
      let added = false;

      for (const project of projects) {
        const company = project.clientCompany;
        if (company && !byId.has(company.id)) {
          byId.set(company.id, { id: company.id, name: company.name });
          added = true;
        }
      }

      if (!added) return previous;
      return [...byId.values()].sort((a, b) =>
        a.name.localeCompare(b.name, "th"),
      );
    });
  }, [projects]);

  const companyOptions = companies?.data ?? seenCompanies;

  // can("money:view") is ADMIN / PM / CLIENT — the exact complement of STAFF, so
  // "STAFF never sees money" is expressed through the permission matrix rather
  // than a role literal in the page.
  const columns = can("money:view") ? COLUMNS : COLUMNS_NO_BUDGET;
  const table = useTable({ features, columns, data: projects });

  const toggleSort = (columnId) => {
    setSort((previous) => (previous === columnId ? `-${columnId}` : columnId));
  };

  const sortIconFor = (columnId) => {
    if (sort === columnId) return ArrowUp;
    if (sort === `-${columnId}`) return ArrowDown;
    return ArrowUpDown;
  };

  const isFiltered =
    Boolean(debouncedSearch) || status !== ALL || companyId !== ALL;

  const total = pagination?.total ?? projects.length;
  const limit = pagination?.limit ?? DEFAULT_PAGE_SIZE;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const firstOnPage = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const lastOnPage = Math.min(currentPage * limit, total);

  // AddProject carries its own trigger button and its own permission-free
  // rendering, so the gate lives here: ADMIN and PM only.
  const createButton = can("project:create") ? <AddProject /> : null;

  if (isLoading) return <SkeletonTable />;
  if (isError)
    return <div className="text-muted-fg">โหลดข้อมูลโครงการไม่สำเร็จ</div>;

  const emptyState = (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <p className="text-muted-fg">
        {isFiltered
          ? "No projects matching the search were found."
          : "There are no projects yet."}
      </p>
      {isFiltered ? (
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setStatus(ALL);
            setCompanyId(ALL);
          }}
        >
          Clear the filter
        </Button>
      ) : (
        createButton
      )}
    </div>
  );

  const paginationBar = (
    <PaginationBar
      firstOnPage={firstOnPage}
      lastOnPage={lastOnPage}
      total={total}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      {/* TITLE */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-heading">
          Project
        </h1>
        {createButton}
      </div>
      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
          <label htmlFor="project-search" className="sr-only">
            Search Projects
          </label>
          <Input
            id="project-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Projects"
            className="pl-9"
          />
        </div>
        {/* Status Filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Status</SelectItem>
            {Object.entries(PROJECT_STATUS_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Client Filter */}
        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="w-56" aria-label="Filter by client company">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Client Companies</SelectItem>
            {companyOptions.map((company) => (
              <SelectItem key={company.id} value={String(company.id)}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Content Display Toggle */}
        <div
          role="group"
          aria-label="Display format"
          className="ml-auto hidden items-center gap-1 rounded-md border p-1 md:flex"
        >
          {[
            { value: "table", label: "Table", Icon: Table2 },
            { value: "card", label: "Card", Icon: LayoutGrid },
          ].map(({ value, label, Icon }) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="ghost"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={cn(
                view === value && "bg-accent text-accent-foreground",
              )}
            >
              <Icon />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-card",
          view === "table" ? "hidden md:block" : "hidden",
        )}
      >
        {projects.length === 0 ? (
          emptyState
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => {
                      const columnId = header.column.id;
                      const SortIcon = sortIconFor(columnId);

                      return (
                        <TableHead
                          key={header.id}
                          className="h-11 px-4 text-muted-fg"
                        >
                          {SORTABLE_COLUMNS.has(columnId) ? (
                            // Sorting is a server round-trip, not a row model,
                            // so the control lives here where `sort` is in
                            // scope rather than in the static column def.
                            <button
                              type="button"
                              onClick={() => toggleSort(columnId)}
                              className="inline-flex items-center gap-1 rounded-sm hover:text-body focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                              <FlexRender header={header} />
                              <SortIcon className="size-3.5" />
                            </button>
                          ) : (
                            <FlexRender header={header} />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => navigate(`/projects/${row.original.id}`)}
                    className="h-14 cursor-pointer hover:bg-app"
                  >
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4"
                        // The actions menu sits inside a clickable row; without
                        // this, opening the menu also navigates away from it.
                        onClick={
                          cell.column.id === "actions"
                            ? (event) => event.stopPropagation()
                            : undefined
                        }
                      >
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {paginationBar}
          </>
        )}
      </div>

      {/* Cards*/}
      <div
        className={cn(
          "flex flex-col gap-4",
          view === "card" ? "" : "md:hidden",
        )}
      >
        {projects.length === 0 ? (
          <div className="rounded-lg border bg-card">{emptyState}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            <div className="rounded-lg border bg-card">{paginationBar}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;
