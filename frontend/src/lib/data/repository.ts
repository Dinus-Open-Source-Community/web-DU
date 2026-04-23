/**
 * Stub data layer.
 *
 * Berkas ini hanya berisi stub kosong agar kontrak tipe lama tetap dapat dikompilasi
 * setelah seluruh mock & dummy data dihapus. Setiap fungsi mengembalikan nilai kosong
 * (array kosong / null / objek default) tanpa menyimpan data dummy apapun. Ganti
 * dengan integrasi backend nyata bila tersedia.
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
  ChartDataPoint,
  ChartRatioPoint,
  ICardData,
  ICertificate,
  IDashboardStat,
  IDeadlineItem,
  IFeedbackItem,
  IMentorAssignmentSubmission,
  IMentorCourse,
  IMentorCourseAssignment,
  IMentorStats,
  IResumeCourse,
  IScheduleItem,
  StudentEnrolledCourse,
  TransactionHistoryItem,
  TransactionTimelinePoint,
} from '@/lib/types'

export interface SeedUser {
  id: string
  nama: string
  email: string
  avatar?: string
  role: 'student' | 'mentor' | 'admin'
}

export function listCourses(): ICardData[] {
  return []
}

export function listCoursesByMentor(_mentorId: string): ICardData[] {
  return []
}

export function getCourseByUid(_uid: string): ICardData | null {
  return null
}

export function getCourseBySlug(_slug: string): ICardData | null {
  return null
}

export function listCategories(): AdminCategoryItem[] {
  return []
}

export function listAllReviews(): AdminReview[] {
  return []
}

export function listReviewsForCourse(_courseUid: string): AdminReview[] {
  return []
}

export function listAllQaThreads(): AdminQaThread[] {
  return []
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
  }
}

export function listMentors(): AdminMentor[] {
  return []
}

export function listStudents(): AdminStudent[] {
  return []
}

export function listAdministrators(): AdminAdministrator[] {
  return []
}

export function getMentorSpecColors(): Record<string, string> {
  return {}
}

export function getUserById(_uid: string): SeedUser | null {
  return null
}

export function listStudentEnrolledCourses(): StudentEnrolledCourse[] {
  return []
}

export function listTickets(): AdminTicket[] {
  return []
}

export function listAdminTransactions(): AdminTransaction[] {
  return []
}

export function listRecentTransactions(): TransactionHistoryItem[] {
  return []
}

export function getTransactionsSource(): TransactionHistoryItem[] {
  return []
}

export function getTransactionRatio(): ChartRatioPoint[] {
  return []
}

export function getTransactionTimeline30d(): TransactionTimelinePoint[] {
  return []
}

export function getMonthlyRevenue12m(): ChartDataPoint[] {
  return []
}

export function getRevenueByCategory(): ChartDataPoint[] {
  return []
}

export function getRevenueSourceRatio(): ChartRatioPoint[] {
  return []
}

export function getRevenueLine30d(): ChartDataPoint[] {
  return []
}

export function getNewUsersWeek(): ChartDataPoint[] {
  return []
}

export function getTopCoursesByEnrolment(): ChartDataPoint[] {
  return []
}

export function getDashboardStats(): IDashboardStat[] {
  return []
}

export function getDeadlines(): IDeadlineItem[] {
  return []
}

export function getFeedbacks(): IFeedbackItem[] {
  return []
}

export function getResumeCourses(): IResumeCourse[] {
  return []
}

export function listCertificates(): ICertificate[] {
  return []
}

export function getDashboardKpis(): AdminKpi[] {
  return []
}

export function getMentorDashboardStats(): IMentorStats {
  return {
    pendingGrading: 0,
    unansweredQA: 0,
    activeStudents: 0,
    totalCourses: 0,
  }
}

export function listSchedules(): IScheduleItem[] {
  return []
}

export function listMentorAssignmentSeeds(): IMentorCourseAssignment[] {
  return []
}

export function listMentorSubmissionSeeds(): IMentorAssignmentSubmission[] {
  return []
}
