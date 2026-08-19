/**
 * The router. Sprint 2 builds this with createBrowserRouter.
 *
 * Planned tree — roles are the ones ProtectedRoute will enforce:
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
 * The daily report form is a ROUTE, not a dialog — it is too long for a modal
 * and it is filled in on a phone.
 */

import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import ProjectsPage from "@/pages/ProjectsPage";
import RegisterPage from "@/pages/RegisterPage";
import { UsersPage } from "@/pages/UsersPage";
import { useAuthStore } from "@/store/auth.store";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { CompaniesPage } from "@/pages/CompaniesPage";
import ForbiddenPage from "@/pages/ForbiddenPage";

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
