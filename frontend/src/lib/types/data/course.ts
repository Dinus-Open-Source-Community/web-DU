import type {
  BadgeVariant,
  ClassType,
  CourseClassType,
  MentorAssignmentLifecycleStatus,
  MentorAssignmentTaskType,
  MentorCourseStudentStatus,
  MentorSubmissionReviewStatus,
} from '../common/domain'
import type { IPaginationMeta } from '../common/pagination'
import type { IAuthorCourseItem, ICourseMentorItem } from './user'
import type { IQuiz } from './lesson'
import type { ICourseDetailModule } from './module'

export interface ICourseItem {
  category_uid: string
  course_type_uid: string
  cover_url: string
  created_at: string
  created_by?: IAuthorCourseItem
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

export interface ICategoryItem {
  uid: string
  name: string
  description: string
  is_active: boolean
  courses?: ICourseItem[]
  created_at: string
  updated_at: string
}

export interface ICourseTypeItem {
  uid: string
  name: string
  description: string
  is_active: boolean
  courses?: ICourseItem[]
  created_at: string
  updated_at: string
}

export interface ICourseListResponse {
  courses: ICourseItem[]
  meta: IPaginationMeta
}

export interface ICategoryListResponse {
  course_categories: ICategoryItem[]
  meta: IPaginationMeta
}

export interface ICourseTypeListResponse {
  course_types: ICourseTypeItem[]
  meta: IPaginationMeta
}

export interface ICourseReviewUser {
  avatar_url: string
  name: string
  uid: string
}

export interface ICourseReviewReply {
  comment: string
  created_at: string
  rating?: number
  uid: string
  user: ICourseReviewUser
  replier?: ICourseReviewUser | null
}

export interface ICourseDetailReview {
  comment: string
  created_at: string
  rating: number
  replies: ICourseReviewReply[]
  uid: string
  user: ICourseReviewUser
}

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
  modules?: ICourseDetailModule[]
  price: number
  price_strike: number
  rating: number
  reviews: ICourseDetailReview[]
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

export interface IMentorCourseStudent {
  enrollment_uid: string
  student_uid: string
  student_name: string
  student_avatar_url: string
  enrolled_at: string
  progress: number
  status: MentorCourseStudentStatus
  student_attendance_present?: number
  student_attendance_total?: number
}

export interface ICourseStudentListResponse {
  enrollments?: IMentorCourseStudent[] | null
  meta: IPaginationMeta
}

export interface IMentorAssignmentSubmissionConfig {
  allowFile: boolean
  allowPlainText: boolean
  allowRichText: boolean
  requireFileDescription: boolean
}

export interface IMentorCourseAssignment {
  uid: string
  courseId: string
  meetingNumber: number
  title: string
  taskType?: MentorAssignmentTaskType
  description: string
  quiz?: IQuiz
  deadlineAt: string
  status: MentorAssignmentLifecycleStatus
  autoCloseAfterDeadline: boolean
  allowResubmit: boolean
  maxAttempts?: number
  submissionConfig?: IMentorAssignmentSubmissionConfig
  instructionAttachments?: { fileName: string; url: string; mime?: string }[]
}

export type MentorAssignmentInput = Omit<IMentorCourseAssignment, 'uid' | 'courseId'>

export interface IAdminReview {
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

export interface IAdminQaReply {
  uid: string
  author: string
  authorAvatar: string
  role: 'student' | 'mentor' | 'admin'
  body: string
  createdAt: string
}

export interface IAdminQaThread {
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
  replies: IAdminQaReply[]
}

export type SubmissionContentBlock =
  | { type: 'text'; text: string }
  | { type: 'html'; html: string }
  | { type: 'image'; url: string; alt?: string }
  | {
      type: 'file'
      fileName: string
      url: string
      mime?: string
      description?: string
    }
  | {
      type: 'videoEmbed'
      provider: 'youtube' | 'vimeo' | 'other'
      embedUrl: string
      title?: string
    }
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

export interface IMentorAssignmentStats {
  activeAssignments: number
  awaitingReview: number
  dueSoonCount: number
  resubmitAwaitingReview: number
}

export interface ICourseReadingProgress {
  course_uid: string
  total_lessons: number
  lessons_read: number
  progress: number
  enrollment_uid?: string | null
  enrollment_status?: string | null
}

export interface IStudentEnrolledCourse {
  uid: string
  courseUid?: string
  studentUid?: string
  title: string
  image: string
  module: string
  progress: number
}

/** Alias backward-compat. */
export type IDetailCourseResponse = ICourseDetailItem
export type CourseDetailReviewUser = ICourseReviewUser
export type CourseDetailReviewReply = ICourseReviewReply
export type CourseDetailReview = ICourseDetailReview
export type AdminReview = IAdminReview
export type AdminQaReply = IAdminQaReply
export type AdminQaThread = IAdminQaThread
export type MentorAssignmentSubmissionConfig = IMentorAssignmentSubmissionConfig
export type CourseReadingProgress = ICourseReadingProgress
export type StudentEnrolledCourse = IStudentEnrolledCourse
export type { BadgeVariant, ClassType, CourseClassType }
