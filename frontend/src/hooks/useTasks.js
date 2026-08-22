/**
 * Tasks — the list, one task, and the five writes.
 *
 * Modelled on useProject.js, with one addition that matters: every mutation
 * invalidates `["projects"]` as well as `["tasks"]`.
 *
 * `project.progressPercent` is DERIVED, not stored — projects.service.js
 * averages `task.progressPercent` at read time for both the projects list and
 * GET /projects/:id/summary. So changing a task's progress silently changes
 * data cached under a completely different key, and without the second
 * invalidation the summary strip would keep showing the old number until
 * something else happened to refetch it. That is exactly the stale-UI class of
 * bug PLAN.md §6 warns about.
 */

import {
  changeTaskProgress,
  changeTaskStatus,
  createTask,
  editTask,
  getTask,
  getTasks,
  removeTask,
} from "@/api/tasks.api";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Everything a task write can move. Tasks obviously; projects because progress
 * is averaged from them at read time.
 */
const useTaskInvalidator = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };
};

/**
 * GET /tasks — filtering, sorting and paging all happen SERVER side, so
 * `params` is part of the cache key: each filter combination is its own cached
 * page.
 *
 * `keepPreviousData` keeps the current rows on screen while the next page
 * loads, so a keystroke or a filter change reads as progress rather than a
 * flicker back to the skeleton.
 */
export const useTasks = (params = {}, { enabled = true } = {}) => {
  return useQuery({
    queryKey: ["tasks", "list", params],
    queryFn: () => getTasks(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};

/**
 * GET /tasks/:id — response envelope is `{ task }`, NOT `{ data }`.
 * `enabled` keeps the query idle on routes with no id.
 */
export const useTaskDetail = (id) => {
  return useQuery({
    queryKey: ["tasks", "detail", id],
    queryFn: () => getTask(id),
    enabled: Boolean(id),
  });
};

/**
 * POST /tasks — ADMIN and PM; the backend 403s everyone else.
 *
 * Errors are not caught: the dialog needs them to map `error.errors` onto its
 * fields, and "assignee must be a member of this project" is a 400 only the
 * server can produce.
 */
export const useCreateTask = () => {
  const invalidate = useTaskInvalidator();

  return useMutation({
    mutationFn: (body) => createTask(body),
    onSuccess: invalidate,
  });
};

/** PATCH /tasks/:id — ADMIN and PM. Takes { id, body }. */
export const useUpdateTask = () => {
  const invalidate = useTaskInvalidator();

  return useMutation({
    mutationFn: ({ id, body }) => editTask(id, body),
    onSuccess: invalidate,
  });
};

/**
 * DELETE /tasks/:id — ADMIN and PM. Cascades to sub-tasks, which is why the
 * confirm dialog counts them before asking.
 */
export const useDeleteTask = () => {
  const invalidate = useTaskInvalidator();

  return useMutation({
    mutationFn: (id) => removeTask(id),
    onSuccess: invalidate,
  });
};

/**
 * PATCH /tasks/:id/status.
 *
 * A 403 from here is a normal outcome, not a bug: a STAFF user may move their
 * own task but not approve it, and a CLIENT may ONLY approve. Callers should
 * show `error.message` rather than a generic failure toast — the API explains
 * which rule was hit.
 *
 * No optimistic update yet. It belongs with the Kanban drag, where the card
 * moving under the cursor is the whole interaction; from a list row the
 * refetch is fast enough that an optimistic write would only add a rollback
 * path to get wrong.
 */
export const useChangeTaskStatus = () => {
  const invalidate = useTaskInvalidator();

  return useMutation({
    mutationFn: ({ id, status }) => changeTaskStatus(id, status),
    onSuccess: invalidate,
  });
};

/** PATCH /tasks/:id/progress — ADMIN, PM, or the assignee. Takes { id, progressPercent }. */
export const useChangeTaskProgress = () => {
  const invalidate = useTaskInvalidator();

  return useMutation({
    mutationFn: ({ id, progressPercent }) =>
      changeTaskProgress(id, progressPercent),
    onSuccess: invalidate,
  });
};
