import { Navigate } from 'react-router-dom'

import { DASHBOARD_PATH } from '@/lib/dashboard-route'
import { ROUTES } from '@/lib/routes'
import { useAuth } from '@/providers/auth-provider'

import AdminCourses from '@/pages/admin/Courses'
import MentorCourses from '@/pages/mentor/Courses'
import AdminDetailCourse from '@/pages/admin/DetailCourse'
import MentorDetailCourse from '@/pages/mentor/DetailCourse'
import CourseEditAdmin from '@/pages/admin/CourseEdit'
import CourseEditMentor from '@/pages/mentor/CourseEdit'
import AdminAssignmentSubmissions from '@/pages/admin/AssignmentSubmissions'
import MentorAssignmentSubmissions from '@/pages/mentor/AssignmentSubmissions'
import AdminAssignmentSubmissionDetail from '@/pages/admin/AssignmentSubmissionDetail'
import MentorAssignmentSubmissionDetail from '@/pages/mentor/AssignmentSubmissionDetail'

function staffCourseRole(role: string | null | undefined): 'admin' | 'mentor' | null {
  if (role === 'admin' || role === 'super_admin') return 'admin'
  if (role === 'mentor') return 'mentor'
  return null
}

export function DashboardCoursesGateway() {
  const { role } = useAuth()
  const staff = staffCourseRole(role)
  if (staff === 'admin') return <AdminCourses />
  if (staff === 'mentor') return <MentorCourses />
  if (role === 'student') return <Navigate to={ROUTES.student.learning} replace />
  return <Navigate to={DASHBOARD_PATH} replace />
}

export function DashboardCourseDetailGateway() {
  const { role } = useAuth()
  const staff = staffCourseRole(role)
  if (staff === 'admin') return <AdminDetailCourse />
  if (staff === 'mentor') return <MentorDetailCourse />
  return <Navigate to={DASHBOARD_PATH} replace />
}

export function DashboardCourseEditGateway() {
  const { role } = useAuth()
  const staff = staffCourseRole(role)
  if (staff === 'admin') return <CourseEditAdmin />
  if (staff === 'mentor' || role === 'student') return <CourseEditMentor />
  return <Navigate to={DASHBOARD_PATH} replace />
}

export function DashboardAssignmentSubmissionsGateway() {
  const { role } = useAuth()
  const staff = staffCourseRole(role)
  if (staff === 'admin') return <AdminAssignmentSubmissions />
  if (staff === 'mentor') return <MentorAssignmentSubmissions />
  return <Navigate to={DASHBOARD_PATH} replace />
}

export function DashboardAssignmentSubmissionDetailGateway() {
  const { role } = useAuth()
  const staff = staffCourseRole(role)
  if (staff === 'admin') return <AdminAssignmentSubmissionDetail />
  if (staff === 'mentor') return <MentorAssignmentSubmissionDetail />
  return <Navigate to={DASHBOARD_PATH} replace />
}
