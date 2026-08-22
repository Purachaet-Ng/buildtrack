/**
 * ผู้ใช้งาน (ADMIN only): table, add/edit dialog, and a delete that is disabled
 * on your own row.
 *
 * Second consumer of the shared <DataTable /> — the table chrome, the card
 * fallback below `md:`, the sortable headers and the pagination bar all come
 * from there. What lives here is the columns, the filters and the query.
 *
 * The route itself is gated on `user:manage` (ADMIN). GET /users is ADMIN + PM,
 * which is a deliberate split: a PM needs the list to staff a project team, but
 * has no business on this screen.
 */

import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteUser } from "@/components/user/DeleteUser";
import { EditUser } from "@/components/user/EditUser";
import { AddUser } from "@/components/user/AddUser";
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompany";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermission } from "@/hooks/usePermission";
import { useUsers } from "@/hooks/useUsers";
import { DEFAULT_PAGE_SIZE, ROLE_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { createColumnHelper } from "@tanstack/react-table";
import { EllipsisVertical, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Radix Select refuses an item with value="", so "ทั้งหมด" needs a sentinel.
const ALL = "ALL";

// The fields backend/src/validators/users.validator.js will actually order by —
// anything else silently falls back to -createdAt, so the header must not offer
// it. `company` is absent for that reason: it is a relation, not a column.
const SORTABLE_COLUMNS = new Set([
  "firstname",
  "lastname",
  "email",
  "role",
  "createdAt",
]);

const DEFAULT_SORT = "firstname";

const columnHelper = createColumnHelper();

/**
 * Row menu. It reads the signed-in user itself rather than taking `isSelf` as a
 * prop, because the column definitions are module-level statics and threading
 * page state into them would mean rebuilding the columns array on every render
 * — the one thing the table must not do.
 */
function RowActions({ user }) {
  const { user: currentUser } = useAuth();
  const isSelf = user.id === currentUser?.id;

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
            aria-label={`การดำเนินการสำหรับ ${user.firstname} ${user.lastname}`}
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setDialog("edit")}>
            <Pencil />
            แก้ไข
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Deleting yourself is disabled: the backend would happily do it and
              leave the session holding a JWT for a row that no longer exists.
              Kept visible-but-disabled rather than hidden, so the reason is
              discoverable. */}
          <DropdownMenuItem
            variant="destructive"
            disabled={isSelf}
            onSelect={() => setDialog("delete")}
          >
            <Trash2 />
            {isSelf ? "ลบตัวเองไม่ได้" : "ลบ"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Siblings of the menu, never inside DropdownMenuContent: that subtree
          unmounts the moment the menu closes, taking the dialog with it. */}
      {dialog === "edit" && (
        <EditUser user={user} open onOpenChange={closeDialog} />
      )}
      {dialog === "delete" && (
        <DeleteUser user={user} open onOpenChange={closeDialog} />
      )}
    </>
  );
}

// ------------------------------------------------------------------------------
// Columns
// ------------------------------------------------------------------------------

const nameColumn = columnHelper.accessor("firstname", {
  header: "Name",
  cell: ({ row }) => (
    <div className="max-w-72 min-w-0">
      <p className="truncate font-semibold text-heading">
        {row.original.firstname} {row.original.lastname}
      </p>
      <p className="truncate text-[13px] text-muted-fg">{row.original.email}</p>
    </div>
  ),
});

const roleColumn = columnHelper.accessor("role", {
  header: "Role",
  cell: ({ row }) => <StatusChip value={row.original.role} map={ROLE_META} />,
});

const companyColumn = columnHelper.display({
  id: "company",
  header: "Company",
  cell: ({ row }) => (
    <span className="text-muted-fg">{row.original.company?.name ?? "—"}</span>
  ),
});

const phoneColumn = columnHelper.display({
  id: "phone",
  header: "Phone",
  cell: ({ row }) => (
    <span className="tabular font-mono text-[13px]">
      {row.original.phone ?? "—"}
    </span>
  ),
});

const createdColumn = columnHelper.accessor("createdAt", {
  header: "Joined",
  cell: ({ row }) => (
    <span className="tabular font-mono text-[13px]">
      {formatDate(row.original.createdAt)}
    </span>
  ),
});

// id "actions" is load-bearing: DataTable stops the row click on that column.
const actionsColumn = columnHelper.display({
  id: "actions",
  header: () => <span className="sr-only">Action</span>,
  cell: ({ row }) => <RowActions user={row.original} />,
});

/** Static, so the array identity stays stable across renders. */
const COLUMNS = columnHelper.columns([
  nameColumn,
  roleColumn,
  companyColumn,
  phoneColumn,
  createdColumn,
  actionsColumn,
]);

/** The narrow-screen form of a row (PLAN.md §6.1). */
function UserCard({ user }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-card p-5">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-heading">
          {user.firstname} {user.lastname}
        </p>
        <p className="truncate text-[13px] text-muted-fg">{user.email}</p>
        <p className="mt-2 truncate text-[13px] text-muted-fg">
          {user.company?.name ?? "ไม่มีบริษัท"}
          {user.phone ? ` · ${user.phone}` : ""}
        </p>
        <StatusChip value={user.role} map={ROLE_META} className="mt-3" />
      </div>
      <RowActions user={user} />
    </div>
  );
}

export function UsersPage() {
  const { can } = usePermission();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState(ALL);
  const [companyId, setCompanyId] = useState(ALL);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  // Any change to what is being asked for invalidates the page number — page 4
  // of the old result set is meaningless against the new one.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, companyId, sort]);

  const query = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      sort,
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      ...(role !== ALL ? { role } : {}),
      ...(companyId !== ALL ? { companyId: Number(companyId) } : {}),
    }),
    [page, sort, debouncedSearch, role, companyId],
  );

  const { data, isLoading, isError } = useUsers(query);

  // Only ADMIN reaches this route, and GET /companies is ADMIN + PM, so the
  // guard is belt-and-braces — but it keeps the hook honest if the route gate
  // ever widens.
  const { data: companies } = useCompanies({ enabled: can("company:view") });
  const companyOptions = companies?.data ?? [];

  const isFiltered =
    Boolean(debouncedSearch) || role !== ALL || companyId !== ALL;

  const createButton = can("user:manage") ? <AddUser /> : null;

  const emptyState = (
    <EmptyState
      description={
        isFiltered
          ? "ไม่พบผู้ใช้ที่ตรงกับการค้นหา"
          : "ยังไม่มีผู้ใช้ในระบบ"
      }
      action={
        isFiltered ? (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setRole(ALL);
              setCompanyId(ALL);
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="ผู้ใช้งาน"
        subtitle="จัดการบัญชีและสิทธิ์การเข้าถึงของทุกคนในระบบ"
        actions={createButton}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
          <label htmlFor="user-search" className="sr-only">
            ค้นหาผู้ใช้
          </label>
          <Input
            id="user-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อหรืออีเมล"
            className="pl-9"
          />
        </div>

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-48" aria-label="กรองตามบทบาท">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>ทุกบทบาท</SelectItem>
            {Object.entries(ROLE_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="w-56" aria-label="กรองตามบริษัท">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>ทุกบริษัท</SelectItem>
            {companyOptions.map((company) => (
              <SelectItem key={company.id} value={String(company.id)}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        isError={isError}
        errorMessage="โหลดรายชื่อผู้ใช้ไม่สำเร็จ"
        sort={sort}
        onSortChange={setSort}
        sortableColumns={SORTABLE_COLUMNS}
        pagination={data?.pagination}
        onPageChange={setPage}
        // No view toggle: a user list has no card view worth choosing at desk
        // width. Cards are the narrow fallback only.
        renderCard={(user) => <UserCard user={user} />}
        cardGridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2"
        empty={emptyState}
      />
    </div>
  );
}
