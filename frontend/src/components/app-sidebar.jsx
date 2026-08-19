/**
 * The signed-in sidebar. Nav data comes from NAV_ITEMS / ADMIN_NAV_ITEMS in
 * @/lib/constants, filtered by the current role.
 *
 * That filtering is COSMETIC ONLY — the backend enforces the real permissions
 * on every endpoint, so a user who types /users directly still gets a 403.
 */

import {
  Building2,
  CircleCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  HardHat,
  LayoutDashboard,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ADMIN_NAV_ITEMS, NAV_ITEMS, ROLES } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";

/**
 * NAV_ITEMS carries icon NAMES, not components. Listed one by one on purpose:
 * `import * as Icons from "lucide-react"` would work too, but it defeats
 * tree-shaking and drags the entire icon set into the bundle.
 */
const ICONS = {
  LayoutDashboard,
  FolderKanban,
  CircleCheck,
  ClipboardList,
  TriangleAlert,
  Wallet,
  FileText,
  Users,
  Building2,
};

export function AppSidebar({ ...props }) {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();

  /**
   * "/" has to match exactly. `pathname.startsWith("/")` is true on every route,
   * which would leave แดชบอร์ด lit up permanently.
   */
  const isActive = (to) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const renderItems = (items) =>
    items.map((item) => {
      const Icon = ICONS[item.icon];

      return (
        <SidebarMenuItem key={item.to}>
          {/* tooltip is not decoration: in icon mode the label is hidden and
              this is the only thing identifying the item. */}
          <SidebarMenuButton
            asChild
            isActive={isActive(item.to)}
            tooltip={item.label}
          >
            <NavLink to={item.to}>
              {Icon ? <Icon /> : null}
              <span>{item.label}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  const mainItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <HardHat className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BuildTrack</span>
                  <span className="truncate text-xs">
                    ระบบจัดการงานก่อสร้าง
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === ROLES.ADMIN && (
          <SidebarGroup>
            <SidebarGroupLabel>ผู้ดูแลระบบ</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderItems(ADMIN_NAV_ITEMS)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
