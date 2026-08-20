/**
 * The top-bar breadcrumb, derived from the URL.
 *
 *   /                → แดชบอร์ด
 *   /projects        → โครงการ
 *   /projects/26     → โครงการ › <ชื่อโครงการ>
 *
 * Labels are read from NAV_ITEMS / ADMIN_NAV_ITEMS so a renamed nav item renames
 * its crumb too. A segment with no label is skipped entirely, which is what
 * leaves the breadcrumb empty on the 404 route instead of echoing the bad URL.
 */

import * as React from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectDetail } from "@/hooks/useProject";
import { ADMIN_NAV_ITEMS, NAV_ITEMS } from "@/lib/constants";

/** Full path → label, e.g. "/projects" → "โครงการ". */
const NAV_LABELS = Object.fromEntries(
  [...NAV_ITEMS, ...ADMIN_NAV_ITEMS].map((item) => [item.to, item.label]),
);

/** Routes that exist but are not nav destinations. */
const STATIC_LABELS = {
  "/403": "ไม่มีสิทธิ์เข้าถึง",
};

/** Trailing action segments — /daily-reports/new, /daily-reports/12/edit. */
const ACTION_LABELS = {
  new: "สร้างใหม่",
  edit: "แก้ไข",
};

const isId = (segment) => /^\d+$/.test(segment ?? "");

export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  const projectId =
    segments[0] === "projects" && isId(segments[1]) ? segments[1] : undefined;

  // Called on every route; `enabled` inside the hook keeps it idle unless there
  // is an id, so the rules of hooks are respected without a conditional call.
  const { data, isError } = useProjectDetail(projectId);
  const projectName = data?.project?.name;

  const crumbs = [];

  if (segments.length === 0) {
    crumbs.push({ to: "/", label: NAV_LABELS["/"] });
  }

  let path = "";
  segments.forEach((segment, index) => {
    path += `/${segment}`;

    if (isId(segment)) {
      // Only /projects/:id can be resolved to a name today; any other entity id
      // shows as #26 until its own lookup exists.
      if (index === 1 && segments[0] === "projects") {
        if (projectName) crumbs.push({ to: path, label: projectName });
        else if (isError) crumbs.push({ to: path, label: `#${segment}` });
        else crumbs.push({ to: path, loading: true });
      } else {
        crumbs.push({ to: path, label: `#${segment}` });
      }
      return;
    }

    const label =
      NAV_LABELS[path] ?? STATIC_LABELS[path] ?? ACTION_LABELS[segment];

    if (label) crumbs.push({ to: path, label });
  });

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <React.Fragment key={crumb.to}>
              {/* Ancestors drop away on narrow screens; the current page stays. */}
              <BreadcrumbItem className={isLast ? undefined : "hidden md:block"}>
                {crumb.loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  // asChild + Link, never a bare href: an <a> here would do a
                  // full document load and throw away the SPA state.
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
