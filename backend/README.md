# 🏗️ BuildTrack API — Database Layer

Prisma 7 + PostgreSQL + JavaScript (Node.js, ESM).
Schema implements [`../APIs.md`](../APIs.md) and the model in [`../PLAN.md`](../PLAN.md).

---

## Setup

### 1. Create a database

Free PostgreSQL on [Neon](https://neon.tech) — no card required. Copy the connection string.

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env` and paste your `DATABASE_URL`.

### 3. Install

```bash
npm install
```

### 4. Create the tables

```bash
npx prisma migrate dev --name init
```

### 5. Load demo data

```bash
npm run db:seed
```

### 6. Look at it

```bash
npm run db:studio
```

---

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run db:generate` | สร้าง Prisma Client ใหม่ (หลังแก้ schema) |
| `npm run db:migrate` | สร้าง migration + apply |
| `npm run db:push` | push schema ตรงๆ ไม่สร้าง migration (ใช้ตอนทดลอง) |
| `npm run db:seed` | ใส่ข้อมูลตัวอย่าง |
| `npm run db:studio` | เปิด GUI ดูข้อมูล |
| `npm run db:reset` | ล้าง DB + migrate + seed ใหม่ทั้งหมด |

---

## 🔑 Demo accounts

Every seeded account uses the password from `SEED_PASSWORD` (default `password123`).

| Role | Email |
| ---- | ----- |
| ADMIN | `admin@buildtrack.com` |
| PROJECT_MANAGER | `pm@buildtrack.com` |
| STAFF | `engineer@buildtrack.com` |
| STAFF | `engineer2@buildtrack.com` |
| CLIENT | `client@siamproperty.co.th` |

---

## What the seed creates

| Data | Count | Notes |
| ---- | ----- | ----- |
| Companies | 3 | OWNER / CONTRACTOR / SUBCONTRACTOR |
| Users | 5 | one per role (+ a second engineer) |
| Projects | 4 | PLANNING / IN_PROGRESS ×2 / COMPLETED |
| Tasks | 24 | WBS with parent + sub-tasks, 3 overdue |
| Expenses | 14 | one project deliberately **over budget** |
| Daily reports | 5 | includes a rain delay |
| Issues | 5 | OPEN / INVESTIGATING / RESOLVED |
| Comments | 5 | on tasks |
| Notifications | 7 | mixed read/unread |

Dates are generated relative to a fixed `TODAY` in `seed.js`, so the data always
looks current — overdue tasks stay overdue, deadlines stay near.

**Deliberate details for the demo:**
- **Rama 9 Shopping Mall** is at ~111% of budget (฿8.9M spent of ฿8.0M) — the budget
  bar goes red. Reviewers notice apps that only ever show the happy path.
- **3 tasks are past their due date** so the "Overdue" KPI is never zero.
- Every `ProjectStatus` and `IssueStatus` value appears at least once, so the
  dashboard charts have real distribution instead of a single bar.

---

## Schema notes

**camelCase in code, snake_case in the database.** Every field carries `@map` and every
model `@@map`, so `cc23-er-digram.drawio` stays an accurate picture of the actual tables
while the JavaScript stays idiomatic.

**Money is `Decimal(14,2)`**, never `Float`. Prisma returns it as a `Decimal` object —
serialize with `.toString()` or `.toFixed(2)` before sending JSON.

**`progressPercent` is stored per task; project progress is derived.** Do not add a
progress column to `project` — compute the average in the service layer.

**Delete behaviour:**

| Relation | onDelete | Why |
| -------- | -------- | --- |
| Company → User / Project | `Restrict` | can't delete a company that's still in use |
| Project → everything | `Cascade` | deleting a project removes its whole tree |
| Task → sub-tasks | `Cascade` | WBS parent takes its children with it |
| Task → assignee | `SetNull` | removing staff shouldn't delete the work |
| User → documents / reports / expenses | `Restrict` | preserves the audit trail |

> Still open from `PLAN.md`: **soft delete vs. cascade for projects.** Current schema
> cascades. If you want soft delete instead, add `deletedAt DateTime?` to `Project` and
> filter on it in every query — decide before the first migration ships.

**`Comment` can attach to a task or a document**, so both FKs are nullable. Prisma cannot
express "exactly one of these" — enforce it in the service layer or add a `CHECK`
constraint in a manual migration. Simpler MVP option: drop `documentId` and only allow
comments on tasks.

---

## Files

```
backend/
├── prisma/
│   ├── schema.prisma      11 models, 10 enums
│   └── seed.js            demo data
├── src/lib/prisma.js      PrismaClient + PrismaPg adapter
├── prisma.config.ts       Prisma 7 config (schema path, migrations, seed)
├── .env.example
└── package.json
```

`generated/` is gitignored — it's rebuilt by `npm run db:generate`.
