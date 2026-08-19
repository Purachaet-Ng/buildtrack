/**
 * The signed-in shell: 240px left sidebar + 56px top bar + <Outlet />,
 * content max-width 1280px with 32px horizontal padding.
 *
 * RESPONSIVE (PLAN.md §6.1): the sidebar is an off-canvas DRAWER in the base
 * state and becomes permanent from `lg:` up. Build the drawer first —
 * retrofitting it onto a fixed sidebar is worse than writing it now.
 *
 * Nav items come from NAV_ITEMS / ADMIN_NAV_ITEMS in @/lib/constants, filtered
 * by the current role. That filtering is cosmetic; the backend enforces access.
 *
 * CHROME: the sidebar and top bar are DARK TEAL (#042630) against the light
 * content area — use bg-sidebar / text-sidebar-foreground, never a hardcoded
 * hex. Three things here are contrast-critical:
 *
 *   - Inactive nav labels and the "ผู้ดูแลระบบ" divider label use
 *     text-sidebar-muted-foreground (#A0ADB0, 6.87:1). The brand neutral
 *     #6B7C80 is only 3.64:1 on the sidebar and FAILS as text there.
 *   - The active item is a 2px #E08A00 left bar (5.89:1) PLUS the #07465A
 *     background. That background is 1.53:1 on its own, so the orange bar is
 *     the accessible indicator and must not be dropped for a subtler look.
 *   - The notification badge cannot be --destructive: #B3261E is 2.42:1 on the
 *     dark bar. Use #FF6B6B with a #042630 count (5.71:1 both ways).
 *
 * Sprint 2.
 */

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
function AppLayout() {
  // Shell still to build (sidebar + top bar, see above). The Outlet is here so
  // the authenticated routes actually mount in the meantime.
  const logout = useAuthStore((state) => state.logout);
  const menu = [
    { name: "Dashboard", link: "/" },
    { name: "Projects", link: "/project" },
    { name: "Task", link: "/task" },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Outlet />
          </div>
          <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
  //   return (
  //     <div className="flex flex-row">
  //       <div className="w-60 h-screen bg-sidebar text-sidebar-foreground">
  //         <div className="w-full px-6 mb-8 pt-6">
  //           <p className="text-2xl">BuildTrack</p>
  //           <p className="text-[12px]">Contruction Management</p>
  //         </div>
  //         <div className="flex flex-col gap-1 ">
  //           {menu.map((menu) => (
  //             <NavLink className="px-4 py-2 mx-4" to={menu.link}>
  //               {menu.name}
  //             </NavLink>
  //           ))}
  //         </div>
  //         <div>

  //         </div>
  //       </div>
  //       <Button className="" onClick={logout}>
  //         logout
  //       </Button>
  //       <Outlet />
  //     </div>
  //   );
  // }
}
export default AppLayout;
