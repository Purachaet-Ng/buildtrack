/**
 * The router.
 *
 *   AuthLayout
 *     /login                        public
 *     /register                     public
 *
 *   AppLayout  (all authenticated)
 *     /                             DashboardPage
 *     /projects                     ProjectsPage
 *     /projects/:id                 ProjectDetailPage
 *     /my-tasks                     MyTasksPage          ADMIN PM STAFF
 *     /daily-reports                DailyReportsPage     ADMIN PM STAFF
 *     /daily-reports/new            DailyReportFormPage  ADMIN PM STAFF
 *     /daily-reports/:id/edit       DailyReportFormPage  ADMIN PM STAFF
 *     /issues                       IssuesPage           ADMIN PM STAFF
 *     /expenses                     ExpensesPage         ADMIN PM CLIENT
 *     /documents                    DocumentsPage
 *     /users                        UsersPage            ADMIN
 *     /companies                    CompaniesPage        ADMIN
 *     /403                          ForbiddenPage
 *     *                             NotFoundPage
 *
 * EVERY route in NAV_ITEMS / ADMIN_NAV_ITEMS (lib/constants.js) is registered
 * here, even where the screen is still a Sprint placeholder. A sidebar link
 * that falls through to the 404 route reads as a broken app rather than an
 * unfinished one.
 *
 * The role gates mirror `roles` on those same nav entries — and both are
 * cosmetic. The backend enforces the real permissions on every endpoint; this
 * only buys the user a clean 403 page instead of a screen full of failed
 * requests.
 *
 * The daily report form is a ROUTE, not a dialog — it is too long for a modal
 * and it is filled in on a phone.
 */

import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import { CompaniesPage } from "@/pages/CompaniesPage";
import DailyReportFormPage from "@/pages/DailyReportFormPage";
import DailyReportsPage from "@/pages/DailyReportsPage";
import DashboardPage from "@/pages/DashboardPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import IssuesPage from "@/pages/IssuesPage";
import LoginPage from "@/pages/LoginPage";
import MyTasksPage from "@/pages/MyTasksPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import ProjectsPage from "@/pages/ProjectsPage";
import RegisterPage from "@/pages/RegisterPage";
import { UsersPage } from "@/pages/UsersPage";
import { useAuthStore } from "@/store/auth.store";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

/** The two role sets that gate more than one route each. */
const SITE_ROLES = ["ADMIN", "PROJECT_MANAGER", "STAFF"];
const MONEY_ROLES = ["ADMIN", "PROJECT_MANAGER", "CLIENT"];

const guestRouter = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      { index: true, Component: LoginPage },
      { path: "register", Component: RegisterPage },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);

const userRouter = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "projects", Component: ProjectsPage },
      { path: "projects/:id", Component: ProjectDetailPage },
      { path: "documents", Component: DocumentsPage },

      // STAFF works these screens; CLIENT has no business on any of them.
      {
        element: <ProtectedRoute roles={SITE_ROLES} />,
        children: [
          { path: "my-tasks", Component: MyTasksPage },
          { path: "daily-reports", Component: DailyReportsPage },
          { path: "daily-reports/new", Component: DailyReportFormPage },
          { path: "daily-reports/:id/edit", Component: DailyReportFormPage },
          { path: "issues", Component: IssuesPage },
        ],
      },

      // The exact complement: STAFF must never reach financial data.
      {
        element: <ProtectedRoute roles={MONEY_ROLES} />,
        children: [{ path: "expenses", Component: ExpensesPage }],
      },

      // gate เดียว ครอบทุก route ข้างใน
      {
        element: <ProtectedRoute action="user:manage" />,
        children: [
          { path: "users", Component: UsersPage },
          { path: "companies", Component: CompaniesPage },
        ],
      },

      { path: "403", Component: ForbiddenPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

export function useAppRouter() {
  const token = useAuthStore((state) => state.token);
  return token ? userRouter : guestRouter;
}
