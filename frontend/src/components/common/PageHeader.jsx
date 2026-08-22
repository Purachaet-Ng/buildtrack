/**
 * Page title (24px/600), optional subtitle, and a right-aligned action slot.
 * Used at the top of every list and detail page.
 *
 * The breadcrumb is NOT here — AppLayout renders <AppBreadcrumb /> in the top
 * bar for every route, so a second one inside the page would duplicate it.
 *
 * @param title    the heading text, or a node when it needs a chip beside it
 * @param subtitle 13px #58666A line under the title
 * @param actions  right-aligned node; pass null when the user cannot act
 */

import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions, className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-heading">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-muted-fg">{subtitle}</p>}
      </div>

      {/* shrink-0 so a long Thai title wraps instead of squeezing the button. */}
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
