import type { RichTextContentFormat, RichTextEnvelope } from './rich-text'

// =====================
// Lesson delivery (BE: content_type)
// =====================

/**
 * Cara lesson disampaikan — field API `content_type`.
 * - `text` — konten utama di `content` (rich text envelope), `video_url` harus kosong
 * - `video` — video YouTube di `video_url`, `content` harus null (BE menghapus content)
 */
export type LessonDeliveryType = 'text' | 'video'

// =====================
// Quiz (lesson homework / assignment)
// =====================

export interface IQuizOption {
  id: string
  label: string
}

export interface IQuizQuestion {
  id: string
  /** Plain string atau rich text envelope dari backend. */
  prompt: string | RichTextEnvelope
  options: IQuizOption[]
  correctOptionId: string
  explanation?: string
}

export interface IQuiz {
  questions: IQuizQuestion[]
  passingScore?: number
}

export type HomeworkTaskType = 'text' | 'quiz'

// =====================
// Lesson assignment (BE: lesson_assignments)
// =====================

export type LessonAssignmentTaskType = 'text' | 'quiz'
export type LessonAssignmentStatus = 'DRAFT' | 'TERBIT' | 'DITUTUP'

export interface LessonAssignmentInstructionAttachment {
  url: string
  name: string
}

export type HomeworkRulesDraft = {
  allowFileSubmission: boolean
  allowPlainTextSubmission: boolean
  allowRichTextSubmission: boolean
  requireFileDescription: boolean
  deadlineAt: string
  status: LessonAssignmentStatus
  autoCloseAfterDeadline: boolean
  allowResubmit: boolean
  maxResubmitCount: number | null
  instructionAttachments: LessonAssignmentInstructionAttachment[]
}

export interface LessonDetailAssignment {
  uid: string
  lesson_uid: string
  title: string
  task_type: LessonAssignmentTaskType
  task_description: RichTextEnvelope | null
  quiz_payload: IQuiz | null
  allow_file_submission: boolean
  allow_plain_text_submission: boolean
  allow_rich_text_submission: boolean
  require_file_description: boolean
  instruction_attachments: LessonAssignmentInstructionAttachment[]
  deadline_at: string
  status: LessonAssignmentStatus
  auto_close_after_deadline: boolean
  allow_resubmit: boolean
  max_resubmit_count: number | null
  created_at: string
  updated_at: string
}

// =====================
// Lesson API (BE: dto.LessonCreateRequest / LessonUpdateRequest / LessonResponse)
// =====================

/** Request body POST `/lessons` — selaras `dto.LessonCreateRequest`. */
export interface LessonCreateRequest {
  module_uid: string
  title: string
  /** Tipe penyampaian lesson (`text` | `video`). */
  content_type: LessonDeliveryType
  /**
   * Rich text envelope — wajib untuk `content_type: "text"`.
   * Harus `null` untuk `content_type: "video"` (BE mengabaikan/menghapus).
   */
  content: RichTextEnvelope | null
  /** Wajib untuk video (YouTube). Kosong untuk text. */
  video_url: string
  start_time?: string
  end_time?: string
  order_index: number
}

/** Request body PUT `/lessons/:uid` — selaras `dto.LessonUpdateRequest`. */
export interface LessonUpdateRequest {
  module_uid?: string
  title?: string
  content_type?: LessonDeliveryType
  content?: RichTextEnvelope | null
  video_url?: string
  start_time?: string
  end_time?: string
  order_index?: number
}

/** Response lesson dari API — selaras `dto.LessonResponse` / `entity.Lesson`. */
export interface CourseDetailLesson {
  uid: string
  module_uid: string
  title: string
  content_type: LessonDeliveryType
  content: RichTextEnvelope | null
  video_url: string
  start_time: string
  end_time: string
  order_index: number
  created_at: string
  updated_at: string
  assignment?: LessonDetailAssignment | null
}

export interface LessonDetailItem extends CourseDetailLesson {
  is_reading?: boolean
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
// Editor state (frontend-only)
// =====================

interface ILessonEditorBase {
  id: string
  title: string
  order: number
  durationMinutes: number
  hasHomework?: boolean
  homeworkTitle?: string
  homeworkAssignmentUid?: string | null
  homeworkType?: HomeworkTaskType
  homeworkDescriptionHtml?: string
  homeworkQuiz?: IQuiz
  homeworkRules?: HomeworkRulesDraft
}

/**
 * State lesson di editor kurikulum.
 * `contentType` = delivery type (`text`|`video`), BUKAN format rich text.
 * `contentFormat` = format envelope (`tiptap`|`html`).
 */
export type ILesson =
  | (ILessonEditorBase & {
      contentType: 'video'
      videoUrl: string
      contentHtml?: string
      contentFormat?: RichTextContentFormat
    })
  | (ILessonEditorBase & {
      contentType: 'text'
      contentHtml: string
      contentFormat?: RichTextContentFormat
    })

/** Input untuk membangun payload create/update lesson. */
export interface LessonPayloadInput {
  module_uid: string
  title: string
  order_index: number
  deliveryType: LessonDeliveryType
  contentHtml?: string
  contentFormat?: RichTextContentFormat
  videoUrl?: string
  start_time?: string
  end_time?: string
}
