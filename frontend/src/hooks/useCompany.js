import { getCompanies } from "@/api/companies.api";
import { useQuery } from "@tanstack/react-query";

/**
 * GET /companies — the whole list, for the client pickers on the project form
 * and the projects filter.
 *
 * The endpoint is ADMIN + PM only; STAFF and CLIENT get a 403. Callers pass
 * `enabled: can("company:view")` so the query stays idle for them instead of
 * firing a request that is guaranteed to fail.
 *
 * Longer staleTime than the 30s default in lib/queryCllient.js: this is
 * reference data that changes a handful of times a year, and it is read on
 * every visit to the projects screen.
 */
export const useCompanies = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ["companies", "list"],
    queryFn: () => getCompanies(),
    enabled,
    staleTime: 5 * 60_000,
  });
};
