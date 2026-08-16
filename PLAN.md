# BuildTrack — Construction Project Management System
## Implementation Plan

**Owner:** Purachaet · **Drafted:** 2026-08-13 · **Target:** portfolio project for Junior Full-Stack roles

Sources this plan is built from:
- `utils/SRS-Construction Project Management System.docx` — functional requirements per role
- `cc23-er-digram.drawio` — 8-table ER model
- Existing backend patterns in `3.Demo/github-demo` (Express 5 + Prisma 7 + JWT + Zod)

---

## 1. Decisions to lock before writing code

### 1.1 Reuse your bootcamp backend architecture
`github-demo` already has the exact layering this project needs:

```
src/
├── app.js  server.js
├── routes/        → controllers/  → services/   (thin → thin → logic)
├── middlewares/   auth, errorHandler, pathNotFound
├── validations/   Zod schemas
├── lib/prisma.js
└── utilities/jwt.js
```

Keep it. You already know it, it's clean, and it's defensible in an interview. Do **not** redesign the architecture — spend the effort on the domain.

### 1.2 Database: switch MariaDB → PostgreSQL
The demo uses `@prisma/adapter-mariadb`. For this project use PostgreSQL on **Neon** (free tier, no card, works with Render/Vercel). Prisma makes the change ~2 lines:

```
provider = "postgresql"   // schema.prisma datasource
DATABASE_URL=...          // Neon connection string
```

You also gain `enum` support, which this schema wants heavily (status, priority, role).

### 1.3 Scope: build the MVP, not the whole SRS
The SRS + the ChatGPT brainstorm together describe roughly a 6-month product. Cut to a **defensible MVP** (Section 4) and treat everything else as a documented backlog. A finished small app beats a half-finished large one in every portfolio review.

---

## 2. Gap analysis — SRS vs. your ER diagram

Your ER model is solid but does not yet satisfy the SRS. These are the real gaps:

| # | SRS requirement | ER coverage | Action |
|---|---|---|---|
| A-1 | Create/manage project (name, dates, budget) | ✅ `project` | — |
| A-2 | Plan tasks, sub-tasks, duration, assignee | ✅ `task` (`parent_task`, `assigned_to_user`) | — |
| A-3 | Track progress via progress bar | ⚠️ no progress field anywhere | **Add** `task.progress_percent`; derive project progress |
| A-4 | Manage budget, record expenses, compare vs. plan | ❌ no expense table | **Add** `expense` |
| A-5 | Manage materials/equipment and contractors | ❌ nothing | Contractors → reuse `company.type`; **materials → cut to Phase 2** |
| A-6 | Progress + financial reports | ❌ blocked by A-3, A-4 | Follows once above exist |
| E-1 | Login | ✅ `user` | — |
| E-2 | Update task progress | ⚠️ status only, no % | Covered by A-3 |
| E-3 | Record site issue/delay **and notify** | ⚠️ only `daily_report.issues` text | **Add** `issue` + `notification` |
| E-4 | ~~Timesheet~~ | struck through in SRS | Confirmed out of scope ✅ |
| C-1 | Client views progress real-time | ✅ via project/task | — |
| C-2 | Client comments **or approves** work | ⚠️ `comment` only, no approval | **Add** approval states to `task.status` |
| C-3 | Client views financial reports + documents | ✅ `document`, ❌ financial | Blocked by A-4 |

### 2.1 Naming fixes (do these before the first migration)
Once a migration ships, renaming is annoying. Fix now:

| Current | → | Why |
|---|---|---|
| `dairy_report` | `daily_report` | "dairy" = milk. This one will get noticed in a code review. |
| `project.company_cilent_id` | `client_company_id` | typo |
| `comment.create_at` | `created_at` | consistency |
| `task.parent_task` | `parent_task_id` | all FKs end in `_id` |
| `task.assigned_to_user` | `assigned_to_user_id` | same |

Also: add `created_at` / `updated_at` to every table (`@default(now())` / `@updatedAt`). You will want them for the activity feed and for sorting.

---

## 3. Target schema (Prisma models)

Existing (keep, with fixes above): `company`, `user`, `project`, `project_member`, `task`, `comment`, `document`, `daily_report`

New:

```prisma
enum ProjectStatus  { PLANNING IN_PROGRESS ON_HOLD COMPLETED }
enum TaskStatus     { TODO IN_PROGRESS REVIEW APPROVED COMPLETED }   // REVIEW/APPROVED covers C-2
enum Priority       { LOW MEDIUM HIGH CRITICAL }
enum UserRole       { ADMIN PROJECT_MANAGER STAFF CLIENT }
enum IssueStatus    { OPEN INVESTIGATING RESOLVED }
enum CompanyType    { OWNER CONTRACTOR SUBCONTRACTOR }

model Expense {        // A-4, A-6, C-3
  id          Int      @id @default(autoincrement())
  projectId   Int
  taskId      Int?     // optional: cost attribution per task
  category    String   // MATERIAL | LABOR | EQUIPMENT | OTHER
  description String
  amount      Decimal  @db.Decimal(14, 2)   // never Float for money
  spentAt     DateTime
  recordedById Int
  createdAt   DateTime @default(now())
}

model Issue {          // E-3
  id          Int         @id @default(autoincrement())
  projectId   Int
  taskId      Int?
  reportedById Int
  assignedToId Int?
  title       String
  description String
  priority    Priority
  status      IssueStatus @default(OPEN)
  createdAt   DateTime    @default(now())
  resolvedAt  DateTime?
}

model Notification {   // E-3 "แจ้งเตือนผู้เกี่ยวข้อง"
  id        Int      @id @default(autoincrement())
  userId    Int
  type      String   // TASK_ASSIGNED | ISSUE_REPORTED | DEADLINE_NEAR | COMMENT_ADDED
  message   String
  linkUrl   String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

And on `task`: `progressPercent Int @default(0)` — with a check that it's 0–100 in the Zod schema.

**Derived project progress** (A-3) — compute, never store:
`project.progress = avg(task.progressPercent)` weighted by task count, calculated in the service layer. Explaining *why* it's derived and not a column is a genuinely good interview answer.

---

## 4. Scope split

### MVP — this is what you build and deploy
1. Auth: register, login, logout, `/me`, JWT + bcrypt, role-based middleware
2. Companies + Users CRUD (admin only)
3. Projects CRUD + member assignment
4. Tasks CRUD, sub-tasks, status, priority, assignee, progress %
5. Kanban board with drag-and-drop
6. Dashboard: KPI cards + 2 charts + recent activity
7. Comments on tasks
8. Document upload (Cloudinary)
9. Daily Site Report — create + list + view
10. Issue tracking
11. Expenses + budget-vs-actual view
12. RBAC enforced on **both** frontend routes and backend endpoints

### Phase 2 — build only if MVP ships early
Gantt/timeline view · Socket.IO real-time · PDF/Excel export · email notifications · materials & inventory · dark mode · activity audit log · project map

### Explicitly out of scope (say so in the README)
Timesheets (struck from SRS) · multi-tenant billing · mobile app · offline mode

---

## 5. Build order

Each sprint ends with something **runnable and committed**. Do not move on with a broken sprint.

| Sprint | Deliverable | Done when |
|---|---|---|
| **0 — Foundation** | ✅ **Monorepo** — `backend/` + `frontend/` in one repo (decided at build time; simpler to demo and to deploy from one place). Express 5 skeleton copied from `github-demo`, all routes under `/api/v1` with CORS. Vite + React 19 + Tailwind v4 + shadcn/ui. Neon DB connected. `.env.example` committed on both sides. | `npm run dev` works on both; `/api/v1/health` returns 200 |
| **1 — Schema & seed** | Full `schema.prisma` with all fixes from §2.1 and models from §3. First migration. Seed script: 1 company, 4 users (one per role), 2 projects, ~20 tasks. | `npx prisma studio` shows realistic data |
| **2 — Auth & RBAC** | register/login/logout/me, bcrypt, JWT, `authenticate` + `authorize(...roles)` middleware, Zod validation, error handler. Frontend: login page, protected routes, Zustand auth store. | Log in as each of the 4 roles; a STAFF gets 403 on `POST /projects` |
| **3 — Projects** | Projects CRUD + `project_member` assign/remove. List page (TanStack Table), detail page with tabs shell. | PM creates a project, adds an engineer, engineer sees it in their list |
| **4 — Tasks & Kanban** | Tasks CRUD, sub-tasks, assignee, progress %. Task list view first, then Kanban with dnd-kit; drag → `PATCH /tasks/:id` optimistic update. Board is gated to `lg:` and up (§6.1). | Drag a card between columns, refresh, it stayed. Below 1024px the board toggle is hidden and the list view is shown instead |
| **5 — Site workflow** | Daily Site Report (form + list + detail), Issues (CRUD + status), Comments on tasks, Notifications on assign/issue. **Mobile layout for these screens is built here, not deferred** — report form, issue form and task-progress screen are designed at 375px first (§6.1). | Engineer submits a report and raises an issue *from a phone-width viewport*; PM sees a notification |
| **6 — Money & docs** | Expense CRUD, budget-vs-actual per project, Cloudinary document upload + list/download. | Budget bar shows spent/remaining; PDF uploads and opens |
| **7 — Dashboard & polish** | Dashboard KPIs + Recharts (tasks by status, budget usage, progress over time), global search/filter, empty states, loading skeletons, 404 page. Narrow-viewport fallbacks for the **desktop-first** screens only — engineer screens were already done in Sprint 5. | Dashboard loads in <2s with seeded data; no horizontal scroll on any route at 375px |
| **8 — Ship** | Deploy API (Render) + web (Vercel) + Neon. README with screenshots + architecture diagram + ER diagram. Swagger or a `.http` collection. 2–3 min demo video. Seeded demo login credentials in the README. | A stranger can open the URL, log in as demo, and click through |

**Pace:** ~1 sprint/week if part-time, faster if full-time. Sprint 4 and 5 are the two that always run long — budget extra there.

---

## 6. Frontend structure

Lives in `frontend/`. React 19 + Vite + **Tailwind v4** + shadcn/ui, JavaScript.

Tailwind v4 is CSS-first — there is no `tailwind.config.js`. The whole design system
(the `@theme` palette from `UI-PROMPT.md`, the fonts, and shadcn's `:root` variables
mapped onto it) lives in `src/index.css`. The API base URL is `/api/v1`, set via
`VITE_API_URL`.

```
src/
├── api/            axios instance + one file per resource
├── components/
│   ├── ui/         shadcn/ui generated components
│   ├── common/     PageHeader, DataTable, EmptyState, ConfirmDialog, StatusChip
│   ├── project/    ProjectCard, BudgetBar, MemberList
│   └── task/       KanbanBoard, KanbanCard, TaskDialog, ProgressInput
├── features/       auth, projects, tasks, reports, issues, expenses
├── hooks/          useAuth, useDebounce, usePermission
├── layouts/        AppLayout (sidebar + topbar), AuthLayout
├── pages/
├── routes/         router + <ProtectedRoute roles={[...]}>
├── store/          Zustand: auth, ui (sidebar, theme)
└── lib/            utils, constants, date helpers
```

**State rule:** TanStack Query owns everything from the server. Zustand owns only auth + UI. Do not duplicate server data into Zustand — that mistake is the #1 source of stale-UI bugs.

### 6.1 Responsive strategy — priority follows the role, not the viewport

This app has two populations. PMs, admins and clients work at a desk; site engineers work on a phone with one hand free. "Mobile-first" and "desktop-first" are both wrong answers on their own.

**The decision:** desktop-first in *design priority*, mobile-first in *CSS mechanics*, with three screens designed at 375px before their desktop layout exists.

Tailwind is mobile-first by construction — unprefixed utilities are the base, `md:`/`lg:` scale up. Always write base styles for narrow and add breakpoints upward. Going the other way means living in `max-md:` overrides, fighting both the framework and shadcn/ui. That part is not a preference.

| Surface | Priority | Why |
|---|---|---|
| Daily Site Report (create) | **Mobile-first** | Written in the field, end of day |
| Issue report (create) | **Mobile-first** | E-3 is "saw a problem right now" |
| Task detail + progress % | **Mobile-first** | The engineer's one recurring action |
| Task list, notifications | Responsive, no fuss | Cards stack and it's done |
| Project list / detail | Desktop-first | Table collapses to card list below `md:` |
| Kanban board | **Desktop only** (`lg:` and up) | See below |
| Dashboard + charts | Desktop-first | Recharts at 375px is unreadable |
| Client documents / financials | Desktop-first | Clients review on a laptop |

**Kanban is deliberately not touch-enabled.** dnd-kit on touch needs a `TouchSensor` with an activation delay plus `touch-action: none` on every handle, and making drag coexist with page scroll on iOS Safari is a multi-day fight. §8 already flags Sprint 4 as the stall risk — touch DnD is how that risk cashes in. Below `lg:` (1024px), render the task **list** view and hide the board toggle. Nobody drags cards between columns on a phone; this is a product decision, not a shortcut.

**Rules to apply from Sprint 0:**
- Design at **375** (phone), **768** (tablet — site supervisors really do carry these), **1440** (desktop).
- `AppLayout` sidebar is an off-canvas drawer in the base state, permanent from `lg:` up. Build the drawer first; retrofitting it is worse.
- Every table gets a card-list fallback below `md:`. Solve it once inside the shared `DataTable` component and every list page inherits it.
- 44px minimum tap targets on the three mobile-first screens. Hard hats mean gloves.

**Interview answer this buys you:** "PMs plan at a desk, engineers report from the field, so layout priority follows the role rather than the viewport." That's domain reasoning, and it's rarer than a responsive grid.

---

## 7. Things that will make this stand out

Ranked by (recruiter impact ÷ effort):

1. **Seeded demo accounts in the README** — one click to see the app as each role. Most portfolio projects fail here; a reviewer who has to register gives up.
2. **Budget vs. actual with a real over-budget project in the seed data** — shows the app handles unhappy states, not just green checkmarks.
3. **The Daily Site Report** — no other junior portfolio has this. It's the piece that proves domain knowledge.
4. **RBAC enforced server-side, demonstrably** — include a `.http` request showing a 403. Many candidates only hide buttons in the UI.
5. **Gantt chart** (Phase 2) — highest visual impact, but genuinely hard. Only after everything else ships.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Scope creep — the SRS is huge | §4 is the contract. New ideas go in a `BACKLOG.md`, not into the sprint. |
| Sprint 4 (Kanban DnD) stalls the project | Build the task **list** view first and ship it. Kanban is an enhancement on top of working CRUD, not a prerequisite. |
| File upload burns a week | Cloudinary unsigned preset first, harden later. Don't start with S3. |
| Money stored as Float | `Decimal(14,2)` from day one — decided in §3. |
| Free-tier API cold starts make the demo look broken | Note it in the README, or ping the API on the login page load. |

---

## 9. Immediate next steps

1. Apply the §2.1 renames to `cc23-er-digram.drawio` and add `expense`, `issue`, `notification` to it — the diagram goes in your README, so it must match the code.
2. Update the SRS to mark materials/inventory as Phase 2 and confirm timesheet is removed.
3. ~~Create the two repos and run Sprint 0.~~ ✅ Done — monorepo, `backend/` + `frontend/`.

Sprint 1 cannot start until the diagram and schema agree. Everything downstream inherits from that file.
