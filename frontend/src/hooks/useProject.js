import { getProjects } from "@/api/projects.api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
