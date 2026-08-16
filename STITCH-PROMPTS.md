# 🎨 BuildTrack — Stitch Prompt Library

ชุด prompt สำหรับ [Google Stitch](https://stitch.withgoogle.com/) เพื่อสร้าง UI ของ BuildTrack
**Primary color:** `#042630` · **Style:** Minimal · **Data:** ตรงกับ `APIs.md` และ `workflow-diagrams.html`

---

## วิธีใช้

1. **รัน Prompt 00 (Design System) ก่อนเสมอ** — ให้ Stitch ล็อกสไตล์ไว้ใน session
2. จากนั้นค่อยยิงทีละหน้าจอ — **หนึ่ง prompt = หนึ่งหน้าจอ** อย่ารวมหลายหน้าในครั้งเดียว ผลลัพธ์จะเละ
3. แต่ละ prompt มี **[STYLE]** อยู่หัวบล็อกแล้ว copy ทั้งบล็อกไปวางได้เลย
4. ถ้าผลลัพธ์ไม่ตรง ใช้ prompt ซ่อมท้ายไฟล์ (§ Refinement) แทนการเขียนใหม่ทั้งหมด

> Stitch ถนัด prompt ภาษาอังกฤษมากกว่า แต่ตัวหนังสือบน UI เป็นภาษาไทย — prompt ทุกอันเลยเขียนคำสั่งเป็นอังกฤษ แล้วใส่ข้อความไทยที่ต้องการให้แสดงไว้ตรงๆ ในเครื่องหมายคำพูด

---

## Prompt 00 — Design System (รันก่อนหน้าอื่น)

```
Create a design system for "BuildTrack", a construction project management web app used by Thai construction companies. Minimal, professional, information-dense — closer to Linear or Vercel dashboard than to a consumer app. No decorative illustrations, no gradients, no drop shadows beyond a hairline.

COLOR
- Primary / brand: #042630 (deep petrol) — used for the top bar, primary buttons, active nav, headings
- Primary hover: #0A3B49
- Primary tint (backgrounds, selected rows): #E8EDEE
- Page background: #F7F9F9
- Card surface: #FFFFFF
- Border / divider: #D9E1E3 (1px hairline, no shadow)
- Body text: #042630 · Muted text: #6B7C80
- Single accent, used only for attention states: #E08A00 amber

STATUS COLORS (used as small pills with tinted background and dark text, never as large filled blocks)
- TODO: grey #6B7C80 on #EFF2F2
- IN_PROGRESS: blue #1F6FA8 on #E4EFF6
- REVIEW: amber #B87400 on #FBF1DE
- APPROVED: teal #0E6B6B on #E1F0EF
- COMPLETED: green #1E7A5A on #E3F1EB
- Priority CRITICAL / overdue / error: red #B5382F on #FAEAE8

TYPE
- Single sans-serif family that supports Thai — Noto Sans Thai or IBM Plex Sans Thai
- Page title 24px semibold · Section heading 16px semibold · Body 14px regular · Label/caption 12px · Numbers in tables and KPI use tabular figures

LAYOUT
- Desktop web, 1440px wide
- Fixed left sidebar 240px, dark #042630 background, white nav labels, active item has a lighter #0A3B49 block
- Top bar 56px: page title on the left, search field, notification bell with unread count, user avatar with role label
- Content area on #F7F9F9 with 24px padding, cards are white with 1px #D9E1E3 border and 6px radius
- Buttons: 6px radius, primary = filled #042630 with white text, secondary = white with #D9E1E3 border, destructive = white with red text and red border

LANGUAGE
All interface text is Thai. Sidebar navigation reads exactly:
"แดชบอร์ด" · "โครงการ" · "งาน" · "รายงานประจำวัน" · "ปัญหาหน้างาน" · "ค่าใช้จ่าย" · "เอกสาร" · "ผู้ใช้งาน" · "บริษัท"
```

---

# 🔐 หน้า Authentication

## Prompt 01 — หน้าเข้าสู่ระบบ

```
[STYLE] Minimal construction management web app. Primary #042630, background #F7F9F9, white cards, 1px #D9E1E3 borders, no shadows. Thai UI text. Noto Sans Thai.

Design a login screen for "BuildTrack", desktop web 1440x900.

Split layout:
- LEFT 45%: solid #042630 panel. Wordmark "BuildTrack" in white at top left. Centered white heading "ระบบบริหารจัดการโครงการก่อสร้าง" with a one-line subtitle "ติดตามความคืบหน้า งบประมาณ และรายงานหน้างาน ในที่เดียว" in #9FB2B7. A thin white outlined icon of a building crane, small, bottom left. Nothing else — keep this panel almost empty.
- RIGHT 55%: white, centered form card 400px wide, no border needed since background is white.

Form contents, in order:
- Heading "เข้าสู่ระบบ" 24px semibold #042630
- Sub-line "กรอกอีเมลและรหัสผ่านของคุณ" 14px #6B7C80
- Field label "อีเมล" above an input with placeholder "you@company.com"
- Field label "รหัสผ่าน" above a password input with an eye toggle icon on the right
- Right-aligned text link "ลืมรหัสผ่าน?" in #042630
- Full-width primary button "เข้าสู่ระบบ" filled #042630, white text, 44px tall
- Centered footer line: "ยังไม่มีบัญชีผู้ใช้?" in #6B7C80 followed by link "ลงทะเบียน" in #042630 semibold

Below the password field show an inline error state: a red #B5382F 12px message "อีเมลหรือรหัสผ่านไม่ถูกต้อง" with the password input border in red.

No social login buttons. No illustration on the right side.
```

## Prompt 02 — หน้าลงทะเบียน

```
[STYLE] Same as login: minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI text.

Design a registration screen for BuildTrack, desktop web 1440x900. Same split layout as the login screen — left 45% solid #042630 panel with the wordmark, right 55% white with a centered form 440px wide.

Form:
- Heading "ลงทะเบียนผู้ใช้ใหม่"
- Two fields side by side: "ชื่อ" and "นามสกุล"
- "อีเมล" full width
- "เบอร์โทรศัพท์" full width, placeholder "08X-XXX-XXXX"
- "รหัสผ่าน" full width with a helper line below in #6B7C80: "อย่างน้อย 8 ตัวอักษร"
- "บริษัท" as a select, placeholder "เลือกบริษัท", with example options "บจก. สยามคอนสตรัคชั่น" and "บจก. บางกอกพร็อพเพอร์ตี้"
- Full-width primary button "ยืนยันลงทะเบียน"
- Centered footer: "มีบัญชีอยู่แล้ว?" + link "เข้าสู่ระบบ"

Show a red inline error under the email field: "อีเมลนี้ถูกใช้งานแล้ว"

Do not include a role selector — roles are assigned by an administrator.
```

---

# 📊 หน้าหลักของผู้ใช้

## Prompt 03 — แดชบอร์ด

```
[STYLE] Minimal construction PM dashboard. Primary #042630, page background #F7F9F9, white cards with 1px #D9E1E3 border and 6px radius, no shadows. Thai UI. Tabular numbers.

Design the main dashboard for BuildTrack, desktop web 1440x900, with the fixed 240px #042630 sidebar and 56px top bar.

Sidebar nav items: "แดชบอร์ด" (active), "โครงการ", "งาน", "รายงานประจำวัน", "ปัญหาหน้างาน", "ค่าใช้จ่าย", "เอกสาร". Bottom of sidebar shows the user: avatar, "ปุรเชษฐ์ ง.", and a small label "ผู้จัดการโครงการ".

Top bar: title "แดชบอร์ด", a search input with placeholder "ค้นหาโครงการ งาน หรือเอกสาร", a bell icon with a red badge "3", and the user avatar.

Content:
1. Row of 4 KPI cards, equal width. Each has a 12px muted label, a 32px semibold number, and a small caption:
   - "โครงการทั้งหมด" / "12" / "กำลังดำเนินการ 8 · เสร็จแล้ว 4"
   - "งานที่เสร็จแล้ว" / "1,245" / "จากทั้งหมด 1,532 งาน"
   - "งานเกินกำหนด" / "17" / caption in red "ต้องติดตามด่วน"
   - "ใช้งบไปแล้ว" / "62%" / "15.5 ล้าน จาก 25 ล้านบาท"

2. Two charts side by side, equal width, in white cards:
   - Left, card title "งานแยกตามสถานะ": a horizontal bar chart with 5 bars labelled "รอเริ่ม 122", "กำลังทำ 88", "รอตรวจ 24", "อนุมัติแล้ว 53", "เสร็จแล้ว 1245" using the status colors
   - Right, card title "การใช้งบประมาณรายเดือน": a simple line chart, 6 points labelled ม.ค. to มิ.ย., single line in #042630, faint horizontal gridlines, no legend

3. Full-width card, title "กิจกรรมล่าสุด" with a right-aligned "ดูทั้งหมด" link. A list of 5 rows, each with a small circular avatar, a line of Thai text, and a right-aligned relative time in #6B7C80:
   - "สมชาย อัปเดตความคืบหน้างาน ติดตั้งเสาเข็มโซน A เป็น 60%" · "5 นาทีที่แล้ว"
   - "วิภา แจ้งปัญหา รถส่งคอนกรีตมาช้า ในโครงการ Bangkok Condominium" · "1 ชม.ที่แล้ว"
   - "ปุรเชษฐ์ อนุมัติงาน ติดตั้งคานเหล็กชั้น 3" · "3 ชม.ที่แล้ว"
   - "อนุชา ส่งรายงานประจำวัน 13 ส.ค. 2569" · "เมื่อวาน"
   - "ธนากร อัปโหลดเอกสาร แบบโครงสร้างชั้น 4.pdf" · "เมื่อวาน"

Keep everything on one screen without scrolling. No gradients, no icons inside the KPI cards.
```

## Prompt 04 — รายการโครงการ

```
[STYLE] Minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI, tabular numbers.

Design the projects list page for BuildTrack, desktop web 1440x900, with the standard sidebar and top bar. Page title "โครงการ".

Header row: title on the left, primary button "+ สร้างโครงการ" on the right.

Filter bar in a white card: a search input "ค้นหาโครงการ", a select "สถานะทั้งหมด", a select "บริษัทลูกค้าทั้งหมด", and on the right a segmented toggle with two options "ตาราง" and "การ์ด" with "ตาราง" selected.

Main data table in a white card. Columns: "ชื่อโครงการ", "ลูกค้า", "สถานะ", "ความคืบหน้า", "งบประมาณ", "กำหนดเสร็จ", and an actions column with a three-dot menu.

The progress column shows a thin 6px progress bar in #042630 on an #E8EDEE track with the percentage to its right.

Six rows of realistic Thai construction data:
- "Bangkok Condominium" · "บจก. บางกอกพร็อพเพอร์ตี้" · pill "กำลังดำเนินการ" blue · 72% · "25,000,000" · "30 มิ.ย. 2570"
- "โรงงานประกอบชิ้นส่วน ระยอง" · "บจก. อีสเทิร์นอินดัสทรี" · pill "กำลังดำเนินการ" blue · 45% · "68,500,000" · "15 ธ.ค. 2569"
- "อาคารสำนักงาน 8 ชั้น พระราม 9" · "บจก. เอ็มเอสพร็อพเพอร์ตี้" · pill "รอเริ่ม" grey · 0% · "120,000,000" · "01 มี.ค. 2571"
- "ปรับปรุงโรงพยาบาลศรีสะเกษ" · "โรงพยาบาลศรีสะเกษ" · pill "หยุดชั่วคราว" amber · 30% · "8,900,000" · "20 ต.ค. 2569"
- "บ้านพักอาศัย 2 ชั้น เชียงใหม่" · "คุณสมหญิง" · pill "เสร็จแล้ว" green · 100% · "4,200,000" · "10 พ.ค. 2569"
- "คลังสินค้า บางนา กม.19" · "บจก. โลจิสติกส์พลัส" · pill "กำลังดำเนินการ" blue · 88% · "32,000,000" · "28 ก.ย. 2569"

Show the row for "ปรับปรุงโรงพยาบาลศรีสะเกษ" with its budget figure in red and a small red warning dot, indicating it is over budget.

Footer of the card: "แสดง 1-6 จาก 12 รายการ" on the left, pagination on the right.
```

## Prompt 05 — รายละเอียดโครงการ

```
[STYLE] Minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI.

Design the project detail page for BuildTrack, desktop web 1440x900, standard sidebar and top bar.

Breadcrumb: "โครงการ / Bangkok Condominium".

Page header card (white): project name "Bangkok Condominium" 24px semibold, below it a muted line "สุขุมวิท 71 กรุงเทพฯ · บจก. บางกอกพร็อพเพอร์ตี้ · 01 ก.ย. 2569 – 30 มิ.ย. 2570". A blue "กำลังดำเนินการ" status pill next to the name. On the right: secondary button "แก้ไข" and a three-dot menu.

Inside the same header card, a row of 5 compact KPI blocks separated by thin vertical dividers:
- "ความคืบหน้า" 72% with a thin progress bar underneath
- "เหลืออีก" "85 วัน"
- "งบประมาณ" "25,000,000"
- "ใช้ไปแล้ว" "15,500,000" with a small "62%" caption
- "ปัญหาค้าง" "3" in amber

Tab bar below the header, underline style, active tab in #042630 with a 2px underline: "ภาพรวม" (active) · "งาน" · "ทีมงาน" · "รายงานประจำวัน" · "ปัญหา" · "ค่าใช้จ่าย" · "เอกสาร"

Overview tab content, two columns:
- LEFT 65%: card "งบประมาณ vs ค่าใช้จ่ายจริง" containing a horizontal stacked bar showing spent 15.5M in #042630 against a remaining 9.5M in #E8EDEE, with a legend line "ใช้ไปแล้ว 15,500,000 · คงเหลือ 9,500,000". Below it a card "งานล่าสุด" listing 5 task rows, each with task name, assignee avatar and name, a status pill, and a due date.
- RIGHT 35%: card "ทีมงาน" with 6 members — avatar, name, and role label ("ผู้จัดการโครงการ", "วิศวกรหน้างาน"), plus a "+ เพิ่มทีมงาน" text button. Below it a card "ปัญหาที่ยังไม่แก้ไข" with 3 items, each a title, a red or amber priority pill, and the reporter name.
```

## Prompt 06 — กระดาน Kanban

```
[STYLE] Minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI.

Design a Kanban task board for BuildTrack, desktop web 1440x900, standard sidebar and top bar. Page title "งาน — Bangkok Condominium".

Toolbar above the board: a search input "ค้นหางาน", selects "ผู้รับผิดชอบทั้งหมด" and "ความสำคัญทั้งหมด", and a primary button "+ สร้างงาน" on the right.

Five equal-width columns filling the width, each column has a header row with the column name, a grey count chip, and a faint column background #EFF2F2 with 6px radius:
"รอเริ่ม 4" · "กำลังทำ 3" · "รอตรวจ 2" · "อนุมัติแล้ว 2" · "เสร็จแล้ว 5"

Task cards are white with a 1px #D9E1E3 border, 6px radius, 12px padding, and contain in this order:
- A 4px colored left edge indicating priority (red for CRITICAL, amber for HIGH, grey for MEDIUM)
- Task name, 14px medium, up to two lines
- A thin progress bar with the percentage on the right
- A bottom row: assignee avatar with first name, a small calendar icon with the due date, and a comment icon with a count

Realistic Thai task names across the columns:
- รอเริ่ม: "ติดตั้งระบบไฟฟ้าชั้น 5", "เทพื้นชั้น 4", "ติดตั้งกระจกด้านทิศใต้", "ทดสอบระบบดับเพลิง"
- กำลังทำ: "ติดตั้งคานเหล็กชั้น 3" 40%, "งานผนังก่ออิฐชั้น 2" 75%, "เดินท่อประปาชั้น 1" 20%
- รอตรวจ: "ติดตั้งเสาเข็มโซน A" 100%, "งานฐานรากโซน B" 100%
- อนุมัติแล้ว: "ปรับพื้นที่และล้อมรั้ว" , "งานสำรวจพื้นที่"
- เสร็จแล้ว: show 3 cards and a "+ ดูอีก 2 งาน" text link

Show one card in the middle of "กำลังทำ" being dragged: slightly lifted, and a dashed #042630 outline drop placeholder in the "รอตรวจ" column.
```

## Prompt 07 — รายละเอียดงาน (Drawer)

```
[STYLE] Minimal, primary #042630, white surface, 1px #D9E1E3 borders, Thai UI.

Design a right-side slide-over drawer showing task detail in BuildTrack, 560px wide, over a dimmed Kanban board background. Desktop web 1440x900.

Drawer header: breadcrumb "Bangkok Condominium / งานโครงสร้าง", task name "ติดตั้งคานเหล็กชั้น 3" 20px semibold, a close X on the right.

Below the header, a row of controls: a status select showing "กำลังทำ" with the blue status color, a priority pill "สูง" in amber, and an assignee chip with avatar "สมชาย ก."

A "ความคืบหน้า" section: a large 40% figure, a slider control with the filled portion in #042630, and helper text "ลากเพื่ออัปเดตเปอร์เซ็นต์" in #6B7C80.

A detail grid, two columns, label above value, labels in 12px #6B7C80:
"วันเริ่ม" 01 ส.ค. 2569 · "กำหนดเสร็จ" 25 ส.ค. 2569 · "งานหลัก" งานโครงสร้างชั้น 3 · "ผู้สร้างงาน" ปุรเชษฐ์ ง.

A "รายละเอียด" paragraph in Thai about installing steel beams on floor 3 including checking bolt torque.

An "ไฟล์แนบ" section: 3 thumbnail chips — two photos and one PDF named "แบบคานเหล็ก-ชั้น3.pdf", plus a dashed "+ แนบไฟล์" tile.

A "ความคิดเห็น" section at the bottom: 3 comments, each with avatar, name, relative time, and Thai text. Example first comment from "ปุรเชษฐ์ ง." reading "ตรวจแรงขันน็อตอีกครั้งก่อนส่งตรวจนะครับ". Below them a comment input with placeholder "เขียนความคิดเห็น..." and a primary "ส่ง" button.

Sticky footer inside the drawer: secondary button "ตีกลับแก้ไข" and primary button "ส่งตรวจ".
```

## Prompt 08 — รายงานประจำวัน (ฟอร์ม, มือถือ)

```
[STYLE] Minimal, primary #042630, background #F7F9F9, white cards, 1px #D9E1E3 borders, Thai UI, Noto Sans Thai.

Design a MOBILE screen, 390x844, for a site engineer submitting a daily site report in BuildTrack. This is used outdoors on a phone, so touch targets are at least 48px and the type is generous.

Top app bar in #042630 with a white back arrow, white title "รายงานประจำวัน", and a white text button "บันทึก" on the right.

Below it a fixed context strip on #E8EDEE: project name "Bangkok Condominium" and the date "13 สิงหาคม 2569" with a small calendar icon.

Scrolling form on #F7F9F9, each group in its own white card:
1. "สภาพอากาศ" — a row of 4 large selectable chips with icons and labels: "แดดจัด" (selected, filled #042630 with white text), "มีเมฆ", "ฝนตก", "ฝนตกหนัก"
2. "จำนวนคนงาน" — a stepper: a minus button, a large centered number "35", a plus button
3. "สรุปงานที่ทำวันนี้" — a multiline textarea, 4 rows, filled with "ติดตั้งเสาชั้น 3 เสร็จ 8 ต้น ตรวจแนวดิ่งและระดับเรียบร้อย" and a character counter "68/500" bottom right
4. "ปัญหา / อุปสรรค" — a multiline textarea with placeholder "ถ้าไม่มี ปล่อยว่างไว้ได้", filled with "รถส่งคอนกรีตมาช้า 2 ชั่วโมง"
5. "รูปภาพหน้างาน" — a horizontal row of 3 photo thumbnails with small X remove buttons, followed by a dashed square tile with a camera icon and the label "เพิ่มรูป"

Fixed bottom bar, white with a top border: full-width primary button "ส่งรายงาน" 52px tall.

Do not include a bottom tab navigation bar on this screen.
```

## Prompt 09 — ปัญหาหน้างาน

```
[STYLE] Minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI.

Design the site issues page for BuildTrack, desktop web 1440x900, standard sidebar and top bar. Page title "ปัญหาหน้างาน".

Header: title on the left with a muted subtitle "3 ปัญหายังไม่ได้แก้ไข", primary button "+ แจ้งปัญหา" on the right.

Filter row: selects "ทุกโครงการ", "ทุกสถานะ", "ทุกความสำคัญ", and a search input.

Three summary tiles above the list, compact and inline: "เปิดอยู่ 5" with a red dot, "กำลังตรวจสอบ 2" with an amber dot, "แก้ไขแล้ว 31" with a green dot.

A list of issue cards, not a table — each card is white, full width, with a 4px left edge in the priority color, and contains:
- Row 1: issue title 16px medium on the left, a status pill on the right
- Row 2, muted 13px: project name · reporter name · relative time
- Row 3: an assignee chip with avatar, and a priority pill

Five issues:
- "รถส่งคอนกรีตมาช้ากว่ากำหนด 2 ชั่วโมง" · red left edge · pill "เปิดอยู่" red · "Bangkok Condominium · แจ้งโดย วิภา ส. · 1 ชม.ที่แล้ว" · assignee "ยังไม่มอบหมาย" shown as a dashed chip · priority "วิกฤต"
- "พบรอยร้าวที่ผนังชั้น 2 โซน B" · red left edge · pill "กำลังตรวจสอบ" amber · "Bangkok Condominium · แจ้งโดย สมชาย ก. · เมื่อวาน" · assignee "ปุรเชษฐ์ ง." · priority "วิกฤต"
- "วัสดุกันซึมส่งมาไม่ครบจำนวน" · amber left edge · pill "เปิดอยู่" red · "คลังสินค้า บางนา · แจ้งโดย อนุชา ท. · 2 วันที่แล้ว" · priority "สูง"
- "ไฟฟ้าชั่วคราวหน้างานดับเป็นช่วงๆ" · amber left edge · pill "กำลังตรวจสอบ" amber · priority "สูง"
- "ทางเข้าไซต์ลื่นหลังฝนตก" · grey left edge · pill "แก้ไขแล้ว" green · priority "ปานกลาง" · show this card slightly faded

Keep the cards visually calm — the only saturated color is the left edge and the pills.
```

## Prompt 10 — ค่าใช้จ่ายและงบประมาณ

```
[STYLE] Minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI, tabular numbers, right-aligned currency.

Design the budget and expenses page for BuildTrack, desktop web 1440x900, standard sidebar and top bar. Page title "ค่าใช้จ่าย — Bangkok Condominium".

Top section, a white card titled "งบประมาณ vs ค่าใช้จ่ายจริง":
- A large horizontal bar, 32px tall: the spent portion 62% filled #042630, the remainder #E8EDEE, with a thin vertical marker line at 100%
- Three figures below the bar in a row, each with a 12px muted label above a 22px semibold number: "งบประมาณ 25,000,000", "ใช้ไปแล้ว 15,500,000", "คงเหลือ 9,500,000"

Second row, two cards side by side:
- LEFT "ค่าใช้จ่ายแยกตามหมวด": a donut chart with 4 segments in shades of the primary — "วัสดุ 8,200,000", "ค่าแรง 5,100,000", "เครื่องจักร 1,600,000", "อื่นๆ 600,000" — with the legend as a vertical list beside the donut showing the amount and percentage for each
- RIGHT "ค่าใช้จ่ายรายเดือน": a vertical bar chart, 6 bars labelled ม.ค. to มิ.ย., bars in #042630, faint gridlines

Third section, a white card with a header row: title "รายการค่าใช้จ่าย", a date range control showing "01 ส.ค. 2569 – 31 ส.ค. 2569", a select "ทุกหมวด", and a primary button "+ บันทึกค่าใช้จ่าย".

Table columns: "วันที่", "หมวด", "รายละเอียด", "งานที่เกี่ยวข้อง", "ผู้บันทึก", "จำนวนเงิน" right-aligned, and an actions column.

Six rows:
- "12 ส.ค. 2569" · pill "วัสดุ" · "เหล็กเส้น DB16 จำนวน 200 เส้น" · "ติดตั้งคานเหล็กชั้น 3" · "ปุรเชษฐ์ ง." · "185,000.50"
- "11 ส.ค. 2569" · pill "ค่าแรง" · "ค่าแรงทีมโครงสร้าง สัปดาห์ที่ 32" · "-" · "ปุรเชษฐ์ ง." · "420,000.00"
- "10 ส.ค. 2569" · pill "เครื่องจักร" · "ค่าเช่าเครนหอสูง 1 เดือน" · "-" · "สุภาพร ม." · "150,000.00"
- "08 ส.ค. 2569" · pill "วัสดุ" · "คอนกรีตผสมเสร็จ 240 ksc จำนวน 45 คิว" · "เทพื้นชั้น 4" · "ปุรเชษฐ์ ง." · "112,500.00"
- "05 ส.ค. 2569" · pill "อื่นๆ" · "ค่าน้ำค่าไฟหน้างาน เดือน ก.ค." · "-" · "สุภาพร ม." · "38,400.00"
- "03 ส.ค. 2569" · pill "วัสดุ" · "อิฐมวลเบา 3,000 ก้อน" · "งานผนังก่ออิฐชั้น 2" · "ปุรเชษฐ์ ง." · "96,000.00"

Table footer shows a bold total row: "รวมเดือนนี้" and "1,001,900.50" right-aligned.
```

## Prompt 11 — พอร์ทัลลูกค้า

```
[STYLE] Minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI. Calmer and more spacious than the internal pages — this is for a client, not a daily operator.

Design the client portal project view for BuildTrack, desktop web 1440x900. The sidebar is reduced to only four items: "โครงการของฉัน" (active), "เอกสาร", "งบประมาณ", "การแจ้งเตือน". No create buttons anywhere on this screen.

Header card: project name "Bangkok Condominium", muted line "สุขุมวิท 71 กรุงเทพฯ · กำหนดเสร็จ 30 มิ.ย. 2570", and a large right-aligned block showing "72%" 40px semibold with the caption "ความคืบหน้าโครงการ" and a thin progress bar underneath.

Row of three read-only summary cards:
- "เหลืออีก" "85 วัน"
- "งานที่เสร็จแล้ว" "31 จาก 48"
- "ใช้งบไปแล้ว" "62%" with the caption "15.5 ล้าน จาก 25 ล้านบาท"

A white card "งานที่รอการอนุมัติจากคุณ" containing two rows. Each row has the task name, the engineer's name and completion date, three small photo thumbnails, and two buttons on the right: a primary "อนุมัติ" and a secondary "ขอให้แก้ไข".
- "ติดตั้งเสาเข็มโซน A" · "โดย สมชาย ก. · เสร็จเมื่อ 12 ส.ค. 2569"
- "งานฐานรากโซน B" · "โดย อนุชา ท. · เสร็จเมื่อ 11 ส.ค. 2569"

Below, two cards side by side:
- "ความคืบหน้าล่าสุด": a vertical timeline with 4 entries, each with a date, a short Thai description, and a small thumbnail
- "เอกสารล่าสุด": a list of 5 files with file-type icons, Thai names like "แบบโครงสร้างชั้น 4.pdf" and "รายงานความคืบหน้า ก.ค. 2569.pdf", upload dates, and a download icon on each row

Do not show any edit, delete, or create controls.
```

---

# 🛠️ หน้าผู้ดูแลระบบ

## Prompt 12 — จัดการผู้ใช้งาน

```
[STYLE] Minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI.

Design the admin user management page for BuildTrack, desktop web 1440x900, standard sidebar and top bar. The sidebar for this admin role additionally shows "ผู้ใช้งาน" (active) and "บริษัท" in a separate group below a thin divider labelled "ผู้ดูแลระบบ".

Page title "ผู้ใช้งาน" with a muted subtitle "24 บัญชีในระบบ", and a primary button "+ เพิ่มผู้ใช้" on the right.

Filter row: a search input "ค้นหาชื่อหรืออีเมล", a select "ทุกตำแหน่ง", a select "ทุกบริษัท".

A data table in a white card. Columns: a checkbox, "ผู้ใช้งาน" (avatar with name stacked above the email in muted text), "ตำแหน่ง", "บริษัท", "เบอร์โทร", "เข้าใช้ล่าสุด", and an actions column with edit and delete icons.

Role pills, each in a distinct tint but all low-saturation:
- "ผู้ดูแลระบบ" dark #042630 on #E8EDEE
- "ผู้จัดการโครงการ" blue
- "วิศวกรหน้างาน" amber
- "ลูกค้า" green

Seven rows:
- "ปุรเชษฐ์ ง." / "purachaet@buildtrack.co.th" · ผู้ดูแลระบบ · "บจก. สยามคอนสตรัคชั่น" · "081-234-5678" · "5 นาทีที่แล้ว"
- "สุภาพร ม." / "supaporn@buildtrack.co.th" · ผู้จัดการโครงการ · "บจก. สยามคอนสตรัคชั่น" · "089-111-2233" · "2 ชม.ที่แล้ว"
- "สมชาย ก." / "somchai@buildtrack.co.th" · วิศวกรหน้างาน · "บจก. สยามคอนสตรัคชั่น" · "086-555-7788" · "1 ชม.ที่แล้ว"
- "อนุชา ท." / "anucha@buildtrack.co.th" · วิศวกรหน้างาน · "บจก. สยามคอนสตรัคชั่น" · "092-333-4455" · "เมื่อวาน"
- "วิภา ส." / "wipa@buildtrack.co.th" · วิศวกรหน้างาน · "บจก. เหนือการช่าง" · "084-777-1122" · "3 ชม.ที่แล้ว"
- "ธนากร พ." / "thanakorn@bkkprop.co.th" · ลูกค้า · "บจก. บางกอกพร็อพเพอร์ตี้" · "081-999-0011" · "3 วันที่แล้ว"
- "สมหญิง ร." / "somying@eastern.co.th" · ลูกค้า · "บจก. อีสเทิร์นอินดัสทรี" · "087-222-3344" · "ยังไม่เคยเข้าใช้" shown in muted text

Show the row for "อนุชา ท." in a selected state with the #E8EDEE tint background.

Card footer: "แสดง 1-7 จาก 24 รายการ" and pagination.
```

## Prompt 13 — เพิ่ม/แก้ไขผู้ใช้ (Modal)

```
[STYLE] Minimal, primary #042630, white surface, 1px #D9E1E3 borders, Thai UI.

Design a centered modal dialog for adding a user in BuildTrack, 560px wide, over a dimmed user list. Desktop web 1440x900.

Modal header: title "เพิ่มผู้ใช้ใหม่" with a close X, separated from the body by a 1px divider.

Body, comfortable 24px padding:
- Two fields side by side: "ชื่อ" and "นามสกุล"
- "อีเมล" full width with helper text "ใช้อีเมลนี้สำหรับเข้าสู่ระบบ"
- "เบอร์โทรศัพท์" full width
- "ตำแหน่ง" as a set of 4 stacked radio cards, each a bordered row with the role name in medium weight and a muted one-line description underneath, the selected one bordered #042630 with a filled radio:
  - "ผู้ดูแลระบบ" / "จัดการผู้ใช้ บริษัท และทุกโครงการในระบบ"
  - "ผู้จัดการโครงการ" / "สร้างโครงการ มอบหมายงาน และดูข้อมูลการเงิน" (selected)
  - "วิศวกรหน้างาน" / "อัปเดตงานของตัวเอง ส่งรายงานและแจ้งปัญหา"
  - "ลูกค้า" / "ดูความคืบหน้า อนุมัติงาน และแสดงความคิดเห็น"
- "บริษัท" select with placeholder "เลือกบริษัท"
- A checkbox row: "ส่งอีเมลตั้งรหัสผ่านให้ผู้ใช้" checked

Modal footer with a top divider, buttons right-aligned: secondary "ยกเลิก" and primary "เพิ่มผู้ใช้".
```

## Prompt 14 — จัดการบริษัท

```
[STYLE] Minimal, primary #042630, #F7F9F9 background, white cards, 1px #D9E1E3 borders, Thai UI.

Design the admin companies page for BuildTrack, desktop web 1440x900, standard sidebar and top bar. Page title "บริษัท", primary button "+ เพิ่มบริษัท".

Above the list, three tabs in pill style: "ทั้งหมด 9" (active), "เจ้าของโครงการ 4", "ผู้รับเหมา 5".

A grid of company cards, three per row, each white with a 1px border and 20px padding:
- A 40px square logo placeholder with rounded corners showing the company initials on an #E8EDEE background with #042630 text
- Company name 16px medium
- A type pill: "เจ้าของโครงการ" in teal tint or "ผู้รับเหมา" in blue tint
- Two muted metadata lines: a contact person with a phone number, and an address
- A thin divider, then a footer row with two small stats: "โครงการ 3" and "ผู้ใช้งาน 8", plus a three-dot menu on the right

Six companies:
- "บจก. สยามคอนสตรัคชั่น" · ผู้รับเหมา · "คุณวีระ ชูสกุล · 02-311-4455" · "เขตยานนาวา กรุงเทพฯ" · โครงการ 6 · ผู้ใช้งาน 14
- "บจก. บางกอกพร็อพเพอร์ตี้" · เจ้าของโครงการ · "คุณธนากร พงษ์ไพศาล · 02-655-8899" · "เขตวัฒนา กรุงเทพฯ" · โครงการ 2 · ผู้ใช้งาน 3
- "บจก. อีสเทิร์นอินดัสทรี" · เจ้าของโครงการ · "คุณสมหญิง รัตนกุล · 038-777-1200" · "นิคมอุตสาหกรรมมาบตาพุด ระยอง" · โครงการ 1 · ผู้ใช้งาน 2
- "บจก. เหนือการช่าง" · ผู้รับเหมา · "คุณนพดล อินทร์ใจ · 053-224-8080" · "อ.เมือง เชียงใหม่" · โครงการ 2 · ผู้ใช้งาน 5
- "บจก. โลจิสติกส์พลัส" · เจ้าของโครงการ · "คุณพิมพ์ใจ วรกุล · 02-744-6600" · "บางนา กรุงเทพฯ" · โครงการ 1 · ผู้ใช้งาน 2
- "หจก. ศรีสะเกษก่อสร้าง" · ผู้รับเหมา · "คุณบุญมี ศรีทอง · 045-611-3030" · "อ.เมือง ศรีสะเกษ" · โครงการ 1 · ผู้ใช้งาน 4
```

---

# 🔁 Refinement Prompts

ใช้ต่อจากผลลัพธ์ที่ Stitch สร้างมาแล้ว ไม่ต้องเขียนใหม่ทั้งหน้า

| ปัญหาที่เจอบ่อย | Prompt ซ่อม |
| --------------- | ----------- |
| สีเพี้ยนจาก #042630 | `Replace every blue and teal in this design with exactly #042630. The only other saturated colors allowed are the status pill colors.` |
| ใส่เงา/ไล่เฉดมาเยอะ | `Remove all drop shadows and gradients. Use flat white surfaces with a 1px #D9E1E3 border and 6px radius instead.` |
| ตัวหนังสือกลายเป็นภาษาอังกฤษ | `Keep the layout exactly as is but translate every label, button, and column header into Thai. Do not change any spacing or component.` |
| การ์ดโล่งเกินไป | `Increase information density: reduce card padding to 16px, row height to 44px, and body text to 14px. Fit more rows on screen without scrolling.` |
| ปุ่มเยอะเกิน | `Keep only one primary filled button per screen. Convert all other buttons to secondary outline or plain text links.` |
| ไอคอนรก | `Use a single thin line icon set at 20px, stroke 1.5px, in #6B7C80. Remove decorative icons that do not carry meaning.` |
| อยากได้จอมือถือ | `Redesign this same screen for mobile at 390x844. Collapse the table into stacked cards, move the primary action to a fixed bottom bar, and keep all Thai text identical.` |
| อยากได้ empty state | `Show this screen in its empty state: no data rows, a centered thin-line icon, a Thai heading, one muted explanatory line, and a single primary button.` |

---

# 📌 หมายเหตุ

- **สีที่ส่งมาคือ `##042630`** — อ่านเป็น `#042630` (petrol เข้มมาก) ใช้เป็นสีแบรนด์และสีปุ่มหลักได้ดี แต่**ใช้เป็นสีตัวอักษรบนพื้นเข้มไม่ได้** จึงกำหนดให้ sidebar เป็น #042630 แล้วตัวอักษรเป็นขาว
- ค่าตัวเลขและชื่อทุกอย่างใน prompt ตรงกับตัวอย่างใน `APIs.md` (เช่น งบ 25,000,000 · ใช้ไป 62% · เหล็กเส้น DB16 185,000.50) เอาไปทำ seed data ต่อได้เลย
- สิทธิ์การเห็นข้อมูลอ้างจาก `workflow-diagrams.html` — Prompt 11 (พอร์ทัลลูกค้า) ไม่มีปุ่มสร้าง/แก้ไข และ**ไม่มีหน้าค่าใช้จ่ายสำหรับวิศวกรหน้างาน** ตามกฎที่ backend บล็อกไว้
- Stitch มีโควตาการสร้างต่อเดือน ให้ไล่ทำตามลำดับความสำคัญ: 01 → 03 → 06 → 04 → 05 → ที่เหลือ
