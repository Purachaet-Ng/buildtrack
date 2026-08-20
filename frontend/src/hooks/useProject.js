import {
  createProject,
  editProject,
  getProject,
  getProjects,
  removeProject,
} from "@/api/projects.api";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * GET /projects — the list. Filtering, sorting and paging all happen SERVER
 * side, so `params` ({ page, limit, sort, q, status, clientCompanyId }) is part
 * of the cache key: each filter combination is its own cached page.
 *
 * `keepPreviousData` keeps the previous page on screen while the next one
 * loads. Without it every keystroke and page click unmounts the table back to
 * the skeleton, which reads as a flicker rather than as progress.
 */
export const useProject = (params = {}) => {
  return useQuery({
    queryKey: ["projects", "list", params],
    queryFn: () => getProjects(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * GET /projects/:id — one project. Response envelope is `{ project }`, NOT
 * `{ data }`, so read `data.project`.
 *
 * `enabled` lets callers pass undefined on routes that have no id: the query
 * stays idle instead of firing GET /projects/undefined. That is what the
 * breadcrumb relies on — it calls this hook on every route.
 *
 * ProjectDetailPage should call this same hook rather than fetching its own
 * copy; the shared query key means one request serves both the page and the
 * breadcrumb crumb.
 */
export const useProjectDetail = (id) => {
  return useQuery({
    queryKey: ["projects", "detail", id],
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  });
};

/**
 * POST /projects — ADMIN and PM only; the backend 403s everyone else.
 *
 * Invalidating the bare `["projects"]` prefix rather than a specific list key is
 * deliberate: a new project belongs to some page of some filter combination and
 * there is no way to know which, so every cached list is marked stale and the
 * mounted one refetches. The `detail` keys fall under the same prefix and are
 * cheap to let go.
 *
 * Errors are not caught here — the dialog needs them to map `error.errors` onto
 * its fields, and a mutation that swallowed them would report success.
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => createProject(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
};

/**
 * PATCH /projects/:id — ADMIN and PM, and the controller additionally 403s a PM
 * who is not a member of this project.
 *
 * Takes { id, body } because useMutation passes a single argument. Same bare
 * `["projects"]` invalidation as create: an edit can change `name`, `status` or
 * `clientCompanyId`, any of which moves the row between filtered lists and
 * sort orders, so no narrower key is safe.
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => editProject(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
};

/**
 * DELETE /projects/:id — ADMIN only. A hard, cascading delete (APIs.md); see
 * DeleteProject.jsx for what that takes with it.
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => removeProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
};
