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

export const router = null;
