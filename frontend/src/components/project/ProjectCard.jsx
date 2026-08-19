/**
 * The card form of a project row — what the list renders below `md:`, and what
 * the การ์ด toggle switches to at any width.
 * Name, location, status chip, progress bar, budget, due date.
 */

import { StatusChip } from "@/components/common/StatusChip";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  if (!project) return null;

  // STAFF responses omit `budget` entirely — the backend strips the key rather
  // than zeroing it — so the test is on the key, not on falsiness. A 0 budget
  // is a real value and must still render.
  const showBudget = project.budget !== undefined;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex flex-col gap-4 rounded-lg border bg-card p-5 transition-colors hover:bg-app focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-heading">
            {project.name}
          </p>
          {project.location && (
            <p className="mt-0.5 truncate text-[13px] text-muted-fg">
              {project.location}
            </p>
          )}
        </div>
        <StatusChip value={project.status} />
      </div>

      <div className="flex items-center gap-3">
        <Progress
          value={project.progressPercent ?? 0}
          className="h-1.5 flex-1 bg-[#E8ECED]"
          indicatorClassName="bg-primary-900"
        />
        <span className="tabular w-10 shrink-0 text-right font-mono text-[13px] text-body">
          {formatPercent(project.progressPercent ?? 0)}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 border-t pt-3">
        {showBudget ? (
          <div>
            <p className="text-[11px] tracking-[0.08em] text-muted-fg uppercase">
              งบประมาณ
            </p>
            <p className="tabular font-mono text-sm text-body">
              {formatMoney(project.budget)}
            </p>
          </div>
        ) : (
          <span />
        )}
        <div className="text-right">
          <p className="text-[11px] tracking-[0.08em] text-muted-fg uppercase">
            กำหนดเสร็จ
          </p>
          <p className="tabular font-mono text-sm text-body">
            {formatDate(project.endDate)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;
