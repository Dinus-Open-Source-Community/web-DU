/**
 * Lapisan data aplikasi — saat ini sepenuhnya memakai dummy di `dummy-seed.ts`
 * (tanpa request HTTP; lihat juga `lib/config/mock-data.ts` & `lib/api/fetcher.ts`).
 */

import type {
  AdminAdministrator,
  AdminKpi,
  AdminMentor,
  AdminQaThread,
  AdminReview,
  AdminStudent,
  AdminTicket,
  AdminTransaction,
  AdminCategoryItem,
} from '@/lib/types'
import type {
  ChartDataPoint,
  ChartRatioPoint,
  TransactionTimelinePoint,
} from '@/lib/types/analytics'
import type {
  ICardData,
  ICertificate,
  IDashboardStat,
  IDeadlineItem,
  IFeedbackItem,
  IMentorCourse,
  IMentorStats,
  IMentorAssignmentSubmission,
  IMentorCourseAssignment,
  IResumeCourse,
  IScheduleItem,
  StudentEnrolledCourse,
  TransactionHistoryItem,
} from '@/lib/types'
import type { CourseCategory } from '@/lib/types/course'

import type { SeedUser } from './dummy-seed'
import {
  buildCertificates,
  buildChartRatio,
  buildDashboardKpis,
  buildDashboardStats,
  buildDeadlines,
  buildFeedbacks,
  buildMonthlyRevenue12m,
  buildNewUsersWeek,
  buildQaThreads,
  buildResumeCourses,
  buildRevenueByCategory,
  buildRevenueLine30d,
  buildRevenueSourceRatio,
  buildReviews,
  buildSchedules,
  buildTopCoursesEnrollment,
  buildTransactionHistory,
  buildTransactionTimeline30d,
  buildAdminTransactions,
  getMentorDashboardStatsDummy,
  getMentorSpecColorsDummy,
  listCategoriesDummy,
  SEED_ASSIGNMENTS,
  SEED_ICARD_COURSES,
  SEED_ADMIN_MENTORS,
  SEED_ADMIN_STUDENTS,
  SEED_ADMINISTRATORS,
  SEED_STUDENT_ENROLLED,
  SEED_SUBMISSIONS,
  SEED_TICKETS,
  SEED_USERS,
  slugToCourseUid,
} from './dummy-seed'

export type { SeedUser } from './dummy-seed'

const txCache = buildTransactionHistory()
const adminTxCache = buildAdminTransactions()

export function listCourses(): ICardData[] {
  return [...SEED_ICARD_COURSES]
}

export function listCoursesByMentor(mentorId: string): ICardData[] {
  return SEED_ICARD_COURSES.filter((c) => c.mentorUid === mentorId)
}

export function getCourseByUid(uid: string): ICardData | null {
  return SEED_ICARD_COURSES.find((c) => c.uid === uid) ?? null
}

export function getCourseBySlug(slug: string): ICardData | null {
  const uid = slugToCourseUid(slug)
  return uid ? getCourseByUid(uid) : null
}

export function listCategories(): AdminCategoryItem[] {
  return listCategoriesDummy()
}

export function listAllReviews(): AdminReview[] {
  return buildReviews()
}

export function listReviewsForCourse(courseUid: string): AdminReview[] {
  return buildReviews().filter((r) => r.courseUid === courseUid)
}

export function listAllQaThreads(): AdminQaThread[] {
  return buildQaThreads()
}

export function toMentorCourseView(course: ICardData): IMentorCourse {
  return {
    uid: course.uid,
    title: course.title,
    header: course.description,
    description: course.description,
    image: course.image,
    published: course.status === 'published',
    moduleCount: course.modules.length,
    studentCount: course.enrolled,
    rating: course.rating,
    totalReviews: course.totalReviews,
    updatedAt: course.updatedAt,
    price: course.price,
    strikePrice: course.strikePrice,
    category: course.category as CourseCategory | undefined,
  }
}

export function listMentors(): AdminMentor[] {
  return [...SEED_ADMIN_MENTORS]
}

export function listStudents(): AdminStudent[] {
  return [...SEED_ADMIN_STUDENTS]
}

export function listAdministrators(): AdminAdministrator[] {
  return [...SEED_ADMINISTRATORS]
}

export function getMentorSpecColors(): Record<string, string> {
  return getMentorSpecColorsDummy()
}

export function getUserById(uid: string): SeedUser | null {
  return SEED_USERS.find((u) => u.id === uid) ?? null
}

export function listStudentEnrolledCourses(): StudentEnrolledCourse[] {
  return [...SEED_STUDENT_ENROLLED]
}

export function listTickets(): AdminTicket[] {
  return [...SEED_TICKETS]
}

export function listAdminTransactions(): AdminTransaction[] {
  return [...adminTxCache]
}

export function listRecentTransactions(): TransactionHistoryItem[] {
  return txCache.slice(0, 5)
}

export function getTransactionsSource(): TransactionHistoryItem[] {
  return [...txCache]
}

export function getTransactionRatio(): ChartRatioPoint[] {
  return buildChartRatio()
}

export function getTransactionTimeline30d(): TransactionTimelinePoint[] {
  return buildTransactionTimeline30d()
}

export function getMonthlyRevenue12m(): ChartDataPoint[] {
  return buildMonthlyRevenue12m()
}

export function getRevenueByCategory(): ChartDataPoint[] {
  return buildRevenueByCategory()
}

export function getRevenueSourceRatio(): ChartRatioPoint[] {
  return buildRevenueSourceRatio()
}

export function getRevenueLine30d(): ChartDataPoint[] {
  return buildRevenueLine30d()
}

export function getNewUsersWeek(): ChartDataPoint[] {
  return buildNewUsersWeek()
}

export function getTopCoursesByEnrolment(): ChartDataPoint[] {
  return buildTopCoursesEnrollment()
}

export function getDashboardStats(): IDashboardStat[] {
  return buildDashboardStats()
}

export function getDeadlines(): IDeadlineItem[] {
  return buildDeadlines()
}

export function getFeedbacks(): IFeedbackItem[] {
  return buildFeedbacks()
}

export function getResumeCourses(): IResumeCourse[] {
  return buildResumeCourses()
}

export function listCertificates(): ICertificate[] {
  return buildCertificates()
}

export function getDashboardKpis(): AdminKpi[] {
  return buildDashboardKpis()
}

export function getMentorDashboardStats(): IMentorStats {
  return getMentorDashboardStatsDummy()
}

export function listSchedules(): IScheduleItem[] {
  return buildSchedules()
}

export function listMentorAssignmentSeeds(): IMentorCourseAssignment[] {
  return [...SEED_ASSIGNMENTS]
}

export function listMentorSubmissionSeeds(): IMentorAssignmentSubmission[] {
  return [...SEED_SUBMISSIONS]
}
