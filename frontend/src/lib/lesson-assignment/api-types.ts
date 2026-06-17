import type { QuizAnswersMap } from '@/lib/lesson-assignment/types'
import type { LessonDetailAssignment } from '@/lib/types/lesson'
import type { IRichTextEnvelope } from '@/lib/types/rich-text'

export type InstructionAttachmentApiRaw = {
  url?: string
  link?: string
  name?: string
  fileName?: string
  filename?: string
}

export type LessonAssignmentApiRaw = {
  uid?: string
  lesson_uid?: string
  title?: string
  task_type?: string
  task_description?: LessonDetailAssignment['task_description']
  quiz_payload?: LessonDetailAssignment['quiz_payload']
  allow_file_submission?: boolean | number | string
  allow_plain_text_submission?: boolean | number | string
  allow_rich_text_submission?: boolean | number | string
  require_file_description?: boolean | number | string
  instruction_attachments?: InstructionAttachmentApiRaw[]
  deadline_at?: string
  status?: string
  auto_close_after_deadline?: boolean | number | string
  allow_resubmit?: boolean | number | string
  max_resubmit_count?: number | null
  created_at?: string
  updated_at?: string
}

export type LessonAssignmentGradingApiRaw = {
  score_percent?: number | null
  passed?: boolean | null
  feedback?: string
  has_feedback?: boolean
  is_graded?: boolean
  graded_at?: string | null
  is_auto_graded?: boolean
  quiz_correct_count?: number | null
  quiz_question_count?: number | null
}

export type LessonAssignmentSubmissionApiRaw = {
  uid?: string
  plain_text?: string
  rich_text?: IRichTextEnvelope | string | null
  file_url?: string
  file_original_filename?: string
  file_description?: string
  quiz_answers?: QuizAnswersMap
  attempt_count?: number
  attempt_number?: number
  submitted_at?: string
  created_at?: string
  updated_at?: string
  grading?: LessonAssignmentGradingApiRaw
  score_percent?: number | null
  passed?: boolean | null
  feedback?: string
  graded_at?: string | null
  is_auto_graded?: boolean
  quiz_correct_count?: number | null
  quiz_question_count?: number | null
}

export type LessonAssignmentSubmissionBundleApiRaw = {
  submission_uid?: string
  latest_attempt_number?: number
  max_attempts?: number | null
  total_attempts?: number
  submissions?: LessonAssignmentSubmissionApiRaw[]
  submission?: LessonAssignmentSubmissionApiRaw
}

export type LessonAssignmentSubmissionJsonBody = {
  remove_file: boolean
  plain_text?: string
  rich_text?: IRichTextEnvelope | string
  file_description?: string
  quiz_answers?: QuizAnswersMap
}
