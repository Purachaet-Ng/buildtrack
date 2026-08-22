# 🏗️ BuildTrack — API Endpoints Summary

REST API สำหรับระบบบริหารจัดการโครงการก่อสร้าง (Construction Project Management System)

**Base URL:** `http://localhost:8000/api/v1`
**Stack:** Express 5 · Prisma 7 · PostgreSQL · JWT · Zod

---

## 📌 Conventions

ทุก endpoint (ยกเว้น `/auth/register` และ `/auth/login`) ต้องแนบ header:

```
Authorization: Bearer <token>
```

**Roles:** `ADMIN` · `PROJECT_MANAGER` (PM) · `STAFF` (ENG) · `CLIENT`

**Query params มาตรฐาน** (สำหรับ endpoint ที่เป็น list):

| Param | Example | Description |
| ----- | ------- | ----------- |
| `page` | `?page=1` | หน้าที่ต้องการ (default 1) |
| `limit` | `?limit=20` | จำนวนต่อหน้า (default 20, max 100) |
| `sort` | `?sort=-createdAt` | เรียงข้อมูล (`-` = จากมากไปน้อย) |
| `q` | `?q=foundation` | ค้นหาข้อความ |

**Error format** (ตรงกับ `errorHandler` middleware เดิม):

```json
{
  "status": "error",
  "message": "Forbidden: PROJECT_MANAGER only"
}
```

**Validation error (400)** — Zod จะคืน `errors` มาด้วยทุกฟิลด์ที่ผิด (`message` = ตัวแรกในลิสต์):

```json
{
  "status": "Error",
  "message": "name is required",
  "errors": [
    { "field": "name", "message": "name is required" },
    { "field": "budget", "message": "budget must be a number with at most 2 decimal places" }
  ]
}
```

**Status codes:** `200` OK · `201` Created · `400` Validation · `401` ไม่ได้ login · `403` ไม่มีสิทธิ์ · `404` ไม่พบข้อมูล · `409` ข้อมูลซ้ำ

---

## 🔐 Authentication

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| POST | `/auth/register` | สมัครสมาชิก | Public |
| POST | `/auth/login` | เข้าสู่ระบบ | Public |

> **หมายเหตุ**
> - ไม่มี `/auth/logout` — token เป็น stateless JWT (อายุ 1 วัน) ฝั่ง frontend ลบ token ทิ้งเองได้เลย
> - ดูข้อมูลผู้ใช้ที่ login อยู่ ใช้ `GET /users/me` (ไม่มี `/auth/me` ซ้ำ)

---

## 👤 Users

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/users` | ดูรายชื่อผู้ใช้ทั้งหมด | ADMIN, PM |
| POST | `/users` | เพิ่มผู้ใช้ใหม่ (สร้างให้พนักงาน) | ADMIN |
| GET | `/users/:id` | ดูข้อมูลผู้ใช้รายคน | ADMIN, PM |
| PATCH | `/users/:id` | แก้ไขข้อมูล / เปลี่ยน role | ADMIN |
| DELETE | `/users/:id` | ลบผู้ใช้ | ADMIN |
| GET | `/users/me` | ดูโปรไฟล์ตัวเอง | All |
| PATCH | `/users/me` | แก้ไขโปรไฟล์ตัวเอง | All |

> **หมายเหตุ**
> - `GET /users` เปิดให้ PM ด้วย เพราะ PM มีสิทธิ์เพิ่มทีมงานเข้าโครงการ (`POST /projects/:id/members`) แต่ไม่มีทางอื่นที่จะรู้ว่ามีใครให้เลือกบ้าง
> - ทุก endpoint ที่ **เขียน** ข้อมูล user (POST / PATCH / DELETE) ยังคงเป็น ADMIN อย่างเดียว

---

## 🏢 Companies

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/companies` | ดูรายชื่อบริษัท (เจ้าของ / ผู้รับเหมา) | ADMIN, PM |
| POST | `/companies` | เพิ่มบริษัท | ADMIN |
| GET | `/companies/:id` | ดูข้อมูลบริษัท | ADMIN, PM |
| PATCH | `/companies/:id` | แก้ไขข้อมูลบริษัท | ADMIN |
| DELETE | `/companies/:id` | ลบบริษัท | ADMIN |

> `type` = `OWNER` \| `CONTRACTOR` \| `SUBCONTRACTOR`
>
> `GET /companies` returns the whole list, unpaginated and sorted by `name`, as
> `{ data: [...] }`. Each row carries
> `_count: { clientProjects, users }` — the two relations that also block
> `DELETE /companies/:id`.

---

## 📁 Projects

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/projects` | ดูโครงการทั้งหมด (กรองตามสิทธิ์อัตโนมัติ) | All |
| POST | `/projects` | สร้างโครงการใหม่ | ADMIN, PM |
| GET | `/projects/:id` | ดูรายละเอียดโครงการ | Member |
| PATCH | `/projects/:id` | แก้ไขข้อมูลโครงการ | ADMIN, PM |
| DELETE | `/projects/:id` | ลบโครงการ | ADMIN |
| GET | `/projects/:id/summary` | KPI ของโครงการ (progress, budget, งานค้าง) | Member |

> **สำคัญ:** `GET /projects` ต้องกรองตาม role ในฝั่ง service — ADMIN เห็นทุกโครงการ, PM/ENG เห็นเฉพาะโครงการที่เป็นสมาชิก, CLIENT เห็นเฉพาะโครงการของบริษัทตัวเอง

**Filters เพิ่มเติม:** `?status=IN_PROGRESS&clientCompanyId=2` (นอกเหนือจาก `page` / `limit` / `sort` / `q` มาตรฐาน)
`q` ค้นจาก `name` และ `location` · `sort` ใช้ได้กับ `createdAt` `name` `startDate` `endDate` `status` `budget`

**Response ของ list:**

```json
{
  "data": [ /* projects */ ],
  "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

> - `progressPercent` คำนวณจากค่าเฉลี่ยของ `task.progressPercent` ทุก endpoint ที่คืนโครงการ (ไม่เก็บใน DB)
> - **STAFF ไม่เห็นฟิลด์ `budget`** — ถูกตัดออกจาก response ทั้ง list / detail / summary
> - `POST /projects` ถ้าผู้สร้างไม่ใช่ ADMIN จะถูกเพิ่มเป็น `project_member` อัตโนมัติ (ไม่งั้น PM จะมองไม่เห็นโครงการที่ตัวเองเพิ่งสร้าง)
> - `PATCH /projects/:id` PM แก้ได้เฉพาะโครงการที่ตัวเองเป็นสมาชิก · ADMIN แก้ได้ทุกโครงการ
> - `DELETE /projects/:id` เป็น **hard delete** (cascade ตาม schema) — ยังไม่ทำ soft delete

---

## 👷 Project Members

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/projects/:id/members` | ดูรายชื่อทีมงานในโครงการ | Member |
| POST | `/projects/:id/members` | เพิ่มทีมงานเข้าโครงการ | ADMIN, PM |
| PATCH | `/projects/:id/members/:userId` | แก้ไขตำแหน่งในโครงการ | ADMIN, PM |
| DELETE | `/projects/:id/members/:userId` | นำทีมงานออกจากโครงการ | ADMIN, PM |

> **สังเกต:** sub-resource ใช้ `:userId` (id ของ user) ไม่ใช่ id ของแถว `project_member`

**Response ของ list** — คืนทีมงานทั้งหมด ไม่แบ่งหน้า (ทีมของโครงการมีไม่กี่คน) เรียงตาม `joinedAt`:

```json
{
  "data": [
    {
      "id": 1,
      "projectId": 1,
      "userId": 3,
      "roleInProject": "Site Engineer",
      "joinedAt": "2026-01-15T00:00:00.000Z",
      "user": {
        "id": 3,
        "firstname": "Somchai",
        "lastname": "Jaidee",
        "email": "engineer@buildtrack.com",
        "role": "STAFF",
        "phone": "0812345678",
        "companyId": 1,
        "company": { "id": 1, "name": "BuildTrack Co., Ltd.", "type": "CONTRACTOR" }
      }
    }
  ]
}
```

**POST `/projects/:id/members`** — request / response:

```json
{ "userId": 4, "roleInProject": "Foreman" }
```

```json
{ "message": "Member added", "member": { /* เหมือนรูปแบบด้านบน */ } }
```

**PATCH `/projects/:id/members/:userId`** — แก้ได้เฉพาะ `roleInProject`:

```json
{ "roleInProject": "Site Engineer" }
```

```json
{ "message": "Member updated", "member": { /* ... */ } }
```

**DELETE `/projects/:id/members/:userId`:**

```json
{ "message": "Member removed" }
```

> - `roleInProject` เป็น **free text** (ตำแหน่งในโครงการ) ไม่ใช่ `role` ของระบบ — เช่น `"Project Manager"` `"Structural Engineer"` `"Site Engineer"` `"Client Representative"`
> - ADMIN จัดการได้ทุกโครงการ · PM จัดการได้เฉพาะโครงการที่ตัวเองเป็นสมาชิก (ไม่งั้น `403`)
> - GET เปิดให้ทุกคนที่เข้าถึงโครงการได้ (member / CLIENT เจ้าของโครงการ / ADMIN)

**Status codes:**

| Code | เมื่อไหร่ |
| ---- | -------- |
| `400` | `userId` ไม่ใช่จำนวนเต็มบวก · `roleInProject` ว่างหรือยาวเกิน 100 ตัวอักษร |
| `403` | STAFF / CLIENT เรียก write endpoint · ผู้เรียกไม่ได้อยู่ในโครงการนี้ |
| `404` | `Project not found` · `User not found` · `Member not found` |
| `409` | `User is already a member of this project` (`@@unique([projectId, userId])`) |

---

## ✅ Tasks

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/tasks` | ดูงานทั้งหมด (filter ได้) | Member |
| POST | `/tasks` | สร้างงาน / งานย่อย | ADMIN, PM |
| GET | `/tasks/:id` | ดูรายละเอียดงาน | Member |
| PATCH | `/tasks/:id` | แก้ไขข้อมูลงาน | ADMIN, PM |
| DELETE | `/tasks/:id` | ลบงาน | ADMIN, PM |
| PATCH | `/tasks/:id/status` | เปลี่ยนสถานะ (ใช้ตอนลาก Kanban) | PM, ENG (ผู้รับผิดชอบ) |
| PATCH | `/tasks/:id/progress` | อัปเดต % ความคืบหน้า | PM, ENG (ผู้รับผิดชอบ) |
| GET | `/projects/:id/tasks/board` | ดึงงานจัดกลุ่มตามสถานะ (Kanban) | Member |

**Filters:** `?projectId=1&status=IN_PROGRESS&priority=HIGH&assignedToId=3&parentTaskId=null&dueBefore=2026-09-01`

> `status` = `TODO` \| `IN_PROGRESS` \| `REVIEW` \| `APPROVED` \| `COMPLETED`
> `priority` = `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL`

---

## 💬 Comments

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/tasks/:id/comments` | ดูความคิดเห็นทั้งหมดของงาน | Member |
| POST | `/comments` | เพิ่มความคิดเห็น | All (Member) |
| DELETE | `/comments/:id` | ลบความคิดเห็น (ของตัวเอง) | Owner, ADMIN |

---

## 📄 Documents

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/documents` | ดูเอกสารทั้งหมด (filter ได้) | Member |
| POST | `/documents` | อัปโหลดเอกสาร / แบบ / รูปภาพ | ADMIN, PM, ENG |
| GET | `/documents/:id` | ดูข้อมูลเอกสาร + ลิงก์ดาวน์โหลด | Member |
| DELETE | `/documents/:id` | ลบเอกสาร | ADMIN, PM, Uploader |

**Filters:** `?projectId=1&taskId=5&docType=DRAWING`

> `POST /documents` เป็น `multipart/form-data` (field: `file`) → อัปขึ้น Cloudinary แล้วเก็บ `file_url`
> `docType` = `DRAWING` \| `CONTRACT` \| `BOQ` \| `PHOTO` \| `REPORT` \| `OTHER`

---

## 📝 Daily Site Reports

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/daily-reports` | ดูรายงานหน้างานทั้งหมด | Member |
| POST | `/daily-reports` | ส่งรายงานประจำวัน | ENG, PM |
| GET | `/daily-reports/:id` | ดูรายละเอียดรายงาน | Member |
| PATCH | `/daily-reports/:id` | แก้ไขรายงาน (ของตัวเอง) | Owner, PM |
| DELETE | `/daily-reports/:id` | ลบรายงาน | ADMIN, PM |

**Filters:** `?projectId=1&from=2026-08-01&to=2026-08-31&reportedById=3`

---

## ⚠️ Issues

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/issues` | ดูปัญหาหน้างานทั้งหมด | Member |
| POST | `/issues` | แจ้งปัญหา / ความล่าช้า | ENG, PM |
| GET | `/issues/:id` | ดูรายละเอียดปัญหา | Member |
| PATCH | `/issues/:id` | แก้ไข / มอบหมายผู้รับผิดชอบ | ADMIN, PM |
| PATCH | `/issues/:id/status` | เปลี่ยนสถานะการแก้ไข | PM, ผู้รับผิดชอบ |

**Filters:** `?projectId=1&status=OPEN&priority=CRITICAL`

> `status` = `OPEN` \| `INVESTIGATING` \| `RESOLVED`
> การสร้าง issue จะ trigger notification ไปหา PM ของโครงการอัตโนมัติ

---

## 💰 Expenses & Budget

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/expenses` | ดูรายการค่าใช้จ่าย | ADMIN, PM, CLIENT |
| POST | `/expenses` | บันทึกค่าใช้จ่าย | ADMIN, PM |
| PATCH | `/expenses/:id` | แก้ไขรายการค่าใช้จ่าย | ADMIN, PM |
| DELETE | `/expenses/:id` | ลบรายการค่าใช้จ่าย | ADMIN, PM |
| GET | `/projects/:id/budget` | สรุปงบประมาณ vs ค่าใช้จ่ายจริง | ADMIN, PM, CLIENT |

**Filters:** `?projectId=1&category=MATERIAL&from=2026-08-01&to=2026-08-31`

> `category` = `MATERIAL` \| `LABOR` \| `EQUIPMENT` \| `OTHER`
> **STAFF ไม่มีสิทธิ์เห็นข้อมูลการเงิน** — ต้อง block ที่ backend ไม่ใช่แค่ซ่อนปุ่มใน UI

---

## 🔔 Notifications

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/notifications` | ดูการแจ้งเตือนของตัวเอง | All |
| PATCH | `/notifications/:id/read` | ทำเครื่องหมายว่าอ่านแล้ว | Owner |
| PATCH | `/notifications/read-all` | อ่านทั้งหมด | Owner |

**Filters:** `?isRead=false`

> `type` = `TASK_ASSIGNED` \| `ISSUE_REPORTED` \| `DEADLINE_NEAR` \| `COMMENT_ADDED`

---

## 📊 Dashboard & Reports

| Method | Endpoint | Description | Role |
| ------ | -------- | ----------- | ---- |
| GET | `/dashboard/summary` | KPI cards (จำนวนโครงการ, งานค้าง, งานเกินกำหนด) | All |
| GET | `/dashboard/tasks-by-status` | ข้อมูลกราฟงานแยกตามสถานะ | All |
| GET | `/dashboard/budget-usage` | ข้อมูลกราฟการใช้งบประมาณ | ADMIN, PM, CLIENT |
| GET | `/dashboard/activities` | กิจกรรมล่าสุด | All |
| GET | `/search` | ค้นหารวม (โครงการ / งาน / ผู้ใช้ / เอกสาร) | All |

---

# 📖 Endpoint Details

## POST `/auth/register`

สมัครสมาชิก

### Request Body

```json
{
  "firstname": "Purachaet",
  "lastname": "Ng",
  "email": "purachaet@email.com",
  "password": "password123",
  "phone": "0812345678"
}
```

> `password` ต้องยาวอย่างน้อย 8 ตัวอักษร
> `role` และ `companyId` **ส่งมาไม่ได้** — สมัครเองได้ role `STAFF` เท่านั้น
> ADMIN เป็นคนกำหนด role / company ให้ทีหลังผ่าน `PATCH /users/:id`

### Success Response (201)

```json
{
  "message": "Register success",
  "user": {
    "id": 1,
    "firstname": "Purachaet",
    "lastname": "Ng",
    "email": "purachaet@email.com",
    "role": "STAFF"
  }
}
```

### Error Response (409)

```json
{
  "status": "error",
  "message": "Email already exists"
}
```

---

## POST `/auth/login`

เข้าสู่ระบบ

### Request Body

```json
{
  "email": "purachaet@email.com",
  "password": "password123"
}
```

### Success Response (200)

```json
{
  "message": "Login success",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "firstname": "Purachaet",
    "lastname": "Ng",
    "email": "purachaet@email.com",
    "role": "STAFF"
  }
}
```

### Error Response (401)

```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

---

## POST `/projects`

สร้างโครงการใหม่ — Role: `ADMIN`, `PROJECT_MANAGER`

### Request Body

```json
{
  "name": "Bangkok Condominium",
  "location": "Sukhumvit 71, Bangkok",
  "clientCompanyId": 2,
  "startDate": "2026-09-01",
  "endDate": "2027-06-30",
  "budget": 25000000,
  "status": "PLANNING"
}
```

### Success Response (201)

```json
{
  "message": "Project created",
  "project": {
    "id": 1,
    "name": "Bangkok Condominium",
    "status": "PLANNING",
    "budget": "25000000.00",
    "progressPercent": 0
  }
}
```

---

## GET `/projects/:id/summary`

KPI ของโครงการ (ใช้กับหน้า Project Detail)

### Success Response (200)

```json
{
  "projectId": 1,
  "name": "Bangkok Condominium",
  "progressPercent": 72,
  "daysRemaining": 85,
  "budget": "25000000.00",
  "spent": "15500000.00",
  "remaining": "9500000.00",
  "budgetUsedPercent": 62,
  "taskCount": { "total": 48, "completed": 31, "overdue": 5 },
  "openIssues": 3
}
```

> `progressPercent` เป็นค่าที่ **คำนวณ** จากค่าเฉลี่ยของ `task.progressPercent` ไม่ได้เก็บใน DB

---

## PATCH `/tasks/:id/status`

เปลี่ยนสถานะงาน — ใช้ตอนลากการ์ดใน Kanban board

### Request Body

```json
{
  "status": "IN_PROGRESS"
}
```

### Success Response (200)

```json
{
  "message": "Task status updated",
  "task": {
    "id": 12,
    "name": "Install Steel Beam",
    "status": "IN_PROGRESS",
    "progressPercent": 40
  }
}
```

### Error Response (403)

```json
{
  "status": "error",
  "message": "Forbidden: You can update only your assigned task"
}
```

---

## POST `/daily-reports`

ส่งรายงานประจำวัน — Role: `STAFF`, `PROJECT_MANAGER`

### Request Body

```json
{
  "projectId": 1,
  "reportDate": "2026-08-13",
  "weather": "SUNNY",
  "manpowerCount": 35,
  "workSummary": "ติดตั้งเสาชั้น 3 เสร็จ 8 ต้น",
  "issues": "รถส่งคอนกรีตมาช้า 2 ชั่วโมง"
}
```

### Success Response (201)

```json
{
  "message": "Daily report submitted",
  "report": {
    "id": 45,
    "projectId": 1,
    "reportDate": "2026-08-13",
    "reportedBy": { "id": 3, "firstname": "Purachaet" }
  }
}
```

### Error Response (409)

```json
{
  "status": "error",
  "message": "Daily report for this date already exists"
}
```

---

## POST `/expenses`

บันทึกค่าใช้จ่าย — Role: `ADMIN`, `PROJECT_MANAGER`

### Request Body

```json
{
  "projectId": 1,
  "taskId": 12,
  "category": "MATERIAL",
  "description": "เหล็กเส้น DB16 จำนวน 200 เส้น",
  "amount": 185000.50,
  "spentAt": "2026-08-12"
}
```

### Success Response (201)

```json
{
  "message": "Expense recorded",
  "expense": {
    "id": 88,
    "category": "MATERIAL",
    "amount": "185000.50"
  }
}
```

> `amount` ส่งกลับเป็น **string** เพราะเก็บเป็น `Decimal(14,2)` — ห้ามใช้ Float กับข้อมูลเงิน

---

## GET `/dashboard/summary`

KPI cards หน้าแรก

### Success Response (200)

```json
{
  "projects": { "total": 12, "active": 8, "completed": 4 },
  "tasks": { "completed": 1245, "overdue": 17, "dueToday": 7 },
  "issues": { "open": 5 },
  "budgetUsedPercent": 62
}
```

> ข้อมูลถูกกรองตามสิทธิ์ของผู้ใช้ — ENG เห็นเฉพาะงานของตัวเอง และไม่เห็น `budgetUsedPercent`

---

# 🔒 Business Rules

## สิทธิ์การใช้งาน (Permission Matrix)

| ความสามารถ | ADMIN | PM | ENG | CLIENT |
| ---------- | :---: | :-: | :-: | :----: |
| จัดการผู้ใช้ / บริษัท | ✅ | ❌ | ❌ | ❌ |
| ดูรายชื่อผู้ใช้ (`GET /users`) | ✅ | ✅ | ❌ | ❌ |
| สร้าง / ลบโครงการ | ✅ | สร้างได้ | ❌ | ❌ |
| จัดการทีมงานในโครงการ | ✅ | ✅ | ❌ | ❌ |
| สร้าง / แก้ไข / ลบงาน | ✅ | ✅ | ❌ | ❌ |
| อัปเดตสถานะ + % งาน | ✅ | ✅ | เฉพาะงานตัวเอง | ❌ |
| ส่งรายงานประจำวัน | ✅ | ✅ | ✅ | ❌ |
| แจ้งปัญหาหน้างาน | ✅ | ✅ | ✅ | ❌ |
| อัปโหลดเอกสาร | ✅ | ✅ | ✅ | ❌ |
| ดู / บันทึกค่าใช้จ่าย | ✅ | ✅ | ❌ | ดูอย่างเดียว |
| แสดงความคิดเห็น | ✅ | ✅ | ✅ | ✅ |
| อนุมัติงาน (`APPROVED`) | ✅ | ✅ | ❌ | ✅ |

## กฎสำคัญ

- ทุก endpoint ต้อง login ก่อน ยกเว้น `/auth/register` และ `/auth/login`
- ผู้ใช้เห็นได้เฉพาะโครงการที่ตัวเองเป็นสมาชิก (`project_member`) — ADMIN เห็นทั้งหมด
- STAFF อัปเดตได้เฉพาะงานที่ถูกมอบหมายให้ตัวเอง (`assignedToUserId`)
- STAFF **ห้าม** เข้าถึงข้อมูลการเงินทุกกรณี (block ที่ backend)
- CLIENT ดูได้อย่างเดียว + คอมเมนต์ + อนุมัติงาน ไม่สามารถแก้ไขข้อมูลใดๆ
- ลบคอมเมนต์ได้เฉพาะของตัวเอง (ADMIN ลบได้ทั้งหมด)
- 1 โครงการ + 1 วัน = 1 daily report ต่อผู้รายงาน (`@@unique([projectId, reportDate, reportedById])`)
- `progressPercent` ต้องอยู่ระหว่าง 0–100 (ตรวจที่ Zod schema)
- ลบโครงการ = soft delete หรือ cascade — ต้องตัดสินใจก่อนเขียน migration
- ค่าเงินทุกที่ใช้ `Decimal(14,2)` ห้ามใช้ `Float`

---

# 🚧 Phase 2 (ยังไม่ทำใน MVP)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/auth/refresh` | ต่ออายุ token |
| POST | `/auth/logout` | ยกเลิก token ทันที (ต้องมี denylist table) |
| GET | `/projects/:id/gantt` | ข้อมูล Gantt chart |
| GET | `/reports/export` | ส่งออก PDF / Excel / CSV |
| GET | `/materials` | จัดการวัสดุ / อุปกรณ์ |
| WS | `/socket` | แจ้งเตือนแบบ real-time (Socket.IO) |
| GET | `/activities` | Audit log |
