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
import { DashboardPage } from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import RegisterPage from "@/pages/RegisterPage";
import { UsersPage } from "@/pages/UsersPage";
import { useAuthStore } from "@/store/auth.store";
import { createBrowserRouter } from "react-router-dom";

const guestRouter = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      { index: true, Component: LoginPage },
      { path: "register", Component: RegisterPage },
    ],
  },
]);

const userRouter = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "projects", Component: ProjectsPage },
      { path: "users", Component: UsersPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

/**
 * Which tree is live depends on the auth store, so it has to be read during
 * render — a module-level `const router = guestRouter` never re-evaluates, and
 * logging in would set the token with nothing on screen changing.
 *
 * This doubles as the 401 redirect: client.js clears the store on an expired
 * token, which swaps the guest router back in.
 */
export function useAppRouter() {
  const token = useAuthStore((state) => state.token);
  return token ? userRouter : guestRouter;
}

export default guestRouter;
