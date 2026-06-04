import type { IAuthorCourseItem, ICourseMentorItem } from './user'

export type BadgeVariant = 'free' | 'premium' | 'event' | 'draft'

export type CourseStatus = 'published' | 'draft' | 'pending' | 'rejected'

export type CourseLevel = 'Pemula' | 'Menengah' | 'Lanjutan'

export type CourseClassType = 'Free' | 'Premium' | 'Event'

export type CourseCategory = 'Pengembangan Web' | 'Desain UI/UX' | 'Data Science & AI' | 'Bisnis & Manajemen' | 'Cybersecurity'

export type ClassType = 'online' | 'offline'

// =====================
// Course Items
// =====================
// interface untuk data course
export interface ICourseItem {
  category_uid: string
  course_type_uid: string
  cover_url: string
  created_at: string
  created_by: IAuthorCourseItem
  description: string
  event_uid: string | null
  is_premium?: boolean
  is_published?: boolean
  level?: string
  mentors?: ICourseMentorItem[]
  price: number
  price_strike?: number
  rating?: number
  slot?: number
  slug: string
  status: string
  subtitle?: string
  thumbnail_url: string
  title: string
  total_reviews?: number
  uid: string
  updated_at?: string
  what_you_learn?: string[]
}

// =====================
// Categories & Course Types
// =====================
// type untuk category
export interface ICategoryItem {
  uid: string
  name: string
  description: string
  is_active: boolean
  courses?: ICourseItem[]
  created_at: string
  updated_at: string
}

// type untuk course type
export interface ICourseTypeItem {
  uid: string
  name: string
  description: string
  is_active: boolean
  courses?: ICourseItem[]
  created_at: string
  updated_at: string
}

// =====================
// List Responses
// =====================
// type untuk response course
export interface ICourseListResponse {
  courses: ICourseItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// type untuk response detail course
export type IDetailCourseResponse = ICourseDetailItem

// type untuk response category
export interface ICategoryListResponse {
  course_categories: ICategoryItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// type untuk response course type
export interface ICourseTypeListResponse {
  course_types: ICourseTypeItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface IModulesByCourseUidResponse {
  data: CourseDetailModule[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// =====================
// Course Detail
// =====================
// type untuk course detail
export interface CourseDetailReviewUser {
  avatar_url: string
  name: string
  uid: string
}

export interface CourseDetailReviewReply {
  comment: string
  created_at: string
  rating: number
  uid: string
  user: CourseDetailReviewUser
}

export interface CourseDetailReview {
  comment: string
  created_at: string
  rating: number
  replies: CourseDetailReviewReply[]
  uid: string
  user: CourseDetailReviewUser
}

export interface CourseDetailLesson {
  created_at: string
  module_uid: string
  title: string
  content_type: 'text' | 'video'
  content: LessonDetailContent | null
  video_url: string
  start_time: string
  end_time: string
  order_index: number
  uid: string
  updated_at: string
}

// =====================
// Lesson Detail
// =====================
// type untuk lesson detail
export interface LessonDetailContent {
  version: number
  contentHtml: string
  contentType: 'tiptap'
}

export interface LessonDetailItem {
  uid: string
  module_uid: string
  title: string
  content_type: 'text' | 'video'
  content: LessonDetailContent | null
  video_url: string
  start_time: string
  end_time: string
  order_index: number
  created_at: string
  updated_at: string
}

export type LessonDetailListResponse = {
  lessons: LessonDetailItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// =====================
// Modules Detail
// =====================
export interface IModulesDetail {
  uid: string
  course_uid: string
  title: string
  order_index: number
  created_at: string
  lessons: LessonDetailItem[]
}

// =====================
// Modules Summary
// =====================
export interface CourseDetailModule {
  course_uid: string
  created_at: string
  lessons: CourseDetailLesson[]
  order_index: number
  title: string
  uid: string
  updated_at?: string
}

export interface IModulesData {
  uid: string
  course_uid: string
  title: string
  order_index: number
  created_at: string
  lessons: CourseDetailLesson[]
}

// =====================
// Course Detail Item
// =====================
export interface ICourseDetailItem {
  category: ICategoryItem
  course_type: ICourseTypeItem
  cover_url: string
  created_at: string
  created_by: IAuthorCourseItem
  description: string
  event_uid: string | null
  is_premium: boolean
  is_published: boolean
  level: string
  mentors: ICourseMentorItem[]
  modules: CourseDetailModule[]
  price: number
  price_strike: number
  rating: number
  reviews: CourseDetailReview[]
  slot: number
  slug: string
  status: string
  subtitle: string
  thumbnail_url: string
  title: string
  total_reviews: number
  uid: string
  updated_at: string
  what_you_learn: string[]
}

export type ILesson = (ILessonBase & { contentType: 'video'; videoUrl: string; contentHtml?: string }) | (ILessonBase & { contentType: 'text'; contentHtml: string })

interface ILessonBase {
  id: string
  title: string
  order: number
  durationMinutes: number
  hasHomework?: boolean
  homeworkType?: HomeworkTaskType
  homeworkDescriptionHtml?: string
  homeworkQuiz?: IQuiz
}

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

export type LessonContentType = 'video' | 'text'
export type HomeworkTaskType = 'text' | 'quiz'

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

export type MentorAssignmentLifecycleStatus = 'draft' | 'published' | 'closed'
export type MentorAssignmentTaskType = 'text' | 'quiz'

export interface MentorAssignmentSubmissionConfig {
  allowFile: boolean
  allowPlainText: boolean
  allowRichText: boolean
  requireFileDescription: boolean
}

export type MentorAssignmentInput = Omit<IMentorCourseAssignment, 'uid' | 'courseId'>

export interface IMentorCourseAssignment {
  uid: string
  courseId: string
  /** Pertemuan ke-1 … ke-N (N = meetingCount kursus) */
  meetingNumber: number
  title: string
  taskType?: MentorAssignmentTaskType
  /** HTML dari editor (atau teks polos lama) */
  description: string
  quiz?: IQuiz
  deadlineAt: string
  status: MentorAssignmentLifecycleStatus
  autoCloseAfterDeadline: boolean
  allowResubmit: boolean
  maxAttempts?: number
  submissionConfig?: MentorAssignmentSubmissionConfig
  /** Lampiran instruksi mentor (URL aman / signed URL dari API). */
  instructionAttachments?: { fileName: string; url: string; mime?: string }[]
}

export interface AdminReview {
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
  authorUid?: string
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

/** Tugas per kursus (mentor). */

export interface MentorAssignmentSubmissionConfig {
  allowFile: boolean
  allowPlainText: boolean
  allowRichText: boolean
  requireFileDescription: boolean
}

export type SubmissionContentBlock =
  | { type: 'text'; text: string }
  | { type: 'html'; html: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'file'; fileName: string; url: string; mime?: string; description?: string }
  | { type: 'videoEmbed'; provider: 'youtube' | 'vimeo' | 'other'; embedUrl: string; title?: string }
  | {
      type: 'quiz'
      passingScore?: number
      answers: {
        questionId: string
        prompt: string
        selectedOptionId: string
        selectedLabel: string
      }[]
    }
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

export interface StudentEnrolledCourse {
  uid: string
  courseUid?: string
  studentUid?: string
  title: string
  image: string
  module: string
  progress: number
}
