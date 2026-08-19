/**
 * The one chip component for every enum in the app: task status, project
 * status, issue status, priority, role, doc type, expense category.
 *
 * Reads its colors from the *_META maps in @/lib/constants — never hardcode a
 * hex here. 6px radius, 11px uppercase label, 2px 8px padding, no border.
 * Always renders a text label: color is never the only signal.
 *
 * Built on Badge so the radius and padding stay wherever PROMPT 0 puts them
 * rather than being re-specified per chip. `variant="ghost"` because the fg/bg
 * pair is the meta's job — every other variant would paint over it.
 */

import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * @param value the enum value, e.g. "IN_PROGRESS"
 * @param map   one of the *_META maps; defaults to project status
 */
export function StatusChip({
  value,
  map = PROJECT_STATUS_META,
  className,
  ...props
}) {
  if (!value) return null;

  // An enum the map has not caught up with still renders — as the raw value in
  // the neutral tone, which is visibly wrong in review but not a blank cell.
  const meta = map[value] ?? { label: value, fg: "#58666A", bg: "#F3F6F6" };

  return (
    <Badge
      variant="ghost"
      // Thai has no letter case, so `uppercase` is a no-op on the labels that
      // matter and is left off; the 11px size is what makes it read as a chip.
      className={cn("text-[11px] leading-5 font-medium", className)}
      style={{ color: meta.fg, backgroundColor: meta.bg }}
      {...props}
    >
      {meta.label}
    </Badge>
  );
}
