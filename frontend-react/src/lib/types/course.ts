import type { IAuthorCourseItem, ICourseMentorItem } from "./user";
import type { IQuiz } from "./lesson";

export type BadgeVariant = "free" | "premium" | "event" | "draft";

export type CourseStatus = "published" | "draft" | "pending" | "rejected";

export type CourseLevel = "Pemula" | "Menengah" | "Lanjutan";

export type CourseClassType = "Free" | "Premium" | "Event";

export type ClassType = "online" | "offline";

export type MentorCourseStudentStatus =
  | "Aktif"
  | "Selesai"
  | "Terlambat"
  | "Belum mulai";

// =====================
// Course Items
// =====================
export interface ICourseItem {
  category_uid: string;
  course_type_uid: string;
  cover_url: string;
  created_at: string;
  created_by: IAuthorCourseItem;
  description: string;
  event_uid: string | null;
  is_premium?: boolean;
  is_published?: boolean;
  level?: string;
  mentors?: ICourseMentorItem[];
  price: number;
  price_strike?: number;
  rating?: number;
  slot?: number;
  slug: string;
  status: string;
  subtitle?: string;
  thumbnail_url: string;
  title: string;
  total_reviews?: number;
  uid: string;
  updated_at?: string;
  what_you_learn?: string[];
}

// =====================
// Categories & Course Types
// =====================
export interface ICategoryItem {
  uid: string;
  name: string;
  description: string;
  is_active: boolean;
  courses?: ICourseItem[];
  created_at: string;
  updated_at: string;
}

export interface ICourseTypeItem {
  uid: string;
  name: string;
  description: string;
  is_active: boolean;
  courses?: ICourseItem[];
  created_at: string;
  updated_at: string;
}

// =====================
// List Responses
// =====================
export interface ICourseListResponse {
  courses: ICourseItem[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export type IDetailCourseResponse = ICourseDetailItem;

export interface ICategoryListResponse {
  course_categories: ICategoryItem[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ICourseTypeListResponse {
  course_types: ICourseTypeItem[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ICourseStudentListResponse {
  enrollments: IMentorCourseStudent[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// =====================
// Lesson & Module (re-export)
// =====================
export type {
  CourseDetailLesson,
  HomeworkTaskType,
  ILesson,
  IQuiz,
  IQuizOption,
  IQuizQuestion,
  LessonAssignmentInstructionAttachment,
  LessonAssignmentStatus,
  LessonAssignmentTaskType,
  LessonCreateRequest,
  LessonDeliveryType,
  LessonDetailAssignment,
  LessonDetailItem,
  LessonDetailListResponse,
  LessonPayloadInput,
  LessonUpdateRequest,
} from "./lesson";

export type {
  ParsedRichTextContent,
  RichTextContentFormat,
  RichTextEnvelope,
  TiptapEditorProps,
  TiptapEditorVariant,
} from "./rich-text";

export type {
  ICourseDetailModule,
  IModulesByCourseUidResponse,
  IModulesData,
  IModulesDetail,
} from "./module";

// =====================
// Course Detail
// =====================
export interface CourseDetailReviewUser {
  avatar_url: string;
  name: string;
  uid: string;
}

export interface CourseDetailReviewReply {
  comment: string;
  created_at: string;
  rating: number;
  uid: string;
  user: CourseDetailReviewUser;
}

export interface CourseDetailReview {
  comment: string;
  created_at: string;
  rating: number;
  replies: CourseDetailReviewReply[];
  uid: string;
  user: CourseDetailReviewUser;
}

import type { ICourseDetailModule } from "./module";

export interface ICourseDetailItem {
  category: ICategoryItem;
  course_type: ICourseTypeItem;
  cover_url: string;
  created_at: string;
  created_by: IAuthorCourseItem;
  description: string;
  event_uid: string | null;
  is_premium: boolean;
  is_published: boolean;
  level: string;
  mentors: ICourseMentorItem[];
  /** Opsional — modul/lesson di-fetch terpisah di halaman editor & viewer. */
  modules?: ICourseDetailModule[];
  price: number;
  price_strike: number;
  rating: number;
  reviews: CourseDetailReview[];
  slot: number;
  slug: string;
  status: string;
  subtitle: string;
  thumbnail_url: string;
  title: string;
  total_reviews: number;
  uid: string;
  updated_at: string;
  what_you_learn: string[];
}

export interface IMentorCourseStudent {
  enrollment_uid: string;
  student_uid: string;
  student_name: string;
  student_avatar_url: string;
  enrolled_at: string;
  progress: number;
  status: MentorCourseStudentStatus;
}

export type MentorAssignmentLifecycleStatus = "draft" | "published" | "closed";
export type MentorAssignmentTaskType = "text" | "quiz";

export interface MentorAssignmentSubmissionConfig {
  allowFile: boolean;
  allowPlainText: boolean;
  allowRichText: boolean;
  requireFileDescription: boolean;
}

export type MentorAssignmentInput = Omit<
  IMentorCourseAssignment,
  "uid" | "courseId"
>;

export interface IMentorCourseAssignment {
  uid: string;
  courseId: string;
  meetingNumber: number;
  title: string;
  taskType?: MentorAssignmentTaskType;
  description: string;
  quiz?: IQuiz;
  deadlineAt: string;
  status: MentorAssignmentLifecycleStatus;
  autoCloseAfterDeadline: boolean;
  allowResubmit: boolean;
  maxAttempts?: number;
  submissionConfig?: MentorAssignmentSubmissionConfig;
  instructionAttachments?: { fileName: string; url: string; mime?: string }[];
}

export interface AdminReview {
  uid: string;
  courseUid: string;
  studentUid?: string;
  courseTitle: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: { author: string; comment: string; createdAt: string };
}

export interface AdminQaReply {
  uid: string;
  author: string;
  authorAvatar: string;
  role: "student" | "mentor" | "admin";
  body: string;
  createdAt: string;
}

export interface AdminQaThread {
  uid: string;
  courseUid: string;
  authorUid?: string;
  courseTitle: string;
  title: string;
  author: string;
  authorAvatar: string;
  body: string;
  createdAt: string;
  repliesCount: number;
  status: "answered" | "unanswered";
  replies: AdminQaReply[];
}

export type SubmissionContentBlock =
  | { type: "text"; text: string }
  | { type: "html"; html: string }
  | { type: "image"; url: string; alt?: string }
  | {
      type: "file";
      fileName: string;
      url: string;
      mime?: string;
      description?: string;
    }
  | {
      type: "videoEmbed";
      provider: "youtube" | "vimeo" | "other";
      embedUrl: string;
      title?: string;
    }
  | {
      type: "quiz";
      passingScore?: number;
      answers: {
        questionId: string;
        prompt: string;
        selectedOptionId: string;
        selectedLabel: string;
      }[];
    }
  | { type: "link"; url: string; label?: string };

export type MentorSubmissionReviewStatus =
  | "pending_review"
  | "graded"
  | "returned";

export interface IMentorAssignmentSubmission {
  uid: string;
  assignmentUid: string;
  courseId: string;
  studentUid: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  attemptNumber: number;
  contentBlocks: SubmissionContentBlock[];
  reviewStatus: MentorSubmissionReviewStatus;
  rating: number | null;
  mentorComment: string | null;
  reviewedAt: string | null;
}

export interface IMentorAssignmentStats {
  activeAssignments: number;
  awaitingReview: number;
  dueSoonCount: number;
  resubmitAwaitingReview: number;
}

export interface StudentEnrolledCourse {
  uid: string;
  courseUid?: string;
  studentUid?: string;
  title: string;
  image: string;
  module: string;
  progress: number;
}
