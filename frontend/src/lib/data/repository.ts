/**
 * Repository sinkron — single entry point untuk seluruh seed data.
 *
 * Membaca `seed-data.json` saat module pertama kali di-import, lalu meng-index ke Map
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
  IMentorCourseAssignment,
  IMentorAssignmentSubmission,
} from '@/lib/types'
import { isMockDataEnabled } from '@/lib/config/mock-data'

import seedData from './json/seed-data.json'

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
  /** FK ke categories[].id */
  categoryId: string
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
  studentUid?: string
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
  authorUid?: string
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

const users = seedData.users as RawUser[]
const mentorProfiles = seedData.mentors as RawMentor[]
const categories = seedData.categories as RawCategory[]
const rawCourses = seedData.courses as RawCourse[]
const reviews = seedData.reviews as RawReview[]
const qaThreads = seedData.qaThreads as RawQaThread[]

const userById = new Map(users.map((u) => [u.id, u]))
const categoryById = new Map(categories.map((c) => [c.id, c]))

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
  const cat = categoryById.get(rc.categoryId)
  return {
    uid: rc.uid,
    variantBadge: rc.variantBadge as BadgeVariant,
    title: rc.title,
    description: rc.description,
    categoryId: rc.categoryId,
    category: cat?.name,
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

const studentsData = seedData.students as AdminStudent[]
const studentEnrolledData = seedData.studentEnrolledCourses as StudentEnrolledCourse[]
const administratorsData = seedData.administrators as AdminAdministrator[]
const ticketsData = seedData.tickets as AdminTicket[]
const txnData = seedData.transactions as TransactionsData
const payoutsData = seedData.payouts as AdminPayout[]
const couponsData = seedData.coupons as AdminCoupon[]
const auditLogsData = seedData.auditLogs as AdminAuditLog[]
const rbacData = seedData.rbac as RbacData
const analyticsData = seedData.analytics as AnalyticsData
const certificatesData = seedData.certificates as ICertificate[]
const assignmentSeedsData = seedData.assignmentSeeds as IMentorCourseAssignment[]
const submissionSeedsData = seedData.submissionSeeds as IMentorAssignmentSubmission[]
const schedulesData = seedData.schedules as IScheduleItem[]
const dashData = seedData.dashboard as DashboardData
const programFeaturesData = seedData.programFeatures as IProgramFeatureData[]
const courseExtrasData = seedData.courseExtras as CourseExtrasData

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
    coursesCount: coursesIndex.filter((c) => c.categoryId === cat.id).length,
  }))
}

export function listCourses(): ICardData[] {
  return coursesIndex
}

export function getCourseByUid(uid: string): ICardData | undefined {
  return courseByUid.get(uid)
}

export function getCourseBySlug(slug: string): ICardData | undefined {
  return coursesIndex.find((c) => {
    const s = c.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    return s === slug
  })
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

// ─── Public API: Assignment seeds ───────────────────────────────────────────

export function listMentorAssignmentSeeds(): IMentorCourseAssignment[] {
  return assignmentSeedsData
}

export function listMentorSubmissionSeeds(): IMentorAssignmentSubmission[] {
  return submissionSeedsData
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
    totalReviews: c.totalReviews,
    price: `Rp${(c.price / 1000).toFixed(0)}k`,
    mentor: c.author.name,
    mentorAvatar: c.author.avatar,
    description: c.description,
    variantBadge: c.variantBadge,
  }))
}

// ─── Public API: Mentor courses seed ────────────────────────────────────────

export function listMentorCoursesDummy(): IMentorCourse[] {
  return listCourses().map(toMentorCourseView)
}
