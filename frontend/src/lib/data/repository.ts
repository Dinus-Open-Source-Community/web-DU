/**
 * Repository sinkron — single entry point untuk seluruh seed data.
 *
 * Membaca JSON saat module pertama kali di-import, lalu meng-index ke Map
 * untuk lookup cepat. Mengembalikan objek yang sudah di-join (mentor +
 * category di-embed pada course) supaya konsumen tidak perlu join manual.
 *
 * Upgrade ke async repository (API route / database):
 *   cukup ganti implementasi function di file ini; signature tetap.
 */

import type {
  ICardData,
  IModule,
  IMentorCourse,
  BadgeVariant,
  CourseStatus,
  AdminStudent,
  StudentEnrolledCourse,
  AdminAdministrator,
  AdminTicket,
  TransactionHistoryItem,
  AdminTransaction,
  AdminPayout,
  AdminCoupon,
  AdminAuditLog,
  AdminRole,
  AdminPermissionGroup,
  AdminKpi,
  AdminMentor,
  AdminStatus,
  MentorSpecialization,
  ICertificate,
  ICourseAttendance,
  IScheduleItem,
  IDashboardStat,
  IResumeCourse,
  IDeadlineItem,
  IFeedbackItem,
  IMentorStats,
  IProgramFeatureData,
  CourseFeedbackBreakdown,
  AdminCategoryItem,
  CourseCategory,
  AnalyticsData,
  DashboardData,
  TransactionsData,
  RbacData,
  CourseExtrasData,
  ChartDataPoint,
  TransactionTimelinePoint,
  EngagementTrendPoint,
  ChartRatioPoint,
} from '@/lib/types'
import { isMockDataEnabled } from '@/lib/config/mock-data'

import usersRaw from './json/users.json'
import mentorsRaw from './json/mentors.json'
import categoriesRaw from './json/categories.json'
import coursesRaw from './json/courses.json'
import reviewsRaw from './json/reviews.json'
import qaThreadsRaw from './json/qa-threads.json'
import studentsRaw from './json/students.json'
import studentEnrolledRaw from './json/student-enrolled-courses.json'
import administratorsRaw from './json/administrators.json'
import ticketsRaw from './json/tickets.json'
import transactionsRaw from './json/transactions.json'
import payoutsRaw from './json/payouts.json'
import couponsRaw from './json/coupons.json'
import auditLogsRaw from './json/audit-logs.json'
import rbacRaw from './json/rbac.json'
import analyticsRaw from './json/analytics.json'
import certificatesRaw from './json/certificates.json'
import attendanceRaw from './json/attendance.json'
import schedulesRaw from './json/schedules.json'
import dashboardRaw from './json/dashboard.json'
import programFeaturesRaw from './json/program-features.json'
import courseExtrasRaw from './json/course-extras.json'

// ─── Raw JSON shapes (core entities) ────────────────────────────────────────

interface RawUser {
  id: string
  nama: string
  role: string
  email: string
  avatar?: string
}

interface RawMentor {
  id: string
  bio?: string
  specializations: string[]
  studentsCount: number
  totalCourses: number
  status: string
  createdAt: string
  updatedAt: string
}

interface RawCategory {
  id: string
  name: string
  description?: string
  status: string
  colorVariant: string
}

interface RawCourse {
  uid: string
  variantBadge: string
  title: string
  description: string
  category: string
  mentorId: string
  rating: number
  totalReviews: number
  image: string
  price: number
  strikePrice?: number
  status: string
  enrolled: number
  duration: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
  modules: IModule[]
}

interface RawReview {
  uid: string
  courseUid: string
  courseTitle: string
  studentName: string
  studentAvatar: string
  rating: number
  comment: string
  createdAt: string
  reply?: { author: string; comment: string; createdAt: string }
}

interface RawQaReply {
  uid: string
  author: string
  authorAvatar: string
  role: 'student' | 'mentor' | 'admin'
  body: string
  createdAt: string
}

interface RawQaThread {
  uid: string
  courseUid: string
  courseTitle: string
  title: string
  author: string
  authorAvatar: string
  body: string
  createdAt: string
  repliesCount: number
  status: 'answered' | 'unanswered'
  replies: RawQaReply[]
}

// ─── Typed re-export shapes (match admin-fixtures contracts) ─────────────────

export interface RepoUser {
  id: string
  nama: string
  role: string
  email: string
  avatar?: string
}

export interface RepoMentor {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  totalCourses: number
  rating: number
  totalReviews: number
  status: 'active' | 'inactive' | 'pending'
  specializations: string[]
  bio?: string
  studentsCount: number
}

export interface RepoCategory {
  uid: string
  name: string
  description?: string
  status: string
  colorVariant: string
  coursesCount: number
}

export type RepoReview = RawReview
export type RepoQaThread = RawQaThread

// ─── Index building (core entities) ─────────────────────────────────────────

const users = usersRaw as RawUser[]
const mentorProfiles = mentorsRaw as RawMentor[]
const categories = categoriesRaw as RawCategory[]
const rawCourses = coursesRaw as RawCourse[]
const reviews = reviewsRaw as RawReview[]
const qaThreads = qaThreadsRaw as RawQaThread[]

const userById = new Map(users.map((u) => [u.id, u]))

function resolveAuthor(mentorId: string): { name: string; avatar: string } {
  const u = userById.get(mentorId)
  if (u) return { name: u.nama, avatar: u.avatar ?? '' }
  return { name: 'Unknown', avatar: '' }
}

function formatDate(iso: string): string {
  if (!iso || iso === 'Draft') return iso
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

const coursesIndex: ICardData[] = rawCourses.map((rc) => {
  const author = resolveAuthor(rc.mentorId)
  return {
    uid: rc.uid,
    variantBadge: rc.variantBadge as BadgeVariant,
    title: rc.title,
    description: rc.description,
    category: rc.category,
    author,
    rating: rc.rating,
    totalReviews: rc.totalReviews,
    image: rc.image,
    price: rc.price,
    strikePrice: rc.strikePrice,
    status: rc.status as CourseStatus,
    mentorUid: rc.mentorId,
    enrolled: rc.enrolled,
    modules: rc.modules,
    duration: rc.duration,
    createdAt: rc.createdAt,
    updatedAt: rc.updatedAt,
    submittedAt: rc.submittedAt,
  }
})

const courseByUid = new Map(coursesIndex.map((c) => [c.uid, c]))
const reviewsByCourse = new Map<string, RepoReview[]>()
for (const r of reviews) {
  const arr = reviewsByCourse.get(r.courseUid) ?? []
  arr.push(r)
  reviewsByCourse.set(r.courseUid, arr)
}
const qaByCourse = new Map<string, RepoQaThread[]>()
for (const t of qaThreads) {
  const arr = qaByCourse.get(t.courseUid) ?? []
  arr.push(t)
  qaByCourse.set(t.courseUid, arr)
}

// ─── Index building (extended entities) ─────────────────────────────────────

const studentsData = studentsRaw as AdminStudent[]
const studentEnrolledData = studentEnrolledRaw as StudentEnrolledCourse[]
const administratorsData = administratorsRaw as AdminAdministrator[]
const ticketsData = ticketsRaw as AdminTicket[]
const txnData = transactionsRaw as TransactionsData
const payoutsData = payoutsRaw as AdminPayout[]
const couponsData = couponsRaw as AdminCoupon[]
const auditLogsData = auditLogsRaw as AdminAuditLog[]
const rbacData = rbacRaw as RbacData
const analyticsData = analyticsRaw as AnalyticsData
const certificatesData = certificatesRaw as ICertificate[]
const attendanceData = attendanceRaw as ICourseAttendance[]
const schedulesData = schedulesRaw as IScheduleItem[]
const dashData = dashboardRaw as DashboardData
const programFeaturesData = programFeaturesRaw as IProgramFeatureData[]
const courseExtrasData = courseExtrasRaw as CourseExtrasData

// ─── Public API: Core entities ──────────────────────────────────────────────

export function listUsers(): RepoUser[] {
  return users
}

export function getUserById(id: string): RepoUser | undefined {
  return userById.get(id)
}

export function listMentors(): AdminMentor[] {
  return mentorProfiles.map((mp) => {
    const u = userById.get(mp.id)
    return {
      uid: mp.id,
      name: u?.nama ?? mp.id,
      email: u?.email ?? '',
      avatar: u?.avatar ?? '',
      joinedAt: formatDate(mp.createdAt),
      totalCourses: mp.totalCourses,
      rating: 0,
      totalReviews: 0,
      status: mp.status as AdminStatus,
      specializations: mp.specializations as MentorSpecialization[],
      bio: mp.bio,
      studentsCount: mp.studentsCount,
    }
  })
}

export function getMentorById(id: string): AdminMentor | undefined {
  return listMentors().find((m) => m.uid === id)
}

export function listCategories(): RepoCategory[] {
  return categories.map((cat) => ({
    uid: cat.id,
    name: cat.name,
    description: cat.description,
    status: cat.status,
    colorVariant: cat.colorVariant,
    coursesCount: coursesIndex.filter((c) => c.category === cat.name).length,
  }))
}

export function listCourses(): ICardData[] {
  return coursesIndex
}

export function getCourseByUid(uid: string): ICardData | undefined {
  return courseByUid.get(uid)
}

export function listCoursesByMentor(mentorId: string): ICardData[] {
  return coursesIndex.filter((c) => c.mentorUid === mentorId)
}

export function listCoursesByCategory(categoryName: string): ICardData[] {
  return coursesIndex.filter((c) => c.category === categoryName)
}

export function listPopularCourses(limit = 8): ICardData[] {
  return coursesIndex
    .filter((c) => c.status === 'published')
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, limit)
}

export function listAllReviews(): RepoReview[] {
  return reviews
}

export function listReviewsForCourse(courseId: string): RepoReview[] {
  return reviewsByCourse.get(courseId) ?? []
}

export function listAllQaThreads(): RepoQaThread[] {
  return qaThreads
}

export function listQaThreadsForCourse(courseId: string): RepoQaThread[] {
  return qaByCourse.get(courseId) ?? []
}

export function getSyllabusFromCourse(
  course: ICardData,
): { title: string; lessonsCount: number; durationLabel: string }[] {
  return course.modules.map((m) => {
    const totalMin = m.lessons.reduce((acc, l) => acc + l.durationMinutes, 0)
    const hrs = Math.floor(totalMin / 60)
    const mins = totalMin % 60
    const durationLabel = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`
    return {
      title: m.title,
      lessonsCount: m.lessons.length,
      durationLabel,
    }
  })
}

export function toMentorCourseView(c: ICardData): IMentorCourse {
  return {
    uid: c.uid,
    title: c.title,
    header: c.description.slice(0, 80),
    description: c.description,
    image: c.image,
    published: c.status === 'published',
    moduleCount: c.modules.length,
    studentCount: c.enrolled,
    rating: c.rating,
    totalReviews: c.totalReviews,
    updatedAt: c.updatedAt,
  }
}

// ─── Public API: Students ───────────────────────────────────────────────────

export function listStudents(): AdminStudent[] {
  return studentsData
}

export function getStudentByUid(uid: string): AdminStudent | undefined {
  return studentsData.find((s) => s.uid === uid)
}

export function listStudentEnrolledCourses(): StudentEnrolledCourse[] {
  return studentEnrolledData
}

// ─── Public API: Administrators ─────────────────────────────────────────────

export function listAdministrators(): AdminAdministrator[] {
  return administratorsData
}

// ─── Public API: Tickets ────────────────────────────────────────────────────

export function listTickets(): AdminTicket[] {
  return ticketsData
}

// ─── Public API: Transactions ───────────────────────────────────────────────

export function listRecentTransactions(): TransactionHistoryItem[] {
  return txnData.recent
}

export function listHistoryTransactions(): TransactionHistoryItem[] {
  return txnData.history
}

export function listAdminTransactions(): AdminTransaction[] {
  return txnData.admin
}

export function getTransactionsSource(): TransactionHistoryItem[] {
  return isMockDataEnabled() ? txnData.history : []
}

// ─── Public API: Payouts ────────────────────────────────────────────────────

export function listPayouts(): AdminPayout[] {
  return payoutsData
}

// ─── Public API: Coupons ────────────────────────────────────────────────────

export function listCoupons(): AdminCoupon[] {
  return couponsData
}

// ─── Public API: Audit Logs ─────────────────────────────────────────────────

export function listAuditLogs(): AdminAuditLog[] {
  return auditLogsData
}

// ─── Public API: RBAC ───────────────────────────────────────────────────────

export function listRoles(): AdminRole[] {
  return rbacData.roles
}

export function listPermissionGroups(): AdminPermissionGroup[] {
  return rbacData.permissionGroups
}

// ─── Public API: Analytics ──────────────────────────────────────────────────

export function getDashboardKpis(): AdminKpi[] {
  return analyticsData.kpis
}

export function getRevenueLine30d(): ChartDataPoint[] {
  return analyticsData.revenueLine30d
}

export function getNewUsersWeek(): ChartDataPoint[] {
  return analyticsData.newUsersWeek
}

export function getTopCoursesByEnrolment(): ChartDataPoint[] {
  return analyticsData.topCoursesByEnrolment
}

export function getTransactionTimeline30d(): TransactionTimelinePoint[] {
  return analyticsData.transactionTimeline30d
}

export function getTransactionRatio(): ChartRatioPoint[] {
  return analyticsData.transactionRatio
}

export function getLearningEngagementTrend(): EngagementTrendPoint[] {
  return analyticsData.learningEngagementTrend
}

export function getCompletionRateByCategory(): ChartDataPoint[] {
  return analyticsData.completionRateByCategory
}

export function getDropOffFunnel(): ChartDataPoint[] {
  return analyticsData.dropOffFunnel
}

export function getMonthlyRevenue12m(): ChartDataPoint[] {
  return analyticsData.monthlyRevenue12m
}

export function getRevenueByCategory(): ChartDataPoint[] {
  return analyticsData.revenueByCategory
}

export function getRevenueSourceRatio(): ChartRatioPoint[] {
  return analyticsData.revenueSourceRatio
}

// ─── Public API: Certificates ───────────────────────────────────────────────

export function listCertificates(): ICertificate[] {
  return certificatesData
}

export function getCertificateByUid(uid: string): ICertificate | undefined {
  return certificatesData.find((c) => c.uid === uid)
}

// ─── Public API: Attendance ─────────────────────────────────────────────────

export function listAttendance(): ICourseAttendance[] {
  return attendanceData
}

// ─── Public API: Schedules ──────────────────────────────────────────────────

export function listSchedules(): IScheduleItem[] {
  return schedulesData
}

// ─── Public API: Dashboard ──────────────────────────────────────────────────

export function getDashboardStats(): IDashboardStat[] {
  return dashData.stats
}

export function getResumeCourses(): IResumeCourse[] {
  return dashData.resumeCourses
}

export function getDeadlines(): IDeadlineItem[] {
  return dashData.deadlines
}

export function getFeedbacks(): IFeedbackItem[] {
  return dashData.feedbacks
}

export function getProfileData(): DashboardData['profile'] {
  return dashData.profile
}

export function getMentorDashboardStats(): IMentorStats {
  return dashData.mentorStats
}

// ─── Public API: Program Features ───────────────────────────────────────────

export function getProgramFeatures(): IProgramFeatureData[] {
  return programFeaturesData
}

// ─── Public API: Course Extras ──────────────────────────────────────────────

export function getCourseWhatYouLearn(): string[] {
  return courseExtrasData.whatYouLearn
}

export function getCourseFeedbackBreakdown(): CourseFeedbackBreakdown[] {
  return courseExtrasData.feedbackBreakdown
}

export function getMentorSpecColors(): Record<string, string> {
  return courseExtrasData.mentorSpecColors
}

// ─── Public API: Admin Category List ────────────────────────────────────────

export function listAdminCategories(): AdminCategoryItem[] {
  return listCategories().map((c) => ({
    uid: c.uid,
    name: c.name as CourseCategory,
    coursesCount: c.coursesCount,
    colorVariant: c.colorVariant,
  }))
}

// ─── Public API: Popular Courses Strip ──────────────────────────────────────

export function getPopularCoursesStrip() {
  return listPopularCourses(4).map((c) => ({
    uid: c.uid,
    title: c.title,
    image: c.image,
    rating: c.rating,
    price: `Rp${(c.price / 1000).toFixed(0)}k`,
    mentor: c.author.name,
  }))
}

// ─── Public API: Mentor courses seed ────────────────────────────────────────

export function listMentorCoursesDummy(): IMentorCourse[] {
  return listCourses().map(toMentorCourseView)
}
