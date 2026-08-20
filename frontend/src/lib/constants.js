/**
 * Fixed enum values, their Thai labels, and their chip colors.
 *
 * Every value here must match the Prisma enums in PLAN.md §3 exactly — the API
 * filters on these strings, so a typo silently returns an empty list instead of
 * an error. Import from here rather than re-typing string literals in a screen.
 *
 * Colors come from UI-PROMPT.md PROMPT 0. The brand orange (#E08A00) never
 * encodes status; status uses the semantic colors only.
 *
 * Chip labels render at 11px, which is SMALL text — every fg/bg pair below is
 * held to 4.5:1, not the 3:1 large-text allowance. Ratios are noted so they can
 * be re-checked after any edit.
 */

// ─── Roles ───────────────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: "ADMIN",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  STAFF: "STAFF",
  CLIENT: "CLIENT",
};

/** Role chips are identity, not status — neutral tones with one accent. */
export const ROLE_META = {
  ADMIN: { label: "ผู้ดูแลระบบ", fg: "#042630", bg: "#F3F6F6" }, // 14.58:1
  PROJECT_MANAGER: { label: "ผู้จัดการโครงการ", fg: "#10657F", bg: "#CFE2E7" }, // 4.92:1
  STAFF: { label: "วิศวกร/หน้างาน", fg: "#58666A", bg: "#E8ECED" }, // 5.01:1
  CLIENT: { label: "ลูกค้า", fg: "#58666A", bg: "#F3F6F6" }, // 5.48:1
};

// ─── Project ─────────────────────────────────────────────────────────────────

export const PROJECT_STATUS = {
  PLANNING: "PLANNING",
  IN_PROGRESS: "IN_PROGRESS",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
};

export const PROJECT_STATUS_META = {
  PLANNING: { label: "วางแผน", fg: "#58666A", bg: "#F3F6F6" }, // 5.48:1
  IN_PROGRESS: { label: "กำลังดำเนินการ", fg: "#10657F", bg: "#E7F0F3" }, // 5.69:1
  ON_HOLD: { label: "พักงาน", fg: "#905A04", bg: "#FCEBCF" }, // 4.91:1
  COMPLETED: { label: "เสร็จสิ้น", fg: "#07465A", bg: "#CFE2E7" }, // 7.72:1
};

// ─── Task ────────────────────────────────────────────────────────────────────

export const TASK_STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  APPROVED: "APPROVED",
  COMPLETED: "COMPLETED",
};

/** Also the Kanban column order, left to right. */
export const TASK_STATUS_ORDER = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "APPROVED",
  "COMPLETED",
];

export const TASK_STATUS_META = {
  TODO: { label: "รอดำเนินการ", fg: "#58666A", bg: "#F3F6F6" }, // 5.48:1
  IN_PROGRESS: { label: "กำลังทำ", fg: "#10657F", bg: "#E7F0F3" }, // 5.69:1
  REVIEW: { label: "รอตรวจ", fg: "#905A04", bg: "#FCEBCF" }, // 4.91:1
  APPROVED: { label: "อนุมัติแล้ว", fg: "#1F7A4C", bg: "#E6F3EC" }, // 4.66:1
  COMPLETED: { label: "เสร็จสิ้น", fg: "#07465A", bg: "#CFE2E7" }, // 7.72:1
};

export const PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

/**
 * Rendered as 6px dots, so these are graphical objects held to 3:1 on white.
 * HIGH is #905A04, not the brand orange #E08A00 — at 2.69:1 that dot would not
 * be discernible against the card.
 */
export const PRIORITY_META = {
  LOW: { label: "ต่ำ", color: "#58666A" },
  MEDIUM: { label: "ปานกลาง", color: "#10657F" },
  HIGH: { label: "สูง", color: "#905A04" },
  CRITICAL: { label: "วิกฤต", color: "#B3261E" },
};

// ─── Issue ───────────────────────────────────────────────────────────────────

export const ISSUE_STATUS = {
  OPEN: "OPEN",
  INVESTIGATING: "INVESTIGATING",
  RESOLVED: "RESOLVED",
};

export const ISSUE_STATUS_META = {
  OPEN: { label: "เปิดอยู่", fg: "#B3261E", bg: "#FBEAE8" }, // 5.61:1
  INVESTIGATING: { label: "กำลังตรวจสอบ", fg: "#905A04", bg: "#FCEBCF" }, // 4.91:1
  RESOLVED: { label: "แก้ไขแล้ว", fg: "#1F7A4C", bg: "#E6F3EC" }, // 4.66:1
};

// ─── Company ─────────────────────────────────────────────────────────────────

export const COMPANY_TYPE = {
  OWNER: "OWNER",
  CONTRACTOR: "CONTRACTOR",
  SUBCONTRACTOR: "SUBCONTRACTOR",
};

/**
 * Company type is identity, not status — so, like ROLE_META, neutral tones with
 * one accent for the party that owns the job. The three pairs are lifted
 * verbatim from ROLE_META rather than newly mixed, so the ratios below are the
 * ones already checked there.
 */
export const COMPANY_TYPE_META = {
  OWNER: { label: "เจ้าของโครงการ", fg: "#10657F", bg: "#CFE2E7" }, // 4.92:1
  CONTRACTOR: { label: "ผู้รับเหมา", fg: "#58666A", bg: "#E8ECED" }, // 5.01:1
  SUBCONTRACTOR: { label: "ผู้รับเหมาช่วง", fg: "#58666A", bg: "#F3F6F6" }, // 5.48:1
};

// ─── Document ────────────────────────────────────────────────────────────────

export const DOC_TYPE = {
  DRAWING: "DRAWING",
  CONTRACT: "CONTRACT",
  BOQ: "BOQ",
  PHOTO: "PHOTO",
  REPORT: "REPORT",
  OTHER: "OTHER",
};

export const DOC_TYPE_META = {
  DRAWING: { label: "แบบก่อสร้าง" },
  CONTRACT: { label: "สัญญา" },
  BOQ: { label: "BOQ" },
  PHOTO: { label: "รูปถ่าย" },
  REPORT: { label: "รายงาน" },
  OTHER: { label: "อื่นๆ" },
};

// ─── Expense ─────────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORY = {
  MATERIAL: "MATERIAL",
  LABOR: "LABOR",
  EQUIPMENT: "EQUIPMENT",
  OTHER: "OTHER",
};

export const EXPENSE_CATEGORY_META = {
  MATERIAL: { label: "วัสดุ" },
  LABOR: { label: "ค่าแรง" },
  EQUIPMENT: { label: "เครื่องจักร" },
  OTHER: { label: "อื่นๆ" },
};

// ─── Daily report ────────────────────────────────────────────────────────────

export const WEATHER = {
  SUNNY: "SUNNY",
  CLOUDY: "CLOUDY",
  RAINY: "RAINY",
  STORMY: "STORMY",
};

/** `icon` is the lucide component name the segmented control renders. */
export const WEATHER_META = {
  SUNNY: { label: "แจ่มใส", icon: "Sun" },
  CLOUDY: { label: "มีเมฆ", icon: "Cloud" },
  RAINY: { label: "ฝนตก", icon: "CloudRain" },
  STORMY: { label: "ฝนตกหนัก", icon: "CloudLightning" },
};

// ─── Notification ────────────────────────────────────────────────────────────

export const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: "TASK_ASSIGNED",
  ISSUE_REPORTED: "ISSUE_REPORTED",
  DEADLINE_NEAR: "DEADLINE_NEAR",
  COMMENT_ADDED: "COMMENT_ADDED",
};

// ─── Navigation ──────────────────────────────────────────────────────────────

/**
 * Sidebar items in order. `roles` is who sees the item.
 *
 * Hiding a nav item is COSMETIC ONLY. The backend enforces the real permissions
 * on every endpoint (see backend/src/middlewares/auth.middleware.js) — a user
 * who types the URL directly still gets a 403 from the API.
 */
export const NAV_ITEMS = [
  {
    to: "/",
    label: "แดชบอร์ด",
    icon: "LayoutDashboard",
    roles: ["ADMIN", "PROJECT_MANAGER", "STAFF", "CLIENT"],
  },
  {
    to: "/projects",
    label: "โครงการ",
    icon: "FolderKanban",
    roles: ["ADMIN", "PROJECT_MANAGER", "STAFF", "CLIENT"],
  },
  {
    to: "/my-tasks",
    label: "งานของฉัน",
    icon: "CircleCheck",
    roles: ["ADMIN", "PROJECT_MANAGER", "STAFF"],
  },
  {
    to: "/daily-reports",
    label: "รายงานหน้างาน",
    icon: "ClipboardList",
    roles: ["ADMIN", "PROJECT_MANAGER", "STAFF"],
  },
  {
    to: "/issues",
    label: "ปัญหาหน้างาน",
    icon: "TriangleAlert",
    roles: ["ADMIN", "PROJECT_MANAGER", "STAFF"],
  },
  {
    to: "/expenses",
    label: "ค่าใช้จ่าย",
    icon: "Wallet",
    roles: ["ADMIN", "PROJECT_MANAGER", "CLIENT"], // STAFF never sees money
  },
  {
    to: "/documents",
    label: "เอกสาร",
    icon: "FileText",
    roles: ["ADMIN", "PROJECT_MANAGER", "STAFF", "CLIENT"],
  },
];

/** Rendered under a divider labelled "ผู้ดูแลระบบ". */
export const ADMIN_NAV_ITEMS = [
  { to: "/users", label: "ผู้ใช้งาน", icon: "Users", roles: ["ADMIN"] },
  { to: "/companies", label: "บริษัท", icon: "Building2", roles: ["ADMIN"] },
];

// ─── List query defaults (APIs.md → Conventions) ─────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
