import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ROUTES } from './lib/routes.ts'
import { ForgotPasswordPages } from './pages/auth/ForgotPass.tsx'
import { FormResetPassword } from './pages/auth/ResetPass.tsx'
import { NotFoundContent } from './components/shared/Error.tsx'
import { RouteGuard } from './providers/route-guard.tsx'
import type { UserRole } from './lib/types/user.ts'

const LoginPage = React.lazy(() => import('./pages/auth/Login.tsx'))
const RegisterPage = React.lazy(() => import('./pages/auth/Register.tsx'))
const OAuthCallbackPage = React.lazy(() => import('./pages/auth/Oauth.tsx'))
const Home = React.lazy(() => import('./pages/landing/Home.tsx'))
const CoursePage = React.lazy(() => import('./pages/landing/Course.tsx'))
const ViewModuleAndLessons = React.lazy(() => import('./pages/courses/view.tsx'))
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard.tsx'))
const AdminStudentsPage = React.lazy(() => import('./pages/admin/Student.tsx'))
const AdminMentorsPage = React.lazy(() => import('./pages/admin/Mentors.tsx'))
const AdminAdministratorsPage = React.lazy(() => import('./pages/admin/Admin.tsx'))
const Courses = React.lazy(() => import('./pages/admin/Courses.tsx'))
const AdminCourseCategories = React.lazy(() => import('./pages/admin/CourseCategories.tsx'))
const AdminCourseTypes = React.lazy(() => import('./pages/admin/CourseTypes.tsx'))
const CourseDetail = React.lazy(() => import('./pages/courses/detail.tsx'))
const AdminDetailCourse = React.lazy(() => import('./pages/admin/DetailCourse.tsx'))
const MentorDetailCourse = React.lazy(() => import('./pages/mentor/DetailCourse.tsx'))
const Transactions = React.lazy(() => import('./pages/admin/Transactions.tsx'))
const Financial = React.lazy(() => import('./pages/admin/Financial.tsx'))
const CourseEditAdmin = React.lazy(() => import('./pages/admin/CourseEdit.tsx'))
const CourseEditMentor = React.lazy(() => import('./pages/mentor/CourseEdit.tsx'))
// const ReviewsQa = React.lazy(() => import('./pages/admin/ReviewsQA.tsx'))
// const CourseEditMentor = React.lazy(() => import('./components/pages/mentor/CourseEdit.tsx'))
const MentorDashboard = React.lazy(() => import('./pages/mentor/Dashboard.tsx'))
const MentorCourses = React.lazy(() => import('./pages/mentor/Courses.tsx'))
const MentorAssignments = React.lazy(() => import('./pages/mentor/CourseAssignments.tsx'))
const StudentDashboard = React.lazy(() => import('./pages/student/Dashboard.tsx'))
const StudentLearning = React.lazy(() => import('./pages/student/Learning.tsx'))
const StudentLearningCourse = React.lazy(() => import('./pages/courses/view.tsx'))
const StudentAssignments = React.lazy(() => import('./pages/student/Assignments.tsx'))
const StudentBrowse = React.lazy(() => import('./pages/student/BrowseCourse.tsx'))
const StudentCertificates = React.lazy(() => import('./pages/student/Certificates.tsx'))
const StudentTransactions = React.lazy(() => import('./pages/student/Transactions.tsx'))
const ProfilePage = React.lazy(() => import('./pages/profile/Profile.tsx'))

type RouteConfig = {
  path: string
  element: React.ReactElement
  public: boolean
  lazy: boolean
  roles?: UserRole[]
}

const routeConfig: RouteConfig[] = [
  {
    path: ROUTES.home,
    element: <Home />,
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
    path: ROUTES.courseDetail(':courseUid'),
    element: <CourseDetail />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.viewModuleAndLessons(':courseUid'),
    element: <ViewModuleAndLessons />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.login,
    element: <LoginPage />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.register,
    element: <RegisterPage />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.oauthCallback,
    element: <OAuthCallbackPage />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.forgotPassword,
    element: <ForgotPasswordPages />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.resetPassword,
    element: <FormResetPassword />,
    public: true,
    lazy: true,
  },
  {
    path: ROUTES.profile,
    element: <ProfilePage />,
    public: false,
    lazy: true,
    roles: ['student', 'mentor', 'admin'],
  },
  {
    path: ROUTES.admin.dashboard,
    element: <Dashboard />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.users.students,
    element: <AdminStudentsPage />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.users.mentors,
    element: <AdminMentorsPage />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.users.administrators,
    element: <AdminAdministratorsPage />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.courses,
    element: <Courses />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.courseCategories,
    element: <AdminCourseCategories />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.courseTypes,
    element: <AdminCourseTypes />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.detailCourseAdmin(':courseUid'),
    element: <AdminDetailCourse />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.courseEditAdmin(':courseUid'),
    element: <CourseEditAdmin />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.transactions,
    element: <Transactions />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.admin.financial,
    element: <Financial />,
    public: false,
    lazy: true,
    roles: ['admin'],
  },
  {
    path: ROUTES.mentor.dashboard,
    element: <MentorDashboard />,
    public: false,
    lazy: true,
    roles: ['mentor', 'admin'],
  },
  {
    path: ROUTES.mentor.courses,
    element: <MentorCourses />,
    public: false,
    lazy: true,
    roles: ['mentor', 'admin'],
  },
  {
    path: ROUTES.mentor.detailCourseMentor(':courseUid'),
    element: <MentorDetailCourse />,
    public: false,
    lazy: true,
    roles: ['mentor', 'admin'],
  },
  {
    path: ROUTES.mentor.courseEditMentor(':courseUid'),
    element: <CourseEditMentor />,
    public: false,
    lazy: true,
    roles: ['mentor', 'admin'],
  },
  {
    path: ROUTES.mentor.assignments(':courseUid'),
    element: <MentorAssignments />,
    public: false,
    lazy: true,
    roles: ['mentor', 'admin'],
  },
  {
    path: ROUTES.student.dashboard,
    element: <StudentDashboard />,
    public: false,
    lazy: true,
    roles: ['student'],
  },
  {
    path: ROUTES.student.learning,
    element: <StudentLearning />,
    public: false,
    lazy: true,
    roles: ['student'],
  },
  {
    path: ROUTES.student.learningCourse(':courseUid'),
    element: <StudentLearningCourse />,
    public: false,
    lazy: true,
    roles: ['student'],
  },
  {
    path: ROUTES.student.assignments,
    element: <StudentAssignments />,
    public: false,
    lazy: true,
    roles: ['student'],
  },
  {
    path: ROUTES.student.browse,
    element: <StudentBrowse />,
    public: false,
    lazy: true,
    roles: ['student'],
  },
  {
    path: ROUTES.student.certificates,
    element: <StudentCertificates />,
    public: false,
    lazy: true,
    roles: ['student'],
  },
  {
    path: ROUTES.student.transactions,
    element: <StudentTransactions />,
    public: false,
    lazy: true,
    roles: ['student'],
  },
  {
    path: '*',
    element: <NotFoundContent />,
    public: true,
    lazy: true,
  },
]

function renderRouteElement(route: RouteConfig) {
  const element = route.public ? route.element : <RouteGuard allowedRoles={route.roles}>{route.element}</RouteGuard>
  return route.lazy ? <Suspense fallback={null}>{element}</Suspense> : element
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routeConfig.map((route) => (
          <Route key={route.path} path={route.path} element={renderRouteElement(route)} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
