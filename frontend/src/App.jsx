import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TASK_STATUS_META, TASK_STATUS_ORDER } from "@/lib/constants";

/**
 * Scaffold placeholder — Sprint 0.
 *
 * Sprint 2 replaces this whole file with <RouterProvider router={router} />
 * wrapped in a QueryClientProvider. Until then it renders a token check: if the
 * primary button below shows a DARK label on sage and the status chips carry
 * their own colors, the design system is wired correctly.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-background px-8 py-12">
      <div className="mx-auto max-w-[1280px] space-y-8">
        <header className="flex items-center gap-2">
          <span className="size-[18px] rounded-[4px] bg-primary-400" />
          <span className="text-base font-semibold text-heading">
            BuildTrack
          </span>
        </header>

        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em] text-heading">
            โครงสร้างหน้าเว็บพร้อมแล้ว
          </h1>
          <p className="mt-1 text-[13px] text-muted-fg">
            Sprint 0 scaffold · แก้ไข src/routes/index.jsx เพื่อเริ่ม Sprint 2
          </p>
        </div>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-[15px]">ตรวจสอบ design token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button>ปุ่มหลัก</Button>
              <Button variant="outline">ปุ่มรอง</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">ลบ</Button>
            </div>
            <p className="text-[13px] text-muted-fg">
              ปุ่มหลักต้องเป็นพื้นเขียวสาบวกตัวหนังสือ<strong>เข้ม</strong>{" "}
              (#16201D) ไม่ใช่สีขาว
            </p>

            <div className="flex flex-wrap gap-2">
              {TASK_STATUS_ORDER.map((status) => {
                const meta = TASK_STATUS_META[status];
                return (
                  <span
                    key={status}
                    className="rounded-[6px] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em]"
                    style={{ color: meta.fg, backgroundColor: meta.bg }}
                  >
                    {meta.label}
                  </span>
                );
              })}
            </div>

            <div className="font-mono text-[13px] tabular text-body">
              ฿25,000,000.00
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
