/**
 * บริษัท (ADMIN only): table with project and user counts. A blocked delete lists what is blocking it.
 * Sprint 8.
 */

import CompanyCard from "@/components/company/CompanyCard";
import { useCompanies } from "@/hooks/useCompany";
import { cn } from "@/lib/utils";

export function CompaniesPage() {
  const emptyState = (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      {/* <p className="text-muted-fg">
        {isFiltered
          ? "No companies matching the filter were found."
          : "There are no companies yet."}
      </p>
      {isFiltered ? (
        <Button
          variant="outline"
          onClick={() => {
            // setSearch("");
            // setStatus(ALL);
            // setCompanyId(ALL);
          }}
        >
          Clear the filter
        </Button>
      ) : (
        createButton
      )} */}
    </div>
  );

  const { data, isLoading, isError } = useCompanies();

  const companies = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* TITLE */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-heading">
          Companies
        </h1>
        {/* {createButton} */}
      </div>
      {/* Filter Component */}
      <div></div>

      <div className={cn("flex flex-col gap-4")}>
        {companies.length === 0 ? (
          <div className="rounded-lg border bg-card">{emptyState}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
