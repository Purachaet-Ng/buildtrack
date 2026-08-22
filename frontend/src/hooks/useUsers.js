/**
 * Users — GET/POST/PATCH/DELETE /users.
 *
 * Reading the list is ADMIN + PM (a PM needs it to staff a project); every
 * write is ADMIN only and the backend 403s regardless of what the UI shows.
 *
 * Modelled on useProject.js, including the bare `["users"]` invalidation on
 * every mutation: a new or edited user belongs to some page of some filter
 * combination and there is no way to know which, so every cached list is marked
 * stale and the mounted one refetches.
 */

import {
  createUser,
  editUser,
  getUsers,
  removeUser,
} from "@/api/users.api";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * GET /users — filtering, sorting and paging all happen SERVER side, so
 * `params` ({ page, limit, sort, q, role, companyId }) is part of the cache
 * key: each filter combination is its own cached page.
 *
 * `keepPreviousData` keeps the previous page on screen while the next one
 * loads, so a keystroke or a page click does not unmount the table back to the
 * skeleton.
 *
 * `enabled` lets a caller that cannot read the list (STAFF, CLIENT) keep the
 * query idle instead of firing a request guaranteed to 403 — same pattern as
 * useCompanies.
 */
export const useUsers = (params = {}, { enabled = true } = {}) => {
  return useQuery({
    queryKey: ["users", "list", params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};

/**
 * POST /users — ADMIN only.
 *
 * Errors are not caught: the dialog needs them to map `error.errors` onto its
 * fields, and a duplicate email comes back as a 409 whose message is the only
 * useful thing to show.
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => createUser(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

/**
 * PATCH /users/:id — ADMIN only.
 *
 * Takes { id, body } because useMutation passes a single argument. Editing
 * yourself through this endpoint is possible for an ADMIN, so `["users", "me"]`
 * falls under the same invalidated prefix and the sidebar name updates too.
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => editUser(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

/**
 * DELETE /users/:id — ADMIN only.
 *
 * Not always possible: `document.uploaded_by`, `daily_report.reported_by`,
 * `expense.recorded_by` and `issue.reported_by` are all onDelete: Restrict, so
 * a user who has actually done work cannot be removed. The controller turns
 * that into a specific message — surface it rather than a generic toast.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => removeUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
