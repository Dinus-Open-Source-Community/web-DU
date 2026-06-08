import type {
  HomeworkTaskType,
  LessonAssignmentStatus,
  LessonAssignmentTaskType,
  LessonDeliveryType,
} from '../common/domain'
import type { IRichTextEnvelope, RichTextContentFormat } from './rich-text'

export interface IQuizOption {
  id: string
  label: string
}

export interface IQuizQuestion {
  id: string
  prompt: string | IRichTextEnvelope
  options: IQuizOption[]
  correctOptionId: string
  explanation?: string
}

export interface IQuiz {
  questions: IQuizQuestion[]
  passingScore?: number
}

export interface ILessonAssignmentInstructionAttachment {
  url: string
  name: string
}

export interface IHomeworkRulesDraft {
  allowFileSubmission: boolean
  allowPlainTextSubmission: boolean
  allowRichTextSubmission: boolean
  requireFileDescription: boolean
  deadlineAt: string
  status: LessonAssignmentStatus
  autoCloseAfterDeadline: boolean
  allowResubmit: boolean
  maxResubmitCount: number | null
  instructionAttachments: ILessonAssignmentInstructionAttachment[]
}

/** Response assignment lesson dari API (snake_case). */
export interface ILessonDetailAssignment {
  uid: string
  lesson_uid: string
  title: string
  task_type: LessonAssignmentTaskType
  task_description: IRichTextEnvelope | null
  quiz_payload: IQuiz | null
  allow_file_submission: boolean
  allow_plain_text_submission: boolean
  allow_rich_text_submission: boolean
  require_file_description: boolean
  instruction_attachments: ILessonAssignmentInstructionAttachment[]
  deadline_at: string
  status: LessonAssignmentStatus
  auto_close_after_deadline: boolean
  allow_resubmit: boolean
  max_resubmit_count: number | null
  created_at: string
  updated_at: string
}

/** Request body POST `/lessons`. */
export interface ILessonCreateRequest {
  module_uid: string
  title: string
  content_type: LessonDeliveryType
  content: IRichTextEnvelope | null
  video_url: string
  start_time?: string
  end_time?: string
  order_index: number
}

/** Request body PUT `/lessons/:uid`. */
export interface ILessonUpdateRequest {
  module_uid?: string
  title?: string
  content_type?: LessonDeliveryType
  content?: IRichTextEnvelope | null
  video_url?: string
  start_time?: string
  end_time?: string
  order_index?: number
}

/** Response lesson dari API. */
export interface ILessonResponse {
  uid: string
  module_uid: string
  title: string
  content_type: LessonDeliveryType
  content: IRichTextEnvelope | null
  video_url: string
  start_time: string
  end_time: string
  order_index: number
  created_at: string
  updated_at: string
  assignment?: ILessonDetailAssignment | null
}

export interface ILessonDetailItem extends ILessonResponse {
  is_reading?: boolean
}

export interface ILessonDetailListResponse {
  lessons: ILessonDetailItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

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
  homeworkRules?: IHomeworkRulesDraft
}

/** State lesson di editor kurikulum (frontend-only). */
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
export interface ILessonPayloadInput {
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

/** Alias backward-compat. */
export type LessonDetailAssignment = ILessonDetailAssignment
export type LessonDetailItem = ILessonDetailItem
export type CourseDetailLesson = ILessonResponse
export type LessonCreateRequest = ILessonCreateRequest
export type LessonUpdateRequest = ILessonUpdateRequest
export type LessonPayloadInput = ILessonPayloadInput
export type LessonDetailListResponse = ILessonDetailListResponse
export type LessonAssignmentInstructionAttachment = ILessonAssignmentInstructionAttachment
export type HomeworkRulesDraft = IHomeworkRulesDraft
