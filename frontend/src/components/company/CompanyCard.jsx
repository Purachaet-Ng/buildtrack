/**
 * One company in the บริษัท grid: identity, how to reach them, and what they
 * carry in the system.
 *
 * The card is NOT a link. There is no company detail route (routes/index.jsx
 * registers `/companies` and nothing below it), so the only navigable things
 * here are the two contact rows — a real mailto: and a real tel:, which is what
 * an admin actually wants off this screen.
 *
 * The two counts come from `_count` on GET /companies. They are also the two
 * relations that block DELETE /companies/:id (both onDelete: Restrict in the
 * Prisma schema), so a non-zero count is the visible reason a delete will fail
 * before anyone tries it.
 */

import { StatusChip } from "@/components/common/StatusChip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { COMPANY_TYPE_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Mail, Phone } from "lucide-react";

/** What every field on this card renders for a missing value — matches lib/format. */
const EM_DASH = "—";

/**
 * "Siam Construction" → "SC", "ACME" → "A".
 *
 * Defensive about the empty string: `name[0]` on "" is undefined and
 * `.toUpperCase()` on that throws, which would take the whole grid down for one
 * bad row. `name` is a required column, but nothing stops it being blank.
 */
function initialsOf(name) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/**
 * A contact row that is a link when there is something to link to, and a muted
 * dash when there is not. `contactEmail` / `contactPhone` are both nullable.
 *
 * `href` is built by the caller, not from raw user text: tel: in particular
 * has to have the spaces and dashes stripped or the dialer mis-parses it.
 */
function ContactRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px]">
      <Icon className="size-4 shrink-0 text-neutral-500" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      {value ? (
        <a
          href={href}
          className="truncate text-body hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {value}
        </a>
      ) : (
        <span className="text-muted-fg">{EM_DASH}</span>
      )}
    </div>
  );
}

/**
 * One cell of the footer: an 11px caption over a tabular figure — the same
 * label/value pair ProjectCard's footer uses, icons included: none. The caption
 * already says what the number is, and at this card width three icons were the
 * 60px that pushed the row onto two lines.
 *
 * `whitespace-nowrap` and no `truncate`, because the footer is a flex row where
 * each cell takes its natural width. An equal-thirds grid was the first cut and
 * it clipped "4 Nov 2025" at 375px — a two-digit count and a date do not want
 * the same column.
 */
function Stat({ label, value, align = "left" }) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <p className="text-[11px] tracking-[0.08em] whitespace-nowrap text-muted-fg uppercase">
        {label}
      </p>
      <p className="tabular mt-0.5 font-mono text-sm whitespace-nowrap text-body">
        {value}
      </p>
    </div>
  );
}

function CompanyCard({ company }) {
  if (!company) return null;

  // `?? EM_DASH`, not `?? 0`: a card rendered from a cached response that
  // predates the `_count` include has no count at all, and a confident "0
  // projects" next to a delete button is a worse lie than a dash.
  const projectCount = company._count?.clientProjects ?? EM_DASH;
  const memberCount = company._count?.users ?? EM_DASH;

  return (
    <article className="flex flex-col rounded-lg border bg-card p-5">
      {/* Identity */}
      <div className="flex items-start gap-3">
        <Avatar className="size-11 rounded-lg">
          <AvatarFallback className="rounded-lg bg-primary-100 text-base font-semibold text-primary-800">
            {initialsOf(company.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold text-heading">
            {company.name}
          </h2>
          <div className="mt-1">
            <StatusChip value={company.type} map={COMPANY_TYPE_META} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-4 flex flex-col gap-2">
        <ContactRow
          icon={Mail}
          label="Email"
          value={company.contactEmail}
          href={`mailto:${company.contactEmail}`}
        />
        <ContactRow
          icon={Phone}
          label="Phone"
          value={company.contactPhone}
          // The dialer wants digits, + and nothing else; the display keeps the
          // spacing the admin typed.
          href={`tel:${(company.contactPhone ?? "").replace(/[^\d+]/g, "")}`}
        />
      </div>

      {/* What they carry. The grid stretches every card in a row to the tallest,
          so mt-auto pins this to the bottom instead of leaving it floating under
          a short card's content. `flex-wrap` is the escape hatch for the
          narrowest phones: the date drops to its own line rather than colliding
          with the counts. */}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t pt-4">
        <div className="flex gap-6">
          <Stat label="Projects" value={projectCount} />
          <Stat label="Staff" value={memberCount} />
        </div>
        <Stat
          label="Added"
          value={formatDate(company.createdAt)}
          align="right"
        />
      </div>
    </article>
  );
}

export default CompanyCard;
