// Helpers for the standard list query params (APIs.md → Conventions):
//   ?page=1&limit=20&sort=-createdAt&q=foundation

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** "-createdAt" → { createdAt: "desc" }. Unknown field → default sort. */
export const buildOrderBy = (sort, sortableFields, defaultSort = "-createdAt") => {
  const value = sort || defaultSort;
  const desc = value.startsWith("-");
  const field = desc ? value.slice(1) : value;

  if (!sortableFields.includes(field)) return { createdAt: "desc" };
  return { [field]: desc ? "desc" : "asc" };
};

export const buildPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
