# 🏗️ BuildTrack Web

React 19 + Vite + Tailwind v4 + shadcn/ui. The frontend for [`../APIs.md`](../APIs.md),
built to the plan in [`../PLAN.md`](../PLAN.md) and the design system in
[`../UI-PROMPT.md`](../UI-PROMPT.md).

**Status: Sprint 0 — scaffold only.** The folder structure, build config, design tokens
and shadcn primitives exist. No screens, no API calls, no state. Every file under `src/`
is a stub carrying a comment about what it owns and which sprint fills it in.

---

## Setup

```bash
cp .env.example .env
```

```bash
npm install
```

```bash
npm run dev
```

The API must be running too — from `../backend`, `npm run dev`. Check it with:

```bash
curl http://localhost:8000/api/v1/health
```

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Vite dev server on http://localhost:5173 |
| `npm run build` | production build to `dist/` |
| `npm run preview` | serve the production build |
| `npm run lint` | oxlint |

---

## 🔑 Demo accounts

Seeded by `../backend` (`npm run db:seed`). Password is `SEED_PASSWORD`, default `password123`.

| Role | Email |
| ---- | ----- |
| ADMIN | `admin@buildtrack.com` |
| PROJECT_MANAGER | `pm@buildtrack.com` |
| STAFF | `engineer@buildtrack.com` |
| STAFF | `engineer2@buildtrack.com` |
| CLIENT | `client@siamproperty.co.th` |

---

## Structure

```
src/
├── api/          axios instance + one file per resource
├── components/
│   ├── ui/       shadcn CLI output — do not hand-edit
│   ├── common/   PageHeader · DataTable · EmptyState · ConfirmDialog · StatusChip
│   ├── project/  ProjectCard · BudgetBar · MemberList
│   └── task/     KanbanBoard · KanbanCard · TaskDialog · ProgressInput
├── features/     auth · projects · tasks · reports · issues · expenses
├── hooks/        useAuth · useDebounce · usePermission
├── layouts/      AppLayout (sidebar + topbar) · AuthLayout
├── pages/        one file per route
├── routes/       router + <ProtectedRoute roles={[...]}>
├── store/        Zustand: auth, ui
└── lib/          utils (cn) · constants (enums, nav) · format (money, dates)
```

See [`src/features/README.md`](src/features/README.md) for the `pages/` vs `features/` vs
`components/` split.

**State rule:** TanStack Query owns everything that came from the server. Zustand owns only
auth and UI state. Do not duplicate server data into Zustand.

---

## Design system

All tokens live in [`src/index.css`](src/index.css) — Tailwind v4 is CSS-first, so there is
no `tailwind.config.js`. The palette is the one in `../UI-PROMPT.md` PROMPT 0; shadcn's own
variables are mapped onto it in the same file.

**The one rule that breaks the UI if you get it wrong:** `#86B9B0` has 2.19:1 contrast against
white. Never put white text on it. The primary button is sage with a near-black `#16201D`
label (7.61:1) — that is intentional and it is the app's signature. For primary-colored
*text* and links on white, use `#3E6F66`.

The accent is allowed on: primary buttons, the active nav item, focus rings, progress fills,
selected states, the primary chart series, and checked checkboxes. That is the whole list.
**The accent never encodes status** — status uses the semantic colors.

Enum labels and chip colors come from `src/lib/constants.js`. Never hardcode a hex in a
component.

Money arrives from the API as a **string** (`Decimal(14,2)`). Never `parseFloat` it, and
money inputs are `type="text"`, not `type="number"`. See `src/lib/format.js`.

---

## Responsive strategy

Priority follows the **role**, not the viewport (`../PLAN.md` §6.1). PMs and clients work at a
desk; site engineers work on a phone with one hand free.

Tailwind is mobile-first by construction: write base styles for narrow and add `md:` / `lg:`
upward. Never reach for `max-md:` overrides.

| Surface | Priority |
| --- | --- |
| Daily site report (create) | **Mobile-first** |
| Issue report (create) | **Mobile-first** |
| Task detail + progress % | **Mobile-first** |
| Task list, notifications | Responsive, no fuss |
| Project list / detail | Desktop-first, card list below `md:` |
| Kanban board | **Desktop only — `lg:` and up** |
| Dashboard + charts | Desktop-first |
| Client documents / financials | Desktop-first |

Design at **375** (phone), **768** (tablet), **1440** (desktop).

- `AppLayout`'s sidebar is an off-canvas drawer in the base state and permanent from `lg:` up.
  Build the drawer first — retrofitting it is worse.
- Every table's card-list fallback is solved once inside `DataTable`, not per page.
- 44px minimum tap targets on the three mobile-first screens. Hard hats mean gloves.
- **Kanban is deliberately not touch-enabled.** Below `lg:` the task list renders instead and
  the board toggle is hidden. Nobody drags cards between columns on a phone.

---

## Permissions

Hiding a nav item or a button is **cosmetic**. The backend enforces every permission
(`../backend/src/middlewares/auth.middleware.js`) and returns 401/403 regardless of what the
UI renders. `usePermission` and `<ProtectedRoute>` exist so users get a clean message instead
of a broken screen — they are not the boundary.

Two rules worth repeating, because they are easy to half-implement:

- **STAFF must never see money.** Not the expenses route, not a budget column, not a
  dashboard figure. The API already strips `budget` from project responses for STAFF, so
  guard on `budget === undefined` rather than assuming the field is present.
- **CLIENT is read-only** apart from comments and approving work.

---

## Not installed yet

Added in the sprint that needs them, so the dependency list stays honest:
`@tanstack/react-table` (Sprint 3) · `@dnd-kit/core` + `@dnd-kit/sortable` (Sprint 4) ·
`recharts` (Sprint 7).
