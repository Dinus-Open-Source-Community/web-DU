import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ROUTES } from './lib/routes.ts'
import { ForgotPasswordPages } from './pages/auth/ForgotPass.tsx'
import { FormResetPassword } from './pages/auth/ResetPass.tsx'

const RoutePage = React.lazy(() => import('./components/shared/route-page.tsx'))
const LoginPage = React.lazy(() => import('./pages/auth/Login.tsx'))
const RegisterPage = React.lazy(() => import('./pages/auth/Register.tsx'))
const Home = React.lazy(() => import('./pages/landing/Home.tsx'))
const CoursePage = React.lazy(() => import('./pages/landing/Course.tsx'))
const ViewModuleAndLessons = React.lazy(() => import('./pages/courses/view.tsx'))
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard.tsx'))
const AdminStudentsPage = React.lazy(() => import('./pages/admin/Student.tsx'))
const AdminMentorsPage = React.lazy(() => import('./pages/admin/Mentors.tsx'))
const AdminAdministratorsPage = React.lazy(() => import('./pages/admin/Admin.tsx'))
const Courses = React.lazy(() => import('./pages/admin/Courses.tsx'))
const AdminDetailCourse = React.lazy(() => import('./pages/admin/DetailCourse.tsx'))
const MentorDetailCourse = React.lazy(() => import('./pages/mentor/DetailCourse.tsx'))
const Transactions = React.lazy(() => import('./pages/admin/Transactions.tsx'))
const Financial = React.lazy(() => import('./pages/admin/Financial.tsx'))
const CourseEditAdmin = React.lazy(() => import('./pages/admin/CourseEdit.tsx'))
const CourseEditMentor = React.lazy(() => import('./pages/mentor/CourseEdit.tsx'))
const ReviewsQa = React.lazy(() => import('./pages/admin/ReviewsQA.tsx'))
// const CourseEditMentor = React.lazy(() => import('./components/pages/mentor/CourseEdit.tsx'))
const MentorDashboard = React.lazy(() => import('./pages/mentor/Dashboard.tsx'))
const MentorCourses = React.lazy(() => import('./pages/mentor/Courses.tsx'))
const MentorAssignments = React.lazy(() => import('./pages/mentor/CourseAssignments.tsx'))
const StudentDashboard = React.lazy(() => import('./pages/student/Dashboard.tsx'))
const StudentLearning = React.lazy(() => import('./pages/student/Learning.tsx'))
const StudentLearningCourse = React.lazy(() => import('./pages/courses/view.tsx'))
const StudentAssignments = React.lazy(() => import('./pages/student/Assignments.tsx'))
const StudentBrowse = React.lazy(() => import('./pages/student/BrowseCourse.tsx'))
// const StudentCertificates = React.lazy(() => import('./components/pages/student/Certificates.tsx'))
// const StudentTransactions = React.lazy(() => import('./components/pages/student/Transactions.tsx'))

const routeConfig = [
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
    path: ROUTES.admin.dashboard,
    element: <Dashboard />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.users.students,
    element: <AdminStudentsPage />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.users.mentors,
    element: <AdminMentorsPage />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.users.administrators,
    element: <AdminAdministratorsPage />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.courses,
    element: <Courses />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.detailCourse(':courseUid'),
    element: <AdminDetailCourse />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.courseEdit(':courseUid'),
    element: <CourseEditAdmin />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.transactions,
    element: <Transactions />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.financial,
    element: <Financial />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.admin.reviewsAndQaPath,
    element: <ReviewsQa />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.mentor.dashboard,
    element: <MentorDashboard />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.mentor.courses,
    element: <MentorCourses />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.mentor.detailCourse(':courseUid'),
    element: <MentorDetailCourse />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.mentor.courseEdit(':courseUid'),
    element: <CourseEditMentor />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.mentor.assignments(':courseUid'),
    element: <MentorAssignments />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.student.dashboard,
    element: <StudentDashboard />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.student.learning,
    element: <StudentLearning />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.student.learningCourse(':courseUid'),
    element: <StudentLearningCourse />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.student.assignments,
    element: <StudentAssignments />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.student.browse,
    element: <StudentBrowse />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.student.certificates,
    element: <RoutePage title="Student - Certificates" description="Halaman sertifikat student." path={ROUTES.student.certificates} />,
    public: false,
    lazy: true,
  },
  {
    path: ROUTES.student.transactions,
    element: <RoutePage title="Student - Transactions" description="Riwayat transaksi student." path={ROUTES.student.transactions} />,
    public: false,
    lazy: true,
  },
  {
    path: '*',
    element: <RoutePage title="Halaman tidak ditemukan" description="Route yang kamu tuju belum terdaftar." path="*" badge="404" ctaLabel="Kembali ke beranda" ctaTo={ROUTES.home} />,
    public: true,
    lazy: true,
  },
] as const

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routeConfig.map((route) => (
          <Route key={route.path} path={route.path} element={route.lazy ? <Suspense fallback={<></>}>{route.element}</Suspense> : route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
