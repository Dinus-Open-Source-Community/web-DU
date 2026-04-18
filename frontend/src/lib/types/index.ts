export type BadgeVariant = 'free' | 'premium' | 'event' | 'draft'

export type CourseStatus = 'published' | 'draft' | 'pending' | 'rejected'

export interface ICardData {
  uid: string
  variantBadge: BadgeVariant
  title: string
  description: string
  category?: string
  author: {
    name: string
    avatar: string
  }
  rating: number
  totalReviews: number
  image: string
  price: number
  status: CourseStatus
  mentorUid: string
  enrolled: number
  modules: IModule[]
  duration: string
  strikePrice?: number
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

export interface IProgramFeatures {
  title: string
  description: string
  icon: React.ReactNode
}

export interface IDashboardStat {
  label: string
  value: number | string
  iconName: 'Book' | 'ClipboardCheck' | 'Award' | 'CheckCircle'
}

export interface IResumeCourse {
  title: string
  module: string
  progress: number
  image?: string
  description?: string
  variantBadge?: BadgeVariant
  /** Jika diisi, kartu "Lanjut" menuju preview modul kursus ini */
  courseUid?: string
  author?: {
    name: string
    avatar: string
  }
  rating?: number
  totalReviews?: number
}

export interface IDeadlineItem {
  month: string
  day: string
  title: string
  course: string
  isPast?: boolean
}

export interface IFeedbackItem {
  status: 'Lulus' | 'Perlu Revisi'
  time: string
  title: string
  comment: string
  instructor: {
    name: string
    avatar: string
  }
}

// ─── Transaksi (selaraskan dengan respons API pembayaran / invoice) ───
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED'

export type TransactionSortKey = 'transactionId' | 'courseName' | 'classType' | 'price' | 'paymentStatus'

export type SortDirection = 'asc' | 'desc'

/** Satu baris riwayat transaksi pembelian kursus (FE). */
export interface TransactionHistoryItem {
  uid: string
  transactionId: string
  courseImage: string
  courseName: string
  classType: 'Premium' | 'Bootcamp' | 'Free'
  price: number
  paymentStatus: PaymentStatus
  purchasedAt: string
  paymentMethod: 'Bank Transfer' | 'Virtual Account' | 'E-Wallet' | 'QRIS'
  qrImage?: string
}

export interface ICertificate {
  uid: string
  title: string
  courseName: string
  issuedDate: string
  category: string
  credentialId: string
  imageUrl?: string
}

// Attendance types
export type AttendanceStatus = 'Hadir' | 'Izin' | 'Alpha'

export interface IAttendanceSummary {
  totalMeetings: number
  hadir: number
  izin: number
  alpha: number
  progressPercentage: number
}

export interface IAttendanceRecord {
  uid: string
  meetingNumber: number
  date: string
  topic: string
  status: AttendanceStatus
  notes?: string
}

export interface ICourseAttendance {
  courseId: string
  courseName: string
  author: {
    name: string
    avatar?: string
  }
  image?: string
  summary: IAttendanceSummary
  records: IAttendanceRecord[]
}

// User Profile types
export interface IUserProfile {
  uid: string
  name: string
  email: string
  role: string
  avatar: string
  lastUpdated: string
  currency: string
  language: string
}

// Mentor Dashboard types
export type SubmissionStatus = 'Submitted' | 'Late' | 'Pending'
export type ClassType = 'online' | 'offline'

export interface IMentorStats {
  pendingGrading: number
  unansweredQA: number
  activeStudents: number
  totalCourses: number
}

export interface IScheduleItem {
  uid: string
  courseId: string
  courseName: string
  scheduleDate: string
  scheduleTime: string
  endTime: string
  location: string
  classType: ClassType
  studentCount: number
}

export interface ISubmissionItem {
  uid: string
  studentName: string
  studentAvatar: string
  courseName: string
  assignmentTitle: string
  submissionDate: string
  status: SubmissionStatus
  daysLate?: number
}

// ─── Quiz & Lesson types ────────────────────────────────────────────────────

export interface IQuizOption {
  id: string
  label: string
}

export interface IQuizQuestion {
  id: string
  prompt: string
  options: IQuizOption[]
  correctOptionId: string
  explanation?: string
}

export interface IQuiz {
  questions: IQuizQuestion[]
  passingScore?: number
}

export type LessonContentType = 'tiptap' | 'video' | 'quiz'

interface ILessonBase {
  id: string
  title: string
  order: number
  durationMinutes: number
}

export type ILesson =
  | (ILessonBase & { contentType: 'tiptap'; contentHtml: string })
  | (ILessonBase & { contentType: 'video'; videoUrl: string; contentHtml?: string })
  | (ILessonBase & { contentType: 'quiz'; quiz: IQuiz })

export interface IModule {
  id: string
  title: string
  order: number
  lessons: ILesson[]
}

/** @deprecated Alias — gunakan `IModule` untuk kode baru. */
export type ICourseModule = IModule

export interface ICourseModulesState {
  version: 2
  modules: IModule[]
}

/** Kursus milik mentor — metadata tampilan editor & daftar (sinkronkan dengan API kursus). */
export interface IMentorCourse {
  uid: string
  title: string
  /** Teks header / subtitle singkat di kartu & editor */
  header: string
  description?: string
  image?: string
  published: boolean
  moduleCount: number
  /** Jumlah pertemuan (untuk dropdown tugas per pertemuan); default dihitung jika tidak ada */
  meetingCount?: number
  studentCount: number
  rating: number
  totalReviews: number
  updatedAt?: string
}

/** Status peserta pada tabel mentor. */
export type MentorCourseStudentStatus = 'Aktif' | 'Selesai' | 'Terlambat' | 'Belum mulai'

/** Baris peserta per kursus — progress & absensi untuk tabel mentor */
export interface IMentorCourseStudent {
  uid: string
  name: string
  email?: string
  avatar?: string
  progressPercent: number
  attendancePresent: number
  attendanceTotal: number
  status: MentorCourseStudentStatus
  lastActiveLabel: string
}

// ─── Mentor attendance (jadwal + sesi per tanggal; sementara client storage) ─

/** Jadwal pertemuan berulang: cocok jika weekday sama dengan hari ini */
export interface IMentorClassScheduleEntry {
  id: string
  courseUid: string
  /** 0 = Minggu … 6 = Sabtu */
  weekday: number
  /** Label tampilan, mis. "09:00" */
  timeLabel: string
}

export type MentorAttendanceApprovalMode = 'review' | 'auto'

/** Status absensi efektif untuk satu siswa pada satu sesi */
export type MentorSessionAttendanceStatus = 'belum' | 'hadir' | 'izin' | 'alpha'

/** Satu baris absensi per siswa dalam sesi (tanggal tertentu) */
export interface IMentorSessionStudentAttendance {
  effective: MentorSessionAttendanceStatus
  /** Permintaan dari siswa yang menunggu persetujuan mentor (mode review) */
  pendingKind: 'hadir' | 'izin' | null
}

export interface IMentorAttendanceSessionState {
  meetingNumber: number
  approvalMode: MentorAttendanceApprovalMode
  byStudent: Record<string, IMentorSessionStudentAttendance>
}

/** Kartu di hub: kursus + slot jadwal untuk hari ini */
export interface IMentorTodayClassCard {
  scheduleId: string
  courseUid: string
  timeLabel: string
  title: string
  header: string
  image?: string
}

// ─── Mentor course assignments (per kursus) ─────────────────────────────────

export type MentorAssignmentLifecycleStatus = 'draft' | 'published' | 'closed'

export interface IMentorCourseAssignment {
  uid: string
  courseId: string
  /** Pertemuan ke-1 … ke-N (N = meetingCount kursus) */
  meetingNumber: number
  title: string
  /** HTML dari editor (atau teks polos lama) */
  description: string
  deadlineAt: string
  status: MentorAssignmentLifecycleStatus
  autoCloseAfterDeadline: boolean
  allowResubmit: boolean
  maxAttempts?: number
  /** Lampiran instruksi mentor (URL aman / signed URL dari API). */
  instructionAttachments?: { fileName: string; url: string; mime?: string }[]
}

export type SubmissionContentBlock =
  | { type: 'text'; text: string }
  | { type: 'html'; html: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'file'; fileName: string; url: string; mime?: string }
  | { type: 'videoEmbed'; provider: 'youtube' | 'vimeo' | 'other'; embedUrl: string; title?: string }
  | { type: 'link'; url: string; label?: string }

export type MentorSubmissionReviewStatus = 'pending_review' | 'graded' | 'returned'

export interface IMentorAssignmentSubmission {
  uid: string
  assignmentUid: string
  courseId: string
  studentUid: string
  studentName: string
  studentAvatar: string
  submittedAt: string
  attemptNumber: number
  contentBlocks: SubmissionContentBlock[]
  reviewStatus: MentorSubmissionReviewStatus
  rating: number | null
  mentorComment: string | null
  reviewedAt: string | null
}

/** Statistik khusus halaman tugas (tidak harus sama dengan dashboard mentor) */
export interface IMentorAssignmentStats {
  activeAssignments: number
  awaitingReview: number
  dueSoonCount: number
  resubmitAwaitingReview: number
}

export type DeadlineUrgency = 'overdue' | 'due_soon' | 'ok' | 'closed'

// ─── Admin / dashboard types (migrated from admin-fixtures) ─────────────────

export interface AdminKpi {
  id: string
  label: string
  value: string
  trendValue: number
  trendDirection: 'up' | 'down' | 'neutral'
  trendLabel: string
  iconName: 'revenue' | 'users' | 'transactions' | 'conversion' | 'ticket' | 'paid' | 'pending' | 'failed'
}

export interface AdminTicket {
  uid: string
  subject: string
  studentName: string
  studentAvatar: string
  createdAt: string
  severity: 'high' | 'medium' | 'low'
  category: 'Payment' | 'Course Content' | 'Account' | 'Certificate' | 'Other'
}

export type AdminStatus = 'active' | 'inactive' | 'pending'

export interface AdminStudent {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  enrolledCourses: number
  averageProgress: number
  status: AdminStatus
  totalSpent: number
  phone?: string
  lastActive: string
}

export interface StudentEnrolledCourse {
  uid: string
  title: string
  image: string
  module: string
  progress: number
}

export type MentorSpecialization = 'Development' | 'Design' | 'Data & AI' | 'Marketing' | 'Business' | 'Language'

export interface AdminMentor {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  totalCourses: number
  rating: number
  totalReviews: number
  status: AdminStatus
  specializations: MentorSpecialization[]
  bio?: string
  studentsCount: number
}

export interface AdminAdministrator {
  uid: string
  name: string
  email: string
  avatar: string
  role: 'Super Admin' | 'Admin' | 'Finance' | 'Content Moderator' | 'Support'
  lastActive: string
  status: AdminStatus
  createdAt: string
}

export type CourseCategory = 'Pengembangan Web' | 'Desain UI/UX' | 'Data Science & AI' | 'Bisnis & Manajemen' | 'Cybersecurity'

export type AdminCourse = ICardData

export interface AdminReview {
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

export interface AdminQaReply {
  uid: string
  author: string
  authorAvatar: string
  role: 'student' | 'mentor' | 'admin'
  body: string
  createdAt: string
}

export interface AdminQaThread {
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
  replies: AdminQaReply[]
}

export interface AdminTransaction extends TransactionHistoryItem {
  studentName: string
  studentAvatar: string
}

export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected'

export interface AdminPayout {
  uid: string
  mentorUid: string
  mentorName: string
  mentorAvatar: string
  amount: number
  bankName: string
  accountNumber: string
  accountHolder: string
  requestedAt: string
  status: PayoutStatus
}

export type CouponType = 'percent' | 'flat'
export type CouponStatus = 'active' | 'expired' | 'scheduled'

export interface AdminCoupon {
  uid: string
  code: string
  type: CouponType
  value: number
  minPurchase: number
  usageLimit: number
  used: number
  startsAt: string
  endsAt: string
  status: CouponStatus
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'

export interface AdminAuditLog {
  uid: string
  timestamp: string
  actorName: string
  actorAvatar: string
  actorRole: string
  action: AuditAction
  resource: string
  resourceId: string
  ip: string
  detail: string
}

export interface AdminRole {
  uid: string
  name: string
  description: string
  membersCount: number
  permissions: string[]
}

export interface AdminPermissionGroup {
  group: string
  items: string[]
}

export interface IProgramFeatureData {
  title: string
  description: string
  iconName: 'book' | 'globe' | 'job' | 'certificate'
}

export interface AdminCategoryItem {
  uid: string
  name: CourseCategory
  coursesCount: number
  colorVariant: string
}

export interface CourseFeedbackBreakdown {
  stars: number
  percent: number
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface TransactionTimelinePoint {
  label: string
  paid: number
  pending: number
  failed: number
  [key: string]: string | number
}

export interface EngagementTrendPoint {
  label: string
  active: number
  completed: number
  [key: string]: string | number
}

export interface ChartRatioPoint {
  label: string
  value: number
  color: string
}

export interface AnalyticsData {
  kpis: AdminKpi[]
  revenueLine30d: ChartDataPoint[]
  newUsersWeek: ChartDataPoint[]
  topCoursesByEnrolment: ChartDataPoint[]
  transactionTimeline30d: TransactionTimelinePoint[]
  transactionRatio: ChartRatioPoint[]
  learningEngagementTrend: EngagementTrendPoint[]
  completionRateByCategory: ChartDataPoint[]
  dropOffFunnel: ChartDataPoint[]
  monthlyRevenue12m: ChartDataPoint[]
  revenueByCategory: ChartDataPoint[]
  revenueSourceRatio: ChartRatioPoint[]
}

export interface DashboardData {
  stats: IDashboardStat[]
  resumeCourses: IResumeCourse[]
  deadlines: IDeadlineItem[]
  feedbacks: IFeedbackItem[]
  profile: {
    uid: string
    name: string
    email: string
    role: string
    avatar: string
    lastUpdated: string
  }
  mentorStats: IMentorStats
}

export interface TransactionsData {
  recent: TransactionHistoryItem[]
  history: TransactionHistoryItem[]
  admin: AdminTransaction[]
}

export interface RbacData {
  permissionGroups: AdminPermissionGroup[]
  roles: AdminRole[]
}

export interface CourseExtrasData {
  whatYouLearn: string[]
  feedbackBreakdown: CourseFeedbackBreakdown[]
  mentorSpecColors: Record<string, string>
}
