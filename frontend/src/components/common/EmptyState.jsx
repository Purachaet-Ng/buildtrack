/**
 * A short Thai sentence in #58666A plus one primary action button.
 * No illustration, no icon larger than 24px, no emoji — see UI-PROMPT.md.
 *
 * Rendered inside whatever container the caller already has (a bordered card
 * on the list pages, a tab panel on the detail page), so it brings padding and
 * centering but no border and no background of its own.
 *
 * @param title       optional heading line, 15px/500 in the body color
 * @param description the sentence; the only required prop
 * @param icon        a lucide component, rendered at 24px. Omit by default.
 * @param action      one element — usually a Button, or null when the user has
 *                    no permission to do the thing the empty state suggests
 */

import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      {/* size-6 is 24px — the cap from UI-PROMPT.md, not a starting point. */}
      {Icon && <Icon className="size-6 text-neutral-400" aria-hidden="true" />}

      {title && <p className="font-medium text-heading">{title}</p>}

      {description && (
        <p className="max-w-prose text-[13px] text-muted-fg">{description}</p>
      )}

      {/* Wrapped rather than rendered bare so the gap above it is consistent
          whether or not a title is present. */}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
