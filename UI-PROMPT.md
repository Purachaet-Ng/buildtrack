# 🎨 BuildTrack — Prompt สำหรับ AI UI Generator

ไฟล์นี้เป็น **prompt สำเร็จรูป** สำหรับสร้างหน้าจอ BuildTrack ด้วย AI generator
สไตล์: **Minimal** · Primary color: **`#042630`** (Dark Teal) · Action color: **`#e08a00`** (Orange)

ใช้ได้กับ v0 · Lovable · Bolt · Claude Artifacts · Cursor — เครื่องมือที่สร้าง React/Tailwind ออกมาเป็นโค้ด

---

## วิธีใช้

1. แนบไฟล์ `APIs.md` + `workflow-diagrams.html` เข้าไปด้วย (ถ้าเครื่องมือรองรับการแนบไฟล์)
2. วาง **PROMPT 0** ก่อนเสมอ — เป็นตัวตั้งค่า design system ทั้งหมด
3. จากนั้นวาง **PROMPT 1–10** ทีละอัน อย่าส่งรวดเดียว AI จะทำได้ดีกว่ามากเมื่อสั่งทีละหน้าจอ
4. ถ้า generator ลืม design system ระหว่างทาง ให้วาง PROMPT 0 ซ้ำแล้วต่อด้วยหน้าที่ค้างอยู่

> **ทำไม prompt เป็นภาษาอังกฤษ แต่ UI เป็นภาษาไทย** — AI generator ตีความคำสั่งภาษาอังกฤษได้แม่นกว่ามาก แต่ข้อความบนหน้าจอถูกระบุเป็นภาษาไทยไว้ตรงๆ ใน prompt แล้ว ผลลัพธ์จึงออกมาเป็น UI ไทย

---

## ⚠️ อ่านก่อน — สีสองตัวที่มีข้อจำกัดคนละแบบ

พาเลตนี้มีสีเข้มมาก (`#042630`) กับสีสว่างมาก (`#e08a00`) อยู่ด้วยกัน **กฎของสองตัวนี้ตรงข้ามกัน อย่าสลับ**

**`#042630`** Dark Teal (HSL 194° 85% 10%) — เข้มเกือบดำ ใช้ตัวหนังสือ**ขาว**
**`#e08a00`** Orange (HSL 37° 100% 44%) — สว่างเกินกว่าจะใช้ตัวหนังสือขาวทับได้ ใช้ตัวหนังสือ**เข้ม**

| คู่สี | Contrast | ผล |
| ----- | -------- | -- |
| ตัวหนังสือขาว บน `#042630` | **15.85 : 1** | ✅ ผ่าน AA/AAA |
| ตัวหนังสือขาว บน `#e08a00` | **2.69 : 1** | ❌ ตกมาตรฐาน อ่านไม่ออก |
| ตัวหนังสือ `#042630` บน `#e08a00` | **5.89 : 1** | ✅ ผ่าน AA |
| `#e08a00` บนพื้นขาว | 2.69 : 1 | ❌ ห้ามใช้เป็นสีตัวหนังสือ |
| `#905A04` บนพื้นขาว | **5.75 : 1** | ✅ ใช้เป็นสีตัวหนังสือส้มได้ |
| `#10657F` บนพื้นขาว | **6.58 : 1** | ✅ ใช้เป็นสีลิงก์ได้ |

ถ้าไม่บอก AI ข้อนี้ มันจะสร้างปุ่มส้มตัวหนังสือขาวที่อ่านไม่ออกให้แน่นอน — **PROMPT 0 ระบุกฎนี้ไว้แล้ว อย่าลบออก**

**กฎง่ายๆ:** `#e08a00` ใช้เป็น **พื้น** เท่านั้น (คู่กับตัวหนังสือ `#042630`) · ถ้าจะใช้เป็น **ตัวหนังสือ** ให้ใช้ `#905A04`

**อีกสองข้อที่ต้องระวัง:**

- `#361C0A` (Brown) มีความสว่างเท่ากับ `#042630` **พอดี (1.00 : 1)** — ห้ามวางติดกันเป็นสองพื้น หรือใช้เป็นสองเส้นในกราฟ Brown ใช้ได้ทางเดียวคือเป็นตัวหนังสือเข้มบนพื้นส้มอ่อน
- `#6B7C80` (LightBlue) บนพื้นขาวได้ **4.36 : 1** — **ต่ำกว่า 4.5 เล็กน้อย ห้ามใช้เป็นตัวหนังสือ** ใช้ได้กับเส้นขอบ ไอคอน จุด เท่านั้น ถ้าต้องการตัวหนังสือสีเทาให้ใช้ `#58666A`

---

# PROMPT 0 — Design System (วางอันนี้ก่อนเสมอ)

```
You are building the UI for BuildTrack, a construction project management web app
used by Thai construction companies. All visible UI text must be in Thai.

STACK
React 19 + Vite, JavaScript, Tailwind CSS v4, shadcn/ui, lucide-react icons,
TanStack Query for server state, Zustand for auth/UI state only, react-router-dom.

Tailwind v4 is CSS-first: there is NO tailwind.config.js. Theme tokens are declared
in an @theme block inside globals.css, and shadcn's CSS variables are set in :root
in the same file. Do not generate a tailwind.config.js.

VISUAL DIRECTION — MINIMAL
Calm, flat, and quiet. This is a tool people stare at for eight hours, not a landing page.
- Flat surfaces. No gradients. No glassmorphism. No decorative blobs or illustrations.
- Exactly one elevation level: a 1px border (#D2D9DA). Use shadows only for overlays
  (dropdown, dialog, popover) and keep them soft: 0 4px 16px rgba(4,38,48,.10).
- Border radius: 8px for cards, inputs, and buttons. 6px for chips and badges. Never fully rounded
  except avatars and status dots. Do not use pill-shaped buttons.
- Generous whitespace. Section gap 32px, card padding 24px, form field gap 20px.
- Color is information, not decoration. A screen should read as dark teal chrome around
  a neutral grey-blue content area, with the orange appearing only a few times.
- Icons: lucide, 1.5px stroke, 18px in buttons, 16px inline with text. Icon-only buttons must
  have aria-label. Never put an icon on every list row just to fill space.
- No emoji anywhere in the UI.

COLOR TOKENS — use these exact values, do not invent shades

Primary (dark teal) — the app's CHROME, not its buttons.
primary-900 is near-black and fills the sidebar and top bar; content stays light.
  primary-50   #F5F9FA
  primary-100  #E7F0F3
  primary-200  #CFE2E7
  primary-300  #ABCED9
  primary-400  #7AB9CD
  primary-500  #39A5C6
  primary-600  #1F84A3
  primary-700  #10657F
  primary-800  #07465A
  primary-900  #042630   <- THE BRAND COLOR

Action (orange) — the color that means "you can click this".
action-500 is a LIGHT fill and takes DARK text only. action-950 is the brand brown;
it is the dark anchor of this warm ramp and is the ONLY role it can play, because it
matches primary-900 in brightness exactly (1.00:1) and disappears against it.
  action-50    #FEF7EB
  action-100   #FCEBCF
  action-200   #F9DBA9
  action-300   #F7C36E
  action-400   #FAAA29
  action-500   #E08A00   <- THE ACTION COLOR
  action-600   #B87100
  action-700   #905A04   <- orange as TEXT
  action-800   #694407
  action-900   #452D08
  action-950   #361C0A   <- THE BRAND BROWN

Neutrals (blue-biased grey, hue 191, so they sit with the teal chrome)
  bg-app       #F9FBFB
  bg-surface   #FFFFFF
  border       #D2D9DA
  border-strong #8A9799   <- input borders; must carry 3:1 alone
  neutral-400  #A0ADB0   <- nav labels on the dark sidebar
  neutral-500  #6B7C80   <- THE BRAND NEUTRAL. borders/icons/dots ONLY, never text
  text-muted   #58666A
  text-body    #2D3739
  text-heading #1A2223

Semantic — ONLY for status. Small dots, chips, and text. Never large fills.
The brand palette has no green or red, so these two are added, hue-matched to the
teal and orange. `warning` as TEXT is #905A04 — #E08A00 is never a text color.
  info    #10657F
  success #1F7A4C
  warning #905A04
  danger  #B3261E

CRITICAL CONTRAST RULE — violating this makes the UI unreadable
- #E08A00 has only 2.69:1 contrast against white. NEVER put white text on it.
- Primary button = background #E08A00 with text #042630 (5.89:1), plus a 1px #905A04
  border. It reads as a warm orange button with a near-black label. This is intentional
  and is the app's signature. The border is NOT decorative: the fill alone is 2.69:1
  against the page and the button would have no discernible edge.
  Hover LIGHTENS to #FAAA29 (8.19:1) — do not darken. Darkening passes through a dead
  zone near #B87100 where neither a dark nor a white label reaches 4.5:1.
  Active: #CE7E00 (4.99:1, still a dark label). Focus ring: 2px #905A04 with 2px offset.
- The dark teal #042630 takes WHITE text (15.85:1). It is chrome — sidebar, top bar,
  the darkest headings — not a button fill.
- For orange TEXT use #905A04 (5.75:1). For links and active nav labels on white use
  #10657F (6.58:1). Never #E08A00 and never #6B7C80.
- Destructive button = background #B3261E with white text (6.54:1).
- Secondary button = white background, 1px #8A9799 border, #2D3739 text.
- Ghost button = transparent, #2D3739 text, hover background #E7F0F3.

WHERE THE ACTION COLOR IS ALLOWED
Primary buttons · active nav item (left 2px #E08A00 bar + #07465A background + white
label) · focus rings · selected state · the single highlighted chart series ·
checked checkbox. That is the whole list. It NEVER encodes status — status uses the
semantic colors. Note it is NOT the progress-bar fill: at 2.26:1 against the track the
two halves of the bar stop being separable. Bars fill with #042630.

TYPOGRAPHY
Font: "IBM Plex Sans Thai" for everything (Latin + Thai in one coherent family),
"IBM Plex Mono" for IDs, currency amounts, and any column of numbers.
Load from Google Fonts. Fallback: "Noto Sans Thai", system-ui, sans-serif.

  Page title      24px / 600 / -0.01em / #1A2223
  Section heading 18px / 600 / #1A2223
  Card title      15px / 600 / #1A2223
  Body            14px / 400 / 1.6 / #2D3739
  Secondary       13px / 400 / #58666A
  Label (caps)    11px / 500 / 0.08em letter-spacing / uppercase / #58666A
  Numbers/money   IBM Plex Mono, tabular-nums

STATUS COLORS — task status, fixed mapping
  TODO         #58666A on #F3F6F6
  IN_PROGRESS  #10657F on #E7F0F3
  REVIEW       #905A04 on #FCEBCF
  APPROVED     #1F7A4C on #E6F3EC
  COMPLETED    #07465A on #CFE2E7
Priority: LOW #58666A · MEDIUM #10657F · HIGH #905A04 · CRITICAL #B3261E
Render status as a chip: 6px radius, 11px uppercase label, 2px 8px padding, no border.

DATA FORMATTING RULES
- Money comes from the API as a STRING (Prisma Decimal(14,2)). Never parseFloat it.
  Format with Intl.NumberFormat("th-TH") and display as "฿25,000,000.00".
- Dates: Thai Buddhist era, format "13 ส.ค. 2569". Use date-fns with the th locale.
- Percent: whole number with a % sign. Progress bars are 6px tall, radius 3px,
  track #E8ECED, fill #042630.
- Empty state: a short Thai sentence in #58666A plus one primary action button.
  No illustration, no icon larger than 24px.

LAYOUT
App shell: fixed 240px left sidebar, 56px top bar, content max-width 1280px with
32px horizontal padding. Sidebar collapses to icons under 1024px and becomes a
bottom sheet under 768px. Every screen must work at 375px wide.

ACCESSIBILITY
Visible focus ring on every interactive element. All form inputs have a real <label>.
Color is never the only signal — status chips always carry a text label too.

Reply with only the design system files: a globals.css containing the font import,
an @theme block with these tokens, and the :root shadcn variables mapped onto them
(--primary #E08A00 with --primary-foreground #042630, never white) — plus a Button,
Badge, Card, Input, and StatusChip component. No tailwind.config.js. Do not build
any screens yet.
```

---

# PROMPT 1 — App Shell + Navigation

```
Build the app shell for BuildTrack using the design system above.

Left sidebar (240px, DARK TEAL #042630, 1px right border #07465A):
- Logo block at top: the word "BuildTrack" at 16px/600 in white, with a small
  #E08A00 square (18px, 4px radius) to its left. Height 56px, bottom border.
- Nav items with lucide icons at 18px, labels #A0ADB0 (6.87:1 on the sidebar):
  แดชบอร์ด (LayoutDashboard) · โครงการ (FolderKanban) · งานของฉัน (CircleCheck) ·
  รายงานหน้างาน (ClipboardList) · ปัญหาหน้างาน (TriangleAlert) ·
  ค่าใช้จ่าย (Wallet) · เอกสาร (FileText)
- Admin-only group, separated by a 1px #07465A divider with the label "ผู้ดูแลระบบ"
  in #A0ADB0 — NOT #6B7C80, which is only 3.64:1 here and fails as text:
  ผู้ใช้งาน (Users) · บริษัท (Building2)
- Active item: #07465A background, 2px #E08A00 bar on the left edge, label white.
  The background is only 1.53:1 on the sidebar, so the orange bar is what actually
  marks the active item — do not drop it in favour of a subtler look.
- Bottom: current user block with avatar initials, name, and a role chip.

Top bar (56px, DARK TEAL #042630, 1px bottom border #07465A):
- Left: page title in white, plus breadcrumb when one level deep in #A0ADB0.
- Right: global search input (280px, placeholder "ค้นหาโครงการ งาน หรือเอกสาร"),
  notification bell with an unread count badge, and a user menu.
  The badge is #FF6B6B with a #042630 count — NOT the #B3261E danger color, which
  is only 2.42:1 against the dark bar and would disappear.

ROLE-AWARE NAVIGATION — this is the important part.
Accept a `role` prop of "ADMIN" | "PROJECT_MANAGER" | "STAFF" | "CLIENT".
- STAFF: hide ค่าใช้จ่าย entirely. Hide the admin group.
- CLIENT: hide งานของฉัน, รายงานหน้างาน, ปัญหาหน้างาน. Hide the admin group.
- PROJECT_MANAGER: hide the admin group.
- ADMIN: show everything.
Add a comment in the code stating that hiding nav is cosmetic only and the backend
enforces the real permissions.

Also build: a 403 page ("คุณไม่มีสิทธิ์เข้าถึงหน้านี้") and a 404 page, both minimal —
centered, one line of text, one ghost button back to แดชบอร์ด. No large numbers, no art.
```

---

# PROMPT 2 — Login & Register

```
Build the login and register screens.

Layout: single centered card, 400px wide, on the #F9FBFB app background.
No split-screen hero, no background image, no marketing copy. This is an internal tool.

Login card:
- "BuildTrack" wordmark with the sage square, centered, 32px above the form.
- Heading "เข้าสู่ระบบ" 24px/600.
- Fields: อีเมล (email), รหัสผ่าน (password with a show/hide eye toggle).
- Primary button full width: "เข้าสู่ระบบ" — #E08A00 background, #042630 text.
- Below: "ยังไม่มีบัญชีผู้ใช้?" with a #10657F link "ลงทะเบียน".
- Error state: a 1px #B3261E bordered strip above the form with #FBEAE8 background,
  text "อีเมลหรือรหัสผ่านไม่ถูกต้อง". Do not use a floating toast for this.
- Loading: button shows a spinner and the label "กำลังเข้าสู่ระบบ", inputs disabled.

Register card: same shell, heading "ลงทะเบียน", fields ชื่อ · นามสกุล · อีเมล ·
เบอร์โทรศัพท์ · รหัสผ่าน · ยืนยันรหัสผ่าน. Duplicate email shows an inline field-level
error "อีเมลนี้ถูกใช้งานแล้ว" in #B3261E under the email input, not a toast.

Do NOT render a role picker on the register screen. Role is assigned by an admin.
```

---

# PROMPT 3 — Dashboard

```
Build the dashboard screen.

Row 1 — four KPI cards in a 4-column grid (2 columns under 900px, 1 under 600px).
Each card: white, 1px border, 8px radius, 24px padding.
  - uppercase label 11px #58666A
  - value 28px/600 IBM Plex Mono #1A2223
  - a 13px #58666A line of context underneath
Cards: "โครงการทั้งหมด" (12, "กำลังดำเนินการ 8") · "งานที่เสร็จแล้ว" (1,245) ·
"งานเกินกำหนด" (17, value in #B3261E) · "ปัญหาที่ยังไม่ปิด" (5).
No icons in the KPI cards. No colored backgrounds. No trend arrows.

Row 2 — two charts side by side, equal width, using Recharts.
  a) "งานแยกตามสถานะ" — horizontal bar chart, one bar per task status,
     each bar in that status's color from the design system.
  b) "การใช้งบประมาณ" — vertical bar chart, budget vs actual per project.
     Budget bars #ABCED9, actual bars #042630 (11.84:1 — the two series have to be
     separable). Over-budget bars turn #B3261E.
     Charts are SEQUENTIAL, not categorical: use the teal ladder #042630 · #07465A ·
     #10657F · #1F84A3 · #7AB9CD, with #E08A00 reserved for a single highlighted
     series. Two hue families cannot give five distinguishable categorical colors.
Charts: no gridlines except a faint horizontal #D2D9DA, no legend if the axis
labels already say it, 12px #58666A axis text, tooltip is a white card with a 1px border.

Row 3 — "กิจกรรมล่าสุด": a plain list, 12 rows, each with a 6px status dot,
the actor name in #2D3739 600, the action in #58666A, and a relative timestamp
("2 ชั่วโมงที่แล้ว") right-aligned in #58666A. Rows separated by 1px #D2D9DA,
no cards, no avatars.

ROLE VARIANTS:
- STAFF: hide the budget chart entirely and replace the "งานที่เสร็จแล้ว" card
  with "งานของฉันวันนี้". Never render any currency on this role's dashboard.
- CLIENT: hide "งานเกินกำหนด", keep the budget chart.
```

---

# PROMPT 4 — Projects List & Project Detail

```
Build two screens.

A) PROJECTS LIST
Page header: title "โครงการ" plus a primary button "สร้างโครงการใหม่" on the right
(hidden for STAFF and CLIENT).
Filter row: search input, a status select (ทั้งหมด / วางแผน / กำลังดำเนินการ / พักงาน / เสร็จสิ้น),
and a sort select. All 36px tall, 8px radius.
Table (TanStack Table), columns:
  ชื่อโครงการ (with the location in 13px #58666A underneath) ·
  สถานะ (chip) · ความคืบหน้า (6px progress bar + "72%" in mono) ·
  งบประมาณ (mono, right-aligned) · กำหนดส่ง · a chevron
Rows 56px tall, hover background #F9FBFB, whole row clickable.
Empty state: "ยังไม่มีโครงการ" + primary button.

B) PROJECT DETAIL
Header: project name 24px/600, location and date range in 13px #58666A underneath,
status chip, and an actions menu on the right.
A summary strip directly under the header — four inline stats separated by 1px vertical
dividers, not cards: ความคืบหน้า (with progress bar) · งบประมาณ · ใช้ไปแล้ว · เหลือ.
If spent exceeds budget, the "ใช้ไปแล้ว" number turns #B3261E.
Tabs (underline style, 2px #E08A00 on the active tab, never pill tabs):
  ภาพรวม · งาน · รายงานหน้างาน · ปัญหา · เอกสาร · ค่าใช้จ่าย · ทีมงาน
Hide the ค่าใช้จ่าย tab for STAFF.
Build the ภาพรวม tab content: a 2-column layout with recent tasks on the left
and open issues + team member list on the right.
```

---

# PROMPT 5 — Kanban Board & Task Dialog

```
Build the Kanban board for a project's งาน tab, using dnd-kit for drag and drop.

Five columns: รอดำเนินการ (TODO) · กำลังทำ (IN_PROGRESS) · รอตรวจ (REVIEW) ·
อนุมัติแล้ว (APPROVED) · เสร็จสิ้น (COMPLETED).
Column header: Thai name 13px/600 plus a count in a #F3F6F6 chip. A 2px top border
on each column in that status's color. Column background #F9FBFB, 8px radius.
Columns scroll vertically and the board scrolls horizontally on narrow screens.

Task card (white, 1px border, 8px radius, 14px padding, 8px gap between cards):
  - priority dot (6px) + task name 14px/500 #2D3739
  - 6px progress bar with the percent in 11px mono to its right
  - footer row: assignee initials avatar (24px), due date in 12px #58666A,
    and a comment count with a MessageSquare icon if greater than zero
  - overdue due date renders in #B3261E
Drag state: card gets the overlay shadow and 2deg rotation; the target column
background turns #E7F0F3 with a 1px dashed #E08A00 border.
On drop, call PATCH /tasks/:id/status optimistically and roll the card back to its
original column if the request fails, showing a toast "เปลี่ยนสถานะไม่สำเร็จ".

Task detail dialog (600px, opens on card click):
  task name as the title, status and priority chips, a description block,
  an assignee row, dates, a progress slider (0-100, step 5, with the sage fill),
  an attachments list, and a comment thread at the bottom with a text input.
  Footer: secondary "ปิด" and primary "บันทึก".

PERMISSIONS: for STAFF, cards are draggable only when the assignee is the
current user; other cards get cursor-not-allowed and a tooltip
"แก้ไขได้เฉพาะงานที่มอบหมายให้คุณ". For CLIENT, nothing is draggable, but tasks in
รอตรวจ show an "อนุมัติงาน" primary button inside the dialog.
```

---

# PROMPT 6 — Daily Site Report

```
Build the daily site report screens. This is the app's signature feature — make it feel
fast to fill in on a phone at a construction site.

A) LIST: grouped by date, newest first. Each row shows the report date in Thai,
the reporter's name, a weather icon, the manpower count, and the first line of the
work summary truncated to one line. A right-aligned chevron. No cards — 1px separated rows.
Filter row: project select and a date range picker.

B) FORM (a route, not a dialog — it is too long for a modal):
Fields in a single 640px column:
  - โครงการ (select)
  - วันที่รายงาน (date picker, defaults to today)
  - สภาพอากาศ: a segmented control of four options with lucide icons —
    แจ่มใส (Sun) · มีเมฆ (Cloud) · ฝนตก (CloudRain) · ฝนตกหนัก (CloudLightning).
    Selected segment: #CFE2E7 background, #10657F text, 1px #E08A00 border.
  - จำนวนคนงาน: number input with minus and plus buttons on either side, 48px tall
    so it is usable with gloves on.
  - สรุปงานที่ทำวันนี้: textarea, 5 rows, with a character counter.
  - ปัญหา/อุปสรรค: textarea, 3 rows, optional, labelled "(ถ้ามี)".
  - แนบรูปหน้างาน: a dashed 1px #8A9799 drop zone, 8px radius, that becomes a
    3-column thumbnail grid once files are added. Each thumbnail has a small remove X.
Sticky footer bar with a top border: secondary "ยกเลิก" and primary "ส่งรายงาน".

DUPLICATE HANDLING: if the API returns 409, do not just show an error. Show an inline
strip above the form: "คุณส่งรายงานของวันที่นี้ไปแล้ว" with a #10657F link
"แก้ไขรายงานฉบับเดิม" that navigates to the existing report in edit mode.
```

---

# PROMPT 7 — Issues

```
Build the site issues screens.

LIST: a table with columns ปัญหา (title + a truncated description line),
โครงการ, ความรุนแรง (priority chip), สถานะ (chip: เปิดอยู่ / กำลังตรวจสอบ / แก้ไขแล้ว),
ผู้แจ้ง, ผู้รับผิดชอบ (avatar or "ยังไม่มอบหมาย" in #58666A), and วันที่แจ้ง.
Above the table, three filter chips that toggle: ทั้งหมด · ยังไม่ปิด · ความรุนแรงสูง.
CRITICAL priority rows get a 2px #B3261E left border on the first cell.

DETAIL (a right-side drawer, 480px, not a full page):
  title, status and priority chips, description, reporter and date,
  an assignee select, a status select, and a timeline of status changes at the bottom.
  Footer: primary "บันทึกการเปลี่ยนแปลง".

NEW ISSUE dialog (520px): โครงการ select, งานที่เกี่ยวข้อง select (optional),
หัวข้อปัญหา input, รายละเอียด textarea, ความรุนแรง segmented control, and a photo drop zone.
Under the submit button add a 12px #58666A note: "ระบบจะแจ้งเตือนผู้จัดการโครงการอัตโนมัติ".

CLIENT role never sees these screens at all.
```

---

# PROMPT 8 — Expenses & Budget

```
Build the expenses and budget screen. Currency correctness matters more than styling here.

Top: a budget summary block, full width, white card.
  - Left: "งบประมาณโครงการ" label with the amount in 24px mono.
  - A single 10px tall stacked bar, 5px radius: spent portion in #042630,
    remaining in #E8ECED. If spent exceeds budget, the whole bar turns #B3261E and a
    "เกินงบประมาณ" chip appears next to the label.
  - Below the bar, three inline figures: ใช้ไปแล้ว · คงเหลือ · คิดเป็น XX%
Then a category breakdown: four rows (วัสดุ · ค่าแรง · เครื่องจักร · อื่นๆ), each with a
label, a thin bar showing its share, and the amount in mono, right-aligned.

Expense table: วันที่ · หมวดหมู่ (chip) · รายละเอียด · งานที่เกี่ยวข้อง ·
จำนวนเงิน (mono, right-aligned, tabular-nums) · ผู้บันทึก · a row actions menu.
A totals row pinned at the bottom of the table with a 2px top border.

ADD EXPENSE dialog: โครงการ · งาน (optional) · หมวดหมู่ segmented control ·
รายละเอียด · จำนวนเงิน (a text input, NOT type=number, so decimal precision is never
lost — validate with a regex and send the value to the API as a string) · วันที่ใช้จ่าย.

MONEY RULES — follow these exactly:
- Every amount arrives from the API as a string. Never call parseFloat or Number on it
  for display. Format the string with Intl.NumberFormat("th-TH", {minimumFractionDigits:2}).
- Always render with the ฿ symbol and exactly two decimal places.
- Use font-variant-numeric: tabular-nums on every currency cell so columns align.

ACCESS: this entire route must be unreachable for STAFF — render the 403 page
instead, and add a code comment that the backend also returns 403 on these endpoints.
```

---

# PROMPT 9 — Documents

```
Build the documents screen.

Toolbar: a search input, a docType filter select (แบบก่อสร้าง / สัญญา / BOQ /
รูปถ่าย / รายงาน / อื่นๆ), a grid/list view toggle, and a primary "อัปโหลดเอกสาร" button.

Grid view: cards in a 4-column grid (2 under 900px, 1 under 600px).
  - Image documents show a real thumbnail with object-cover, 4:3 ratio.
  - Non-image documents show a centered file-type icon on a #F9FBFB block, same ratio.
  - Under it: file name 14px/500 truncated to one line, then a 12px #58666A line with
    the docType chip, file size, and upload date.
List view: a table with ชื่อไฟล์ · ประเภท · โครงการ · ขนาด · ผู้อัปโหลด · วันที่ · actions.

UPLOAD dialog: a dashed drop zone that accepts drag-and-drop and click-to-browse,
then a form for โครงการ, งานที่เกี่ยวข้อง (optional), and ประเภทเอกสาร.
Show a per-file progress bar in #042630 during upload. Failed files get a #B3261E
border and a "ลองอีกครั้ง" ghost button.

Delete is only offered to ADMIN, PROJECT_MANAGER, and the original uploader.
Deleting opens a confirm dialog with a destructive #B3261E button.
```

---

# PROMPT 10 — Admin: Users & Companies

```
Build the two admin-only screens.

A) USERS
Header: "ผู้ใช้งาน" + primary button "เพิ่มผู้ใช้".
Filter row: search input and a role filter select.
Table: ชื่อ-นามสกุล (with an initials avatar and the email in 13px #58666A underneath) ·
บทบาท (role chip) · บริษัท · เบอร์โทร · วันที่สร้าง · actions menu.
Role chip colors — these are identity, not status, so use neutral tones with one accent:
  ADMIN #042630 on #F3F6F6 · PROJECT_MANAGER #10657F on #CFE2E7 ·
  STAFF #10657F on #E7F0F3 · CLIENT #58666A on #F3F6F6

ADD/EDIT USER dialog: ชื่อ · นามสกุล · อีเมล · เบอร์โทร · บทบาท (select) ·
บริษัท (select) · รหัสผ่านเริ่มต้น (create mode only).
When the role is changed on an existing user, show a #905A04 inline warning strip:
"ผู้ใช้ต้องออกจากระบบและเข้าสู่ระบบใหม่ สิทธิ์ใหม่จึงจะมีผล"

DELETE: a confirm dialog naming the user. If the current user is the target, disable the
delete action entirely with a tooltip "ไม่สามารถลบบัญชีของตัวเองได้".

B) COMPANIES
A simpler table: ชื่อบริษัท · ประเภท (chip: เจ้าของโครงการ / ผู้รับเหมา / ผู้รับเหมาช่วง) ·
เบอร์ติดต่อ · จำนวนโครงการ · จำนวนผู้ใช้ · actions.
Deleting a company that still has users or projects shows an error dialog listing what
is blocking the delete, not a generic failure toast.
```

---

## PROMPT เสริม — ถ้าอยากได้ภาพ mockup แทนโค้ด

สำหรับ Midjourney / Figma AI / เครื่องมือที่สร้าง **ภาพ** ไม่ใช่โค้ด:

```
Minimal construction project management dashboard UI, web app, light content area.
Dark teal #042630 sidebar and top bar framing a light content area.
Warm orange #e08a00 accent used sparingly, on buttons and the active nav item only,
always with dark near-black labels, never white text on the orange.
Off-white #F9FBFB background, pure white cards with thin 1px light grey borders,
no shadows, no gradients, generous whitespace, 8px rounded corners.
Dark left sidebar navigation, dark top bar, four KPI stat cards with large numbers,
a horizontal bar chart, and a data table with status chips.
IBM Plex Sans typography, Thai and English text. Flat design, calm, professional,
enterprise software aesthetic. Straight-on view, no perspective, no device mockup frame.
--ar 16:10 --style raw
```

---

## เช็กลิสต์หลัง generate เสร็จ

| # | ตรวจอะไร | ผิดตรงไหนบ่อย |
| - | -------- | ------------- |
| 1 | ปุ่ม primary ใช้ตัวหนังสือ **เข้ม** ไม่ใช่สีขาว | AI ชอบใส่ตัวหนังสือขาวบน `#e08a00` แล้วอ่านไม่ออก |
| 1b | Sidebar/top bar เป็น **สีเข้ม** `#042630` ตัวหนังสือขาว | AI ชอบทำ sidebar สีขาวตามค่าเริ่มต้น |
| 2 | จำนวนเงินเป็น string ไม่โดน `parseFloat` | ปัดเศษหายตอนแสดงผล |
| 3 | ช่องกรอกเงินเป็น `type="text"` ไม่ใช่ `type="number"` | `type=number` ทำทศนิยมเพี้ยน |
| 4 | STAFF ไม่เห็นหน้าค่าใช้จ่าย **และ** ไม่เห็นตัวเลขเงินที่ไหนเลย | มักซ่อนแค่เมนู แต่ยังโผล่ใน dashboard |
| 5 | สี accent ไม่ถูกเอาไปใช้บอกสถานะ | AI ชอบเอาสีแบรนด์ไปทำ badge "สำเร็จ" |
| 6 | ใช้งานได้จริงที่จอกว้าง 375px | ตารางมักพังก่อนเพื่อน |
| 7 | ไม่มี emoji และไม่มีภาพประกอบใน empty state | ขัดกับสไตล์ minimal |
| 8 | มี `<label>` จริงทุกช่องกรอก ไม่ใช่ placeholder อย่างเดียว | เข้าถึงไม่ได้ |

> เตือนซ้ำข้อสำคัญที่สุด: **การซ่อนปุ่มใน UI ไม่ใช่การจำกัดสิทธิ์** — สิทธิ์จริงต้องบล็อกที่ backend ทุกกรณี ดูตารางทดสอบใน `WORKFLOWS.md`
