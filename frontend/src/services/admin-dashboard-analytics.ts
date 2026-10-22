import type { IResponse } from '@/lib/types/api'
import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'

export interface TopCourse {
  course_name: string
  students: number
  completed: number
  completion_rate: number
}

export interface EnrollmentTrendPoint {
  date: string
  enrollments: number
}

export interface StudentProgressDistribution {
  status: string
  count: number
}

export interface MentorActivity {
  mentor_name: string
  courses: number
  students: number
}

export interface RecentEnrollment {
  student_name: string
  course_name: string
  enrolled_at: string
}

export interface AdminDashboardAnalytics {
  top_courses: TopCourse[]
  enrollment_trend: EnrollmentTrendPoint[]
  student_progress_distribution: StudentProgressDistribution[]
  top_mentors: MentorActivity[]
  recent_enrollments: RecentEnrollment[]
}

export async function fetchAdminDashboardAnalytics(days: number = 30) {
  const response = await api.get<IResponse<AdminDashboardAnalytics>>(
    API_ROUTES.admin.dashboard.analytics({ days }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil data analytics dashboard')
}
