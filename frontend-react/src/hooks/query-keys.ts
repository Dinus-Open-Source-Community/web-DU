import type { ManagedUserListParams } from '@/lib/user-manage/types'
import type { IQueryParamsPayload } from '@/services/api-path'

export const courseKeys = {
  all: ['courses'] as const,
  list: (params?: IQueryParamsPayload) => ['courses', params] as const,
  detail: (uid: string) => ['courses', uid] as const,
  students: (courseUid: string) => ['course-students', courseUid] as const,
  categories: (params?: IQueryParamsPayload) => ['course-categories', params] as const,
  category: (id: string) => ['course-category', id] as const,
  types: (params?: IQueryParamsPayload) => ['course-types', params] as const,
  edit: (courseUid: string) => ['courses', 'edit', courseUid] as const,
  progress: (courseUid: string) => ['courses', courseUid, 'progress'] as const,
  assignments: (courseUid: string, params?: IQueryParamsPayload) =>
    ['courses', courseUid, 'assignments', params] as const,
}

export const moduleKeys = {
  all: ['modules'] as const,
  byCourse: (courseUid: string, params?: IQueryParamsPayload) =>
    ['modules', courseUid, params] as const,
}

export const lessonKeys = {
  all: ['lessons'] as const,
  byModule: (moduleUid: string, params?: IQueryParamsPayload) =>
    ['lessons', 'module', moduleUid, params] as const,
  detail: (uid: string) => ['lesson', uid] as const,
  reading: (uid: string) => ['lessons', 'readings', uid] as const,
}

export const lessonReadingKeys = {
  all: ['lesson-readings'] as const,
  status: (lessonUid: string) => ['lesson-readings', 'status', lessonUid] as const,
}

export const lessonAssignmentKeys = {
  all: ['lesson-assignments'] as const,
  detail: (lessonUid: string) => ['lesson-assignments', 'detail', lessonUid] as const,
  mySubmission: (lessonUid: string) => ['lesson-assignments', 'my-submission', lessonUid] as const,
  staffSubmissions: (lessonUid: string) =>
    ['lesson-assignments', 'staff-submissions', lessonUid] as const,
  overviewSubmissions: (lessonUid: string) =>
    ['lesson-assignments', 'overview-submissions', lessonUid] as const,
}

export const attendanceKeys = {
  all: ['lesson-attendances'] as const,
  byLesson: (lessonUid: string) => ['lesson-attendances', 'lesson', lessonUid] as const,
}

export const paymentKeys = {
  all: ['payment'] as const,
  tripayDetail: (reference: string, merchantRef: string) =>
    ['payment', 'tripay', 'detail', reference, merchantRef] as const,
}

export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  kpis: (period: string) => ['admin-dashboard', 'kpis', period] as const,
  recentTransactions: (limit: number) =>
    ['admin-dashboard', 'recent-transactions', limit] as const,
  transactionSummary: ['admin-dashboard', 'transaction-summary'] as const,
  financialCharts: ['admin-dashboard', 'financial-charts'] as const,
}

export const adminTransactionsKeys = {
  all: ['admin-transactions'] as const,
  list: (params?: Record<string, unknown>) =>
    ['admin-transactions', 'list', params] as const,
}

export const authKeys = {
  session: ['auth', 'session'] as const,
}

export const userManageKeys = {
  all: ['managed-users'] as const,
  list: (params?: ManagedUserListParams) => ['managed-users', params] as const,
  detail: (uid: string) => ['managed-users', 'detail', uid] as const,
  graderProfile: (uid: string) => ['managed-users', 'grader-profile', uid] as const,
}

export const adminModerationKeys = {
  all: ['admin-moderation'] as const,
  reviews: (params?: IQueryParamsPayload) => ['admin-moderation', 'reviews', params] as const,
  qna: (params?: IQueryParamsPayload) => ['admin-moderation', 'qna', params] as const,
}

export const studentAssignmentKeys = {
  all: ['student-assignments'] as const,
  myList: (params?: IQueryParamsPayload) => ['student-assignments', 'my', params] as const,
}

export const mentorDashboardKeys = {
  all: ['mentor-dashboard'] as const,
  kpis: ['mentor-dashboard', 'kpis'] as const,
  schedules: (params?: IQueryParamsPayload) =>
    ['mentor-dashboard', 'schedules', params] as const,
}
