/**
 * The shared TanStack Table wrapper: server-side sorting, pagination, the empty
 * state and the loading skeleton.
 *
 * IMPORTANT (PLAN.md §6.1): the card-list fallback below `md:` is solved HERE,
 * once, so every list page inherits it. Do not write a per-page mobile table.
 * Pass `renderCard(row)` for what each row becomes on a narrow screen.
 *
 * Filtering, sorting and paging are all SERVER side — every control writes to
 * the query params of the list endpoint and the response is rendered as-is.
 * That is why no row models are registered below: TanStack Table is here for
 * the column definitions and the header/cell plumbing, not to compute anything.
 *
 * What stays in the PAGE, not here:
 *   - the column definitions, built with a module-level `createColumnHelper()`
 *   - the columns ARRAY, whose identity must stay stable across renders (see
 *     the COLUMNS / COLUMNS_NO_BUDGET split in ProjectsPage)
 *   - the filter bar, the query state, and the useQuery call
 */

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FlexRender, tableFeatures, useTable } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table2,
} from "lucide-react";
import { Fragment } from "react";

/**
 * Static — v9 warns against recreating features/columns/fallback data on every
 * render, and re-creating the feature set would rebuild the whole table.
 */
const features = tableFeatures({});
const EMPTY_DATA = [];

/**
 * Cells in this column swallow the row click, so opening a row menu does not
 * also navigate away from the row. Convention, not configuration: name the
 * actions column "actions" in every page's column defs.
 */
const ACTIONS_COLUMN_ID = "actions";

// ─────────────────────────────────────────────────────────────
// View toggle
// ─────────────────────────────────────────────────────────────

/**
 * ตาราง / การ์ด switch. Exported separately because it belongs in the page's
 * filter bar, not above the table — pass the same `view` to both.
 *
 * Hidden below `md:` on purpose: down there the card list is not a choice, it
 * is the only layout.
 */
export function ViewToggle({ view, onViewChange, className }) {
  return (
    <div
      role="group"
      aria-label="Display format"
      className={cn(
        "hidden items-center gap-1 rounded-md border p-1 md:flex",
        className,
      )}
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
          onClick={() => onViewChange(value)}
          className={cn(view === value && "bg-accent text-accent-foreground")}
        >
          <Icon />
          {label}
        </Button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────

/** A window of at most five page numbers centred on the current one. */
function pageWindow(current, totalPages) {
  const size = Math.min(5, totalPages);
  const start = Math.min(
    Math.max(1, current - Math.floor(size / 2)),
    totalPages - size + 1,
  );
  return Array.from({ length: size }, (_, index) => start + index);
}

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

// ─────────────────────────────────────────────────────────────
// DataTable
// ─────────────────────────────────────────────────────────────

/**
 * @param columns          stable array from the page's columnHelper
 * @param data             the rows for THIS page of results
 * @param isLoading        first load only — `keepPreviousData` covers the rest
 * @param isError          renders `errorMessage` in place of the table
 * @param sort             the API sort string, e.g. "name" / "-budget"
 * @param onSortChange     (next) => void. The asc/desc toggle is computed here.
 * @param sortableColumns  Set of column ids the API can actually order by —
 *                         anything else must not offer a sort control, because
 *                         the backend silently falls back to -createdAt
 * @param pagination       { page, limit, total, totalPages } from the envelope
 * @param onPageChange     (page) => void
 * @param renderCard       (row) => node. Omit only for a table with no narrow
 *                         layout, which then scrolls horizontally instead.
 * @param view             "table" | "card" — pair with <ViewToggle />
 * @param onRowClick       (row) => void. Cells in the "actions" column are
 *                         excluded automatically.
 * @param empty            node shown when there are no rows; defaults to a
 *                         bare EmptyState
 */
export function DataTable({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage = "โหลดข้อมูลไม่สำเร็จ",
  sort,
  onSortChange,
  sortableColumns,
  pagination,
  onPageChange,
  renderCard,
  view = "table",
  onRowClick,
  empty,
  cardGridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
}) {
  const rows = data ?? EMPTY_DATA;
  const table = useTable({ features, columns, data: rows });

  const isSortable = (columnId) => Boolean(sortableColumns?.has(columnId));

  // First click sorts ascending, a second on the same column flips it. The
  // page only ever holds the string the API wants.
  const toggleSort = (columnId) =>
    onSortChange(sort === columnId ? `-${columnId}` : columnId);

  const sortIconFor = (columnId) => {
    if (sort === columnId) return ArrowUp;
    if (sort === `-${columnId}`) return ArrowDown;
    return ArrowUpDown;
  };

  const limit = pagination?.limit ?? rows.length;
  const total = pagination?.total ?? rows.length;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const firstOnPage = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const lastOnPage = Math.min(currentPage * limit, total);

  if (isLoading) return <SkeletonTable />;
  if (isError) return <div className="text-muted-fg">{errorMessage}</div>;

  const emptyState = empty ?? <EmptyState description="ยังไม่มีข้อมูล" />;

  const paginationBar = pagination ? (
    <PaginationBar
      firstOnPage={firstOnPage}
      lastOnPage={lastOnPage}
      total={total}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  ) : null;

  /**
   * The §6.1 mechanism, and the reason both trees are always mounted rather
   * than switched on a media query in JS: below `md:` the cards show and the
   * table is gone regardless of `view`, so the narrow layout cannot be reached
   * by a state the user forgot they set.
   */
  const hasCards = Boolean(renderCard);
  const tableVisibility = !hasCards
    ? "block overflow-x-auto"
    : view === "table"
      ? "hidden md:block"
      : "hidden";

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-card",
          tableVisibility,
        )}
      >
        {rows.length === 0 ? (
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
                          {isSortable(columnId) ? (
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
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                    className={cn(
                      "h-14 hover:bg-app",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4"
                        // The actions menu sits inside a clickable row; without
                        // this, opening the menu also navigates away from it.
                        onClick={
                          cell.column.id === ACTIONS_COLUMN_ID
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

      {hasCards && (
        <div
          className={cn(
            "flex flex-col gap-4",
            view === "card" ? "" : "md:hidden",
          )}
        >
          {rows.length === 0 ? (
            <div className="rounded-lg border bg-card">{emptyState}</div>
          ) : (
            <>
              {/* Fragment, not a wrapper div: the card is a direct grid child
                  so `stretch` gives every card in a row the same height. A
                  <div> around it would take the stretch and leave the card
                  auto-height inside. */}
              <div className={cardGridClassName}>
                {rows.map((row, index) => (
                  <Fragment key={row.id ?? index}>{renderCard(row)}</Fragment>
                ))}
              </div>
              {paginationBar && (
                <div className="rounded-lg border bg-card">{paginationBar}</div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
