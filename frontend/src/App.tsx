import React, { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "./lib/routes.ts";
import {
  DashboardAssignmentSubmissionDetailGateway,
  DashboardAssignmentSubmissionsGateway,
  DashboardCourseDetailGateway,
  DashboardCourseEditGateway,
  DashboardCoursesGateway,
} from "./pages/dashboard/Gateways.tsx";
import {
  LEGACY_DASHBOARD_REDIRECTS,
  LegacyRedirect,
} from "./pages/dashboard/LegacyRedirects.tsx";
import { ForgotPasswordPages } from "./pages/auth/ForgotPass.tsx";
import { FormResetPassword } from "./pages/auth/ResetPass.tsx";
import { NotFoundContent } from "./components/shared/Error.tsx";
import { PageSkeleton } from "./components/shared/PageSkeleton.tsx";
import { AuthPageSkeleton } from "./components/auth/AuthPageSkeleton.tsx";
import { RouteGuard } from "./providers/route-guard.tsx";
import { RouterErrorBoundary } from "./components/shared/Error.tsx";
import ScrollManager from "./components/shared/ScrollManager.tsx";
import type { UserRole } from "./lib/types/user.ts";

const LoginPage = React.lazy(() => import("./pages/auth/Login.tsx"));
const RegisterPage = React.lazy(() => import("./pages/auth/Register.tsx"));
const VerifyOtpPage = React.lazy(() => import("./pages/auth/VerifyOtp.tsx"));
const OAuthCallbackPage = React.lazy(() => import("./pages/auth/Oauth.tsx"));
const Home = React.lazy(() => import("./pages/landing/Home.tsx"));
const GalleryPage = React.lazy(() => import("./pages/landing/Gallery.tsx"));
const MentorsPage = React.lazy(() => import("./pages/landing/Mentors.tsx"));
const CoursePage = React.lazy(() => import("./pages/landing/Course.tsx"));
const ViewModuleAndLessons = React.lazy(
  () => import("./pages/courses/view.tsx"),
);
const CourseLessonsPage = React.lazy(
  () => import("./pages/courses/lessons.tsx"),
);
const DashboardGateway = React.lazy(() => import("./pages/DashboardGateway.tsx"));
const AdminStudentsPage = React.lazy(() => import("./pages/admin/Student.tsx"));
const AdminMentorsPage = React.lazy(() => import("./pages/admin/Mentors.tsx"));
const AdminAdministratorsPage = React.lazy(
  () => import("./pages/admin/Admin.tsx"),
);
const AdminStudentDetailPage = React.lazy(
  () => import("./pages/admin/StudentDetail.tsx"),
);
const AdminMentorDetailPage = React.lazy(
  () => import("./pages/admin/MentorDetail.tsx"),
);
const AdminAdministratorDetailPage = React.lazy(
  () => import("./pages/admin/AdministratorDetail.tsx"),
);
const AdminCourseCategories = React.lazy(
  () => import("./pages/admin/CourseCategories.tsx"),
);
const AdminCourseTypes = React.lazy(
  () => import("./pages/admin/CourseTypes.tsx"),
);
const AdminGalleryPage = React.lazy(
  () => import("./pages/admin/Gallery.tsx"),
);
const CourseDetail = React.lazy(() => import("./pages/courses/detail.tsx"));
const ReviewsQa = React.lazy(() => import('./pages/admin/ReviewsQA.tsx'))
// const CourseEditMentor = React.lazy(() => import('./components/pages/mentor/CourseEdit.tsx'))
const MentorAssignments = React.lazy(
  () => import("./pages/mentor/CourseAssignments.tsx"),
);
const StudentLearning = React.lazy(
  () => import("./pages/student/Learning.tsx"),
);
const StudentLearningCourse = React.lazy(
  () => import("./pages/courses/view.tsx"),
);
const StudentAssignments = React.lazy(
  () => import("./pages/student/Assignments.tsx"),
);
const StudentRedeem = React.lazy(
  () => import("./pages/student/Redeem.tsx"),
);
const ProfilePage = React.lazy(() => import("./pages/profile/Profile.tsx"));

type RouteConfig = {
  path: string;
  element: React.ReactElement;
  public: boolean;
  lazy: boolean;
  roles?: UserRole[];
  /** Fallback Suspense khusus route ini; default ke PageSkeleton generik. */
  fallback?: React.ReactNode;
};

const AUTH_PAGE_FALLBACK = <AuthPageSkeleton />;

/**
 * Lockdown landing: saat true, hanya halaman publik inti yang bisa diakses
 * (home, katalog kursus, detail kursus, dan auth). Route lain tetap
 * di-redirect ke home. Ubah ke false untuk membuka kembali seluruh aplikasi.
 */
const LOCKDOWN_HOME_ONLY = false;

const LOCKDOWN_ALLOWLIST: ReadonlySet<string> = new Set<string>([
  ROUTES.home,
  ROUTES.gallery,
  ROUTES.mentors,
  ROUTES.courses,
  ROUTES.courseDetail(':courseUid'),
  ROUTES.login,
  ROUTES.register,
  ROUTES.verifyOtp,
  ROUTES.redeem,
  ROUTES.oauthCallback,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  '*',
]);

const routeConfig: RouteConfig[] = [
  {
    path: ROUTES.home,
    element: <Home />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.gallery,
    element: <GalleryPage />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.mentors,
    element: <MentorsPage />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.courses,
    element: <CoursePage />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.courseDetail(":courseUid"),
    element: <CourseDetail />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.viewModuleAndLessons(":courseUid"),
    element: <ViewModuleAndLessons />,
    public: false,
    lazy: true,
    roles: ["student", "mentor", "admin", "super_admin"],
  },
  {
    path: ROUTES.courseLessons(":courseUid"),
    element: <CourseLessonsPage />,
    public: false,
    lazy: true,
    roles: ["student", "mentor", "admin", "super_admin"],
  },
  {
    path: ROUTES.login,
    element: <LoginPage />,
    public: true,
    lazy: true,
    fallback: AUTH_PAGE_FALLBACK,
  },
  {
    path: ROUTES.register,
    element: <RegisterPage />,
    public: true,
    lazy: true,
    fallback: AUTH_PAGE_FALLBACK,
  },
  {
    path: ROUTES.verifyOtp,
    element: <VerifyOtpPage />,
    public: true,
    lazy: true,
    fallback: AUTH_PAGE_FALLBACK,
  },
  {
    path: ROUTES.oauthCallback,
    element: <OAuthCallbackPage />,
    public: true,
    lazy: true,
    fallback: AUTH_PAGE_FALLBACK,
  },
  {
    path: ROUTES.forgotPassword,
    element: <ForgotPasswordPages />,
    public: true,
    lazy: true,
    fallback: AUTH_PAGE_FALLBACK,
  },
  {
    path: ROUTES.resetPassword,
    element: <FormResetPassword />,
    public: true,
    lazy: true,
    fallback: AUTH_PAGE_FALLBACK,
  },
  {
    path: ROUTES.redeem,
    element: <Navigate to={ROUTES.student.redeem} replace />,
    public: false,
    lazy: false,
    roles: ["student"],
  },
  {
    path: ROUTES.profile,
    element: <ProfilePage />,
    public: false,
    lazy: true,
    roles: ["student", "mentor", "admin", "super_admin"],
  },
  {
    path: ROUTES.dashboard,
    element: <DashboardGateway />,
    public: false,
    lazy: true,
    roles: ["student", "mentor", "admin", "super_admin"],
  },
  {
    path: ROUTES.admin.users.students,
    element: <AdminStudentsPage />,
    public: false,
    lazy: true,
    roles: ["super_admin"],
  },
  {
    path: `${ROUTES.admin.users.students}/:userUid`,
    element: <AdminStudentDetailPage />,
    public: false,
    lazy: true,
    roles: ["super_admin"],
  },
  {
    path: ROUTES.admin.users.mentors,
    element: <AdminMentorsPage />,
    public: false,
    lazy: true,
    roles: ["super_admin"],
  },
  {
    path: `${ROUTES.admin.users.mentors}/:userUid`,
    element: <AdminMentorDetailPage />,
    public: false,
    lazy: true,
    roles: ["super_admin"],
  },
  {
    path: ROUTES.admin.users.administrators,
    element: <AdminAdministratorsPage />,
    public: false,
    lazy: true,
    roles: ["super_admin"],
  },
  {
    path: `${ROUTES.admin.users.administrators}/:userUid`,
    element: <AdminAdministratorDetailPage />,
    public: false,
    lazy: true,
    roles: ["super_admin"],
  },
  {
    path: ROUTES.admin.courses,
    element: <DashboardCoursesGateway />,
    public: false,
    lazy: false,
    roles: ["admin", "super_admin", "mentor", "student"],
  },
  {
    path: ROUTES.admin.courseCategories,
    element: <AdminCourseCategories />,
    public: false,
    lazy: true,
    roles: ["admin", "super_admin"],
  },
  {
    path: ROUTES.admin.courseTypes,
    element: <AdminCourseTypes />,
    public: false,
    lazy: true,
    roles: ["admin", "super_admin"],
  },
  {
    path: ROUTES.admin.gallery,
    element: <AdminGalleryPage />,
    public: false,
    lazy: true,
    roles: ["admin", "super_admin"],
  },
  {
    path: ROUTES.dashboardMenu.courseAssignmentHub(":courseUid"),
    element: <MentorAssignments />,
    public: false,
    lazy: true,
    roles: ["mentor", "admin", "super_admin"],
  },
  {
    path: ROUTES.admin.detailCourseAdmin(":courseUid"),
    element: <DashboardCourseDetailGateway />,
    public: false,
    lazy: false,
    roles: ["admin", "super_admin", "mentor"],
  },
  {
    path: ROUTES.admin.assignmentSubmissionDetail(
      ":courseUid",
      ":lessonUid",
      ":submissionUid",
    ),
    element: <DashboardAssignmentSubmissionDetailGateway />,
    public: false,
    lazy: false,
    roles: ["admin", "super_admin", "mentor"],
  },
  {
    path: ROUTES.admin.assignmentSubmissions(":courseUid", ":lessonUid"),
    element: <DashboardAssignmentSubmissionsGateway />,
    public: false,
    lazy: false,
    roles: ["admin", "super_admin", "mentor"],
  },
  {
    path: ROUTES.admin.courseEditAdmin(":courseUid"),
    element: <DashboardCourseEditGateway />,
    public: false,
    lazy: false,
    roles: ["admin", "super_admin", "mentor", "student"],
  },
  {
    path: ROUTES.admin.reviewsAndQaPath,
    element: <ReviewsQa />,
    public: false,
    lazy: true,
    roles: ["admin", "super_admin", "mentor"],
  },
  {
    path: ROUTES.student.learning,
    element: <StudentLearning />,
    public: false,
    lazy: true,
    roles: ["student"],
  },
  {
    path: ROUTES.student.learningCourse(":courseUid"),
    element: <StudentLearningCourse />,
    public: false,
    lazy: true,
    roles: ["student"],
  },
  {
    path: ROUTES.student.assignments,
    element: <StudentAssignments />,
    public: false,
    lazy: true,
    roles: ["student"],
  },
  {
    path: ROUTES.student.redeem,
    element: <StudentRedeem />,
    public: false,
    lazy: true,
    roles: ["student"],
  },
  {
    path: "*",
    element: <NotFoundContent />,
    public: true,
    lazy: true,
  },
];

function renderRouteElement(route: RouteConfig) {
  const element = route.public ? (
    route.element
  ) : (
    <RouteGuard allowedRoles={route.roles}>{route.element}</RouteGuard>
  );
  return route.lazy ? (
    <Suspense
      fallback={
        route.fallback ?? (
          <PageSkeleton
            message="Memuat halaman..."
            className="min-h-dvh justify-center px-4 sm:px-6 lg:px-8"
          />
        )
      }
    >
      {element}
    </Suspense>
  ) : element;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <RouterErrorBoundary>
        <Routes>
          {LEGACY_DASHBOARD_REDIRECTS.map((legacy) => (
            <Route
              key={legacy.path}
              path={legacy.path}
              element={<LegacyRedirect template={legacy.template} />}
            />
          ))}
          {routeConfig.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                // Lockdown: hanya route di LOCKDOWN_ALLOWLIST yang bisa diakses
                // (home, katalog, detail kursus, auth). Route lain di-redirect
                // ke home. Matikan flag LOCKDOWN_HOME_ONLY untuk membuka
                // kembali seluruh app.
                LOCKDOWN_HOME_ONLY && !LOCKDOWN_ALLOWLIST.has(route.path) ? (
                  <Navigate to={ROUTES.home} replace />
                ) : (
                  renderRouteElement(route)
                )
              }
            />
          ))}
        </Routes>
      </RouterErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
