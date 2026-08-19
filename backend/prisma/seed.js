import "dotenv/config";
import argon2 from "argon2";
import { prisma } from "../src/lib/prisma.js";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const TODAY = new Date("2026-08-13T00:00:00Z");

/** Date offset from TODAY, so seeded data always looks "current". */
const day = (offset) => {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};

/** Wipe in FK-dependency order so re-seeding is idempotent. */
async function reset() {
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.document.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
}

// ─────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🧹 Clearing existing data...");
  await reset();

  // argon2, NOT bcrypt: auth.controller.js verifies with argon2.verify, which
  // REJECTS a bcrypt hash rather than returning false. Seeding with bcrypt made
  // every demo account fail login with "Invalid credentials".
  const password = await argon2.hash(process.env.SEED_PASSWORD ?? "password123");

  // ── Companies ──────────────────────────────────────────────
  console.log("🏢 Seeding companies...");
  const owner = await prisma.company.create({
    data: {
      name: "Siam Property Development",
      type: "OWNER",
      contactEmail: "contact@siamproperty.co.th",
      contactPhone: "021234567",
    },
  });

  const contractor = await prisma.company.create({
    data: {
      name: "BuildTrack Construction",
      type: "CONTRACTOR",
      contactEmail: "info@buildtrack.co.th",
      contactPhone: "029876543",
    },
  });

  await prisma.company.create({
    data: {
      name: "TP Electrical Services",
      type: "SUBCONTRACTOR",
      contactEmail: "tp@electrical.co.th",
      contactPhone: "025554444",
    },
  });

  // ── Users (one per role — these are the demo logins) ───────
  console.log("👤 Seeding users...");
  const admin = await prisma.user.create({
    data: {
      companyId: contractor.id,
      firstname: "Admin",
      lastname: "System",
      email: "admin@buildtrack.com",
      passwordHash: password,
      role: "ADMIN",
      phone: "0810000001",
    },
  });

  const pm = await prisma.user.create({
    data: {
      companyId: contractor.id,
      firstname: "John",
      lastname: "Wattana",
      email: "pm@buildtrack.com",
      passwordHash: password,
      role: "PROJECT_MANAGER",
      phone: "0810000002",
    },
  });

  const engineer = await prisma.user.create({
    data: {
      companyId: contractor.id,
      firstname: "Purachaet",
      lastname: "Ng",
      email: "engineer@buildtrack.com",
      passwordHash: password,
      role: "STAFF",
      phone: "0810000003",
    },
  });

  const engineer2 = await prisma.user.create({
    data: {
      companyId: contractor.id,
      firstname: "Mike",
      lastname: "Chaiyaporn",
      email: "engineer2@buildtrack.com",
      passwordHash: password,
      role: "STAFF",
      phone: "0810000004",
    },
  });

  const client = await prisma.user.create({
    data: {
      companyId: owner.id,
      firstname: "Somchai",
      lastname: "Prasert",
      email: "client@siamproperty.co.th",
      passwordHash: password,
      role: "CLIENT",
      phone: "0810000005",
    },
  });

  // ── Projects ───────────────────────────────────────────────
  console.log("📁 Seeding projects...");

  // 1. Healthy, in progress
  const condo = await prisma.project.create({
    data: {
      clientCompanyId: owner.id,
      name: "Bangkok Condominium",
      location: "Sukhumvit 71, Bangkok",
      description: "อาคารชุดพักอาศัย 8 ชั้น 120 ยูนิต พร้อมที่จอดรถใต้ดิน",
      startDate: day(-120),
      endDate: day(180),
      status: "IN_PROGRESS",
      budget: "25000000.00",
    },
  });

  // 2. OVER BUDGET on purpose — proves the app handles unhappy states
  const mall = await prisma.project.create({
    data: {
      clientCompanyId: owner.id,
      name: "Rama 9 Shopping Mall - Phase 2",
      location: "Rama 9 Road, Bangkok",
      description: "ต่อเติมพื้นที่ค้าปลีก 3,500 ตร.ม. และปรับปรุงระบบไฟฟ้า",
      startDate: day(-200),
      endDate: day(30),
      status: "IN_PROGRESS",
      budget: "8000000.00",
    },
  });

  // 3. Completed — gives the dashboard something in every status
  const office = await prisma.project.create({
    data: {
      clientCompanyId: owner.id,
      name: "Ladprao Office Renovation",
      location: "Ladprao 101, Bangkok",
      description: "ปรับปรุงสำนักงาน 2 ชั้น พื้นที่ 800 ตร.ม.",
      startDate: day(-300),
      endDate: day(-40),
      status: "COMPLETED",
      budget: "3500000.00",
    },
  });

  // 4. Not started yet
  await prisma.project.create({
    data: {
      clientCompanyId: owner.id,
      name: "Chonburi Factory Warehouse",
      location: "Amata Nakorn, Chonburi",
      description: "โกดังสินค้าโครงสร้างเหล็ก 5,000 ตร.ม.",
      startDate: day(45),
      endDate: day(400),
      status: "PLANNING",
      budget: "12000000.00",
    },
  });

  // ── Project members ────────────────────────────────────────
  console.log("👷 Assigning project members...");
  await prisma.projectMember.createMany({
    data: [
      { projectId: condo.id, userId: pm.id, roleInProject: "Project Manager", joinedAt: day(-120) },
      { projectId: condo.id, userId: engineer.id, roleInProject: "Structural Engineer", joinedAt: day(-118) },
      { projectId: condo.id, userId: engineer2.id, roleInProject: "Site Engineer", joinedAt: day(-110) },
      { projectId: condo.id, userId: client.id, roleInProject: "Client Representative", joinedAt: day(-120) },

      { projectId: mall.id, userId: pm.id, roleInProject: "Project Manager", joinedAt: day(-200) },
      { projectId: mall.id, userId: engineer2.id, roleInProject: "Site Engineer", joinedAt: day(-195) },
      { projectId: mall.id, userId: client.id, roleInProject: "Client Representative", joinedAt: day(-200) },

      { projectId: office.id, userId: pm.id, roleInProject: "Project Manager", joinedAt: day(-300) },
      { projectId: office.id, userId: engineer.id, roleInProject: "Site Engineer", joinedAt: day(-298) },
    ],
  });

  // ── Tasks (with sub-tasks) ─────────────────────────────────
  console.log("✅ Seeding tasks...");

  /** Create a parent task plus its sub-tasks in one go. */
  async function createWbs(projectId, parent, children = []) {
    const created = await prisma.task.create({ data: { projectId, ...parent } });
    for (const child of children) {
      await prisma.task.create({
        data: { projectId, parentTaskId: created.id, ...child },
      });
    }
    return created;
  }

  // Condominium — a realistic WBS
  await createWbs(
    condo.id,
    {
      name: "งานฐานราก (Foundation)",
      description: "เสาเข็ม ฐานราก และคานคอดิน",
      status: "COMPLETED",
      priority: "CRITICAL",
      progressPercent: 100,
      startDate: day(-120),
      dueDate: day(-70),
      assignedToUserId: engineer.id,
    },
    [
      { name: "ตอกเสาเข็ม", status: "COMPLETED", priority: "CRITICAL", progressPercent: 100, startDate: day(-120), dueDate: day(-100), assignedToUserId: engineer.id },
      { name: "หล่อฐานราก", status: "COMPLETED", priority: "HIGH", progressPercent: 100, startDate: day(-99), dueDate: day(-85), assignedToUserId: engineer.id },
      { name: "คานคอดิน", status: "COMPLETED", priority: "HIGH", progressPercent: 100, startDate: day(-84), dueDate: day(-70), assignedToUserId: engineer2.id },
    ]
  );

  await createWbs(
    condo.id,
    {
      name: "งานโครงสร้างชั้น 1-4",
      description: "เสา คาน และพื้นชั้น 1 ถึง 4",
      status: "IN_PROGRESS",
      priority: "HIGH",
      progressPercent: 65,
      startDate: day(-69),
      dueDate: day(20),
      assignedToUserId: engineer.id,
    },
    [
      { name: "เสาชั้น 1-2", status: "COMPLETED", priority: "HIGH", progressPercent: 100, startDate: day(-69), dueDate: day(-40), assignedToUserId: engineer.id },
      { name: "พื้นชั้น 2-3", status: "IN_PROGRESS", priority: "HIGH", progressPercent: 70, startDate: day(-39), dueDate: day(-5), assignedToUserId: engineer.id }, // OVERDUE
      { name: "เสาชั้น 3-4", status: "IN_PROGRESS", priority: "MEDIUM", progressPercent: 40, startDate: day(-20), dueDate: day(12), assignedToUserId: engineer2.id },
      { name: "ติดตั้งคานเหล็ก", status: "TODO", priority: "MEDIUM", progressPercent: 0, startDate: day(5), dueDate: day(20), assignedToUserId: engineer2.id },
    ]
  );

  await createWbs(
    condo.id,
    {
      name: "งานระบบไฟฟ้าและสุขาภิบาล",
      status: "TODO",
      priority: "MEDIUM",
      progressPercent: 0,
      startDate: day(25),
      dueDate: day(120),
      assignedToUserId: engineer2.id,
    },
    [
      { name: "เดินท่อร้อยสายไฟ", status: "TODO", priority: "MEDIUM", progressPercent: 0, startDate: day(25), dueDate: day(60) },
      { name: "ติดตั้งระบบประปา", status: "TODO", priority: "LOW", progressPercent: 0, startDate: day(50), dueDate: day(90) },
    ]
  );

  await prisma.task.create({
    data: {
      projectId: condo.id,
      name: "ตรวจสอบคุณภาพคอนกรีตชั้น 2",
      description: "ทดสอบกำลังอัดคอนกรีตที่ 28 วัน",
      status: "REVIEW",
      priority: "HIGH",
      progressPercent: 90,
      startDate: day(-15),
      dueDate: day(3),
      assignedToUserId: engineer.id,
    },
  });

  await prisma.task.create({
    data: {
      projectId: condo.id,
      name: "ส่งมอบงานฐานรากให้เจ้าของโครงการ",
      status: "APPROVED",
      priority: "MEDIUM",
      progressPercent: 100,
      startDate: day(-68),
      dueDate: day(-60),
      assignedToUserId: pm.id,
    },
  });

  // Shopping mall — the troubled project
  await createWbs(
    mall.id,
    {
      name: "งานรื้อถอนและเตรียมพื้นที่",
      status: "COMPLETED",
      priority: "HIGH",
      progressPercent: 100,
      startDate: day(-200),
      dueDate: day(-160),
      assignedToUserId: engineer2.id,
    },
    [
      { name: "รื้อผนังเดิม", status: "COMPLETED", priority: "MEDIUM", progressPercent: 100, startDate: day(-200), dueDate: day(-180), assignedToUserId: engineer2.id },
      { name: "ขนย้ายเศษวัสดุ", status: "COMPLETED", priority: "LOW", progressPercent: 100, startDate: day(-179), dueDate: day(-160), assignedToUserId: engineer2.id },
    ]
  );

  await createWbs(
    mall.id,
    {
      name: "งานปรับปรุงระบบไฟฟ้า",
      description: "เปลี่ยนตู้ MDB และเดินสายใหม่ทั้งหมด",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      progressPercent: 55,
      startDate: day(-159),
      dueDate: day(-10),
      assignedToUserId: engineer2.id,
    },
    [
      { name: "ติดตั้งตู้ MDB ใหม่", status: "COMPLETED", priority: "CRITICAL", progressPercent: 100, startDate: day(-159), dueDate: day(-120), assignedToUserId: engineer2.id },
      { name: "เดินสายไฟชั้น 1", status: "IN_PROGRESS", priority: "HIGH", progressPercent: 60, startDate: day(-119), dueDate: day(-20), assignedToUserId: engineer2.id }, // OVERDUE
      { name: "เดินสายไฟชั้น 2", status: "TODO", priority: "HIGH", progressPercent: 0, startDate: day(-19), dueDate: day(-2), assignedToUserId: engineer2.id }, // OVERDUE
    ]
  );

  await prisma.task.create({
    data: {
      projectId: mall.id,
      name: "งานตกแต่งภายในโซน A",
      status: "TODO",
      priority: "MEDIUM",
      progressPercent: 0,
      startDate: day(-5),
      dueDate: day(25),
      assignedToUserId: engineer2.id,
    },
  });

  // Completed project
  await prisma.task.create({
    data: {
      projectId: office.id,
      name: "ปรับปรุงพื้นที่สำนักงานชั้น 1",
      status: "COMPLETED",
      priority: "MEDIUM",
      progressPercent: 100,
      startDate: day(-300),
      dueDate: day(-150),
      assignedToUserId: engineer.id,
    },
  });

  await prisma.task.create({
    data: {
      projectId: office.id,
      name: "ปรับปรุงพื้นที่สำนักงานชั้น 2",
      status: "COMPLETED",
      priority: "MEDIUM",
      progressPercent: 100,
      startDate: day(-149),
      dueDate: day(-45),
      assignedToUserId: engineer.id,
    },
  });

  const allTasks = await prisma.task.findMany();
  const findTask = (name) => allTasks.find((t) => t.name === name);

  // ── Expenses ───────────────────────────────────────────────
  // Condo: 15.5M of 25M  (62% — healthy)
  // Mall:  8.9M of 8.0M  (111% — OVER BUDGET, on purpose)
  console.log("💰 Seeding expenses...");
  await prisma.expense.createMany({
    data: [
      // Bangkok Condominium
      { projectId: condo.id, recordedById: pm.id, category: "MATERIAL", description: "เสาเข็มเจาะ 120 ต้น", amount: "4200000.00", spentAt: day(-115) },
      { projectId: condo.id, recordedById: pm.id, category: "MATERIAL", description: "คอนกรีตผสมเสร็จ 850 คิว", amount: "2975000.00", spentAt: day(-95) },
      { projectId: condo.id, recordedById: pm.id, category: "MATERIAL", description: "เหล็กเส้น DB16 และ DB20", amount: "3100000.00", spentAt: day(-80) },
      { projectId: condo.id, recordedById: pm.id, category: "LABOR", description: "ค่าแรงงานเดือน มิ.ย.-ก.ค.", amount: "2850000.00", spentAt: day(-45) },
      { projectId: condo.id, recordedById: pm.id, category: "EQUIPMENT", description: "ค่าเช่าเครนและนั่งร้าน", amount: "1875000.00", spentAt: day(-30) },
      { projectId: condo.id, recordedById: admin.id, category: "OTHER", description: "ค่าธรรมเนียมขออนุญาตก่อสร้าง", amount: "500000.00", spentAt: day(-118) },

      // Rama 9 Mall — over budget
      { projectId: mall.id, recordedById: pm.id, category: "LABOR", description: "ค่าแรงรื้อถอน", amount: "1200000.00", spentAt: day(-190) },
      { projectId: mall.id, recordedById: pm.id, category: "MATERIAL", description: "ตู้ MDB และอุปกรณ์ไฟฟ้า", amount: "3400000.00", spentAt: day(-150) },
      { projectId: mall.id, recordedById: pm.id, category: "MATERIAL", description: "สายไฟและท่อร้อยสาย", amount: "2100000.00", spentAt: day(-110) },
      { projectId: mall.id, recordedById: pm.id, category: "LABOR", description: "ค่าแรงงานระบบไฟฟ้า (ล่วงเวลา)", amount: "1650000.00", spentAt: day(-40) },
      { projectId: mall.id, recordedById: pm.id, category: "OTHER", description: "ค่าปรับความล่าช้าจากผู้รับเหมาช่วง", amount: "550000.00", spentAt: day(-15) },

      // Ladprao Office
      { projectId: office.id, recordedById: pm.id, category: "MATERIAL", description: "วัสดุตกแต่งภายใน", amount: "1450000.00", spentAt: day(-250) },
      { projectId: office.id, recordedById: pm.id, category: "LABOR", description: "ค่าแรงงานตกแต่ง", amount: "980000.00", spentAt: day(-180) },
      { projectId: office.id, recordedById: pm.id, category: "EQUIPMENT", description: "ระบบปรับอากาศ", amount: "720000.00", spentAt: day(-120) },
    ],
  });

  // ── Daily site reports ─────────────────────────────────────
  console.log("📝 Seeding daily reports...");
  await prisma.dailyReport.createMany({
    data: [
      {
        projectId: condo.id,
        reportedById: engineer.id,
        reportDate: day(-1),
        weather: "SUNNY",
        manpowerCount: 35,
        workSummary: "เทพื้นชั้น 3 โซน A เสร็จ 180 ตร.ม. ติดตั้งแบบหล่อเสาชั้น 3 จำนวน 12 ต้น",
        issues: "รถโม่ปูนมาช้ากว่ากำหนด 2 ชั่วโมง เนื่องจากการจราจร",
      },
      {
        projectId: condo.id,
        reportedById: engineer.id,
        reportDate: day(-2),
        weather: "CLOUDY",
        manpowerCount: 38,
        workSummary: "ผูกเหล็กพื้นชั้น 3 โซน A เสร็จ 100% ตรวจสอบระยะหุ้มคอนกรีตแล้ว",
        issues: null,
      },
      {
        projectId: condo.id,
        reportedById: engineer2.id,
        reportDate: day(-2),
        weather: "CLOUDY",
        manpowerCount: 12,
        workSummary: "ติดตั้งนั่งร้านด้านทิศตะวันออก ชั้น 3-4",
        issues: null,
      },
      {
        projectId: condo.id,
        reportedById: engineer.id,
        reportDate: day(-3),
        weather: "RAINY",
        manpowerCount: 15,
        workSummary: "หยุดงานคอนกรีตเนื่องจากฝนตก ทำงานภายในอาคารแทน",
        issues: "ฝนตกหนักช่วงบ่าย ทำให้งานเทคอนกรีตต้องเลื่อนออกไป 1 วัน",
      },
      {
        projectId: mall.id,
        reportedById: engineer2.id,
        reportDate: day(-1),
        weather: "SUNNY",
        manpowerCount: 18,
        workSummary: "เดินสายไฟชั้น 1 โซน B ความคืบหน้า 60%",
        issues: "ขาดแคลนช่างไฟฟ้า 4 คน ทำให้งานล่าช้ากว่าแผน",
      },
    ],
  });

  // ── Issues ─────────────────────────────────────────────────
  console.log("⚠️  Seeding issues...");
  await prisma.issue.createMany({
    data: [
      {
        projectId: condo.id,
        taskId: findTask("พื้นชั้น 2-3")?.id ?? null,
        reportedById: engineer.id,
        assignedToId: pm.id,
        title: "พบรอยร้าวที่พื้นชั้น 2 บริเวณโซน C",
        description: "ตรวจพบรอยร้าวลายงากว้างประมาณ 0.3 มม. ยาว 1.2 ม. ต้องให้วิศวกรโครงสร้างประเมิน",
        priority: "HIGH",
        status: "INVESTIGATING",
      },
      {
        projectId: condo.id,
        reportedById: engineer2.id,
        assignedToId: pm.id,
        title: "วัสดุเหล็กเส้นส่งไม่ครบตามใบสั่งซื้อ",
        description: "สั่ง DB20 จำนวน 200 เส้น ได้รับจริง 160 เส้น ติดต่อผู้ขายแล้ว",
        priority: "MEDIUM",
        status: "OPEN",
      },
      {
        projectId: mall.id,
        taskId: findTask("เดินสายไฟชั้น 1")?.id ?? null,
        reportedById: engineer2.id,
        assignedToId: pm.id,
        title: "งานระบบไฟฟ้าล่าช้ากว่าแผน 20 วัน",
        description: "ขาดแคลนช่างไฟฟ้าที่มีใบอนุญาต ต้องพิจารณาจ้างผู้รับเหมาช่วงเพิ่ม",
        priority: "CRITICAL",
        status: "OPEN",
      },
      {
        projectId: mall.id,
        reportedById: pm.id,
        title: "งบประมาณโครงการเกินแผนที่ตั้งไว้",
        description: "ค่าใช้จ่ายสะสมเกินงบประมาณ ต้องขออนุมัติงบเพิ่มเติมจากเจ้าของโครงการ",
        priority: "CRITICAL",
        status: "OPEN",
      },
      {
        projectId: condo.id,
        reportedById: engineer.id,
        assignedToId: engineer2.id,
        title: "นั่งร้านด้านทิศใต้ไม่มั่นคง",
        description: "ตรวจพบจุดยึดนั่งร้านหลวม แก้ไขเรียบร้อยแล้ว",
        priority: "HIGH",
        status: "RESOLVED",
        resolvedAt: day(-8),
      },
    ],
  });

  // ── Comments ───────────────────────────────────────────────
  console.log("💬 Seeding comments...");
  const floorTask = findTask("พื้นชั้น 2-3");
  const reviewTask = findTask("ตรวจสอบคุณภาพคอนกรีตชั้น 2");

  if (floorTask) {
    await prisma.comment.createMany({
      data: [
        { userId: engineer.id, taskId: floorTask.id, content: "เทคอนกรีตโซน A เสร็จแล้วครับ เหลือโซน B และ C" },
        { userId: pm.id, taskId: floorTask.id, content: "รับทราบ ช่วยส่งรูปหน้างานให้ดูด้วยนะครับ" },
        { userId: engineer.id, taskId: floorTask.id, content: "อัปโหลดรูปไว้ในเอกสารโครงการแล้วครับ" },
      ],
    });
  }

  if (reviewTask) {
    await prisma.comment.createMany({
      data: [
        { userId: engineer.id, taskId: reviewTask.id, content: "ผลทดสอบกำลังอัดที่ 28 วัน ได้ 280 ksc ผ่านเกณฑ์ที่กำหนด" },
        { userId: client.id, taskId: reviewTask.id, content: "ขอบคุณครับ รบกวนส่งใบรายงานผลทดสอบมาด้วย" },
      ],
    });
  }

  // ── Notifications ──────────────────────────────────────────
  console.log("🔔 Seeding notifications...");
  await prisma.notification.createMany({
    data: [
      { userId: pm.id, type: "ISSUE_REPORTED", message: "Purachaet รายงานปัญหา: พบรอยร้าวที่พื้นชั้น 2 บริเวณโซน C", linkUrl: `/projects/${condo.id}/issues`, isRead: false },
      { userId: pm.id, type: "ISSUE_REPORTED", message: "Mike รายงานปัญหา: งานระบบไฟฟ้าล่าช้ากว่าแผน 20 วัน", linkUrl: `/projects/${mall.id}/issues`, isRead: false },
      { userId: engineer.id, type: "TASK_ASSIGNED", message: "คุณได้รับมอบหมายงาน: ตรวจสอบคุณภาพคอนกรีตชั้น 2", linkUrl: `/tasks/${reviewTask?.id ?? ""}`, isRead: false },
      { userId: engineer.id, type: "DEADLINE_NEAR", message: "งาน 'พื้นชั้น 2-3' เลยกำหนดส่งแล้ว 5 วัน", linkUrl: `/tasks/${floorTask?.id ?? ""}`, isRead: false },
      { userId: engineer.id, type: "COMMENT_ADDED", message: "John แสดงความคิดเห็นในงาน 'พื้นชั้น 2-3'", linkUrl: `/tasks/${floorTask?.id ?? ""}`, isRead: true },
      { userId: engineer2.id, type: "TASK_ASSIGNED", message: "คุณได้รับมอบหมายงาน: เดินสายไฟชั้น 2", isRead: false },
      { userId: client.id, type: "COMMENT_ADDED", message: "มีความคืบหน้าใหม่ในโครงการ Bangkok Condominium", linkUrl: `/projects/${condo.id}`, isRead: false },
    ],
  });

  // ── Summary ────────────────────────────────────────────────
  const counts = {
    companies: await prisma.company.count(),
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    members: await prisma.projectMember.count(),
    tasks: await prisma.task.count(),
    expenses: await prisma.expense.count(),
    dailyReports: await prisma.dailyReport.count(),
    issues: await prisma.issue.count(),
    comments: await prisma.comment.count(),
    notifications: await prisma.notification.count(),
  };

  console.log("\n✅ Seed complete:");
  console.table(counts);

  console.log("\n🔑 Demo logins (password: %s)", process.env.SEED_PASSWORD ?? "password123");
  console.table([
    { role: "ADMIN", email: "admin@buildtrack.com" },
    { role: "PROJECT_MANAGER", email: "pm@buildtrack.com" },
    { role: "STAFF", email: "engineer@buildtrack.com" },
    { role: "STAFF", email: "engineer2@buildtrack.com" },
    { role: "CLIENT", email: "client@siamproperty.co.th" },
  ]);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
