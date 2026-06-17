import type { SubmissionContentBlock } from '@/lib/types/course'
import type {
  ICourseStaffSubmission,
  ICourseStaffSubmissionStudent,
  CourseStaffGradingStatus,
} from '@/lib/types/features/course-detail-assignments'
import type { ILessonDetailAssignment, IQuiz, IQuizQuestion } from '@/lib/types/lesson'
import type { IRichTextEnvelope } from '@/lib/types/rich-text'
import type { QuizAnswersMap } from '@/lib/lesson-assignment/types'

type RawSubmissionUser = {
  uid?: string
  name?: string
  avatar_url?: string
}

export type RawStaffSubmission = {
  uid?: string
  user_uid?: string
  plain_text?: string
  rich_text?: IRichTextEnvelope | string | null
  file_url?: string
  file_original_filename?: string
  file_description?: string
  quiz_answers?: QuizAnswersMap
  score_percent?: number | null
  passed?: boolean | null
  feedback?: string
  graded_at?: string | null
  graded_by_uid?: string | null
  is_auto_graded?: boolean
  quiz_correct_count?: number | null
  quiz_question_count?: number | null
  attempt_count?: number
  updated_at?: string
  created_at?: string
  user?: RawSubmissionUser
}

export type StaffSubmissionsListApiRaw = {
  submissions?: RawStaffSubmission[]
}

function resolveGradingStatus(gradedAt: string | null | undefined): CourseStaffGradingStatus {
  return gradedAt ? 'graded' : 'pending'
}

function resolveStudent(raw: RawStaffSubmission): ICourseStaffSubmissionStudent {
  const user = raw.user
  return {
    uid: String(user?.uid ?? raw.user_uid ?? ''),
    name: String(user?.name ?? 'Siswa'),
    avatar_url: String(user?.avatar_url ?? ''),
  }
}

function resolveGradedByUid(raw: RawStaffSubmission): string | null {
  if (!raw.graded_by_uid) return null
  return String(raw.graded_by_uid)
}

function extractPromptText(prompt: string | IRichTextEnvelope): string {
  if (typeof prompt === 'string') return prompt
  return prompt.contentHtml?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Pertanyaan'
}

function parseRichTextHtml(value: IRichTextEnvelope | string | null | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'object' && typeof value.contentHtml === 'string' && value.contentHtml.trim()) {
    return value.contentHtml
  }
  return null
}

function buildQuizContentBlocks(
  quizPayload: IQuiz | null,
  quizAnswers: QuizAnswersMap | undefined,
): SubmissionContentBlock[] {
  if (!quizPayload?.questions?.length) return []

  const answers = quizAnswers ?? {}
  const blocks: SubmissionContentBlock[] = [
    {
      type: 'quiz',
      passingScore: quizPayload.passingScore,
      answers: quizPayload.questions.map((question: IQuizQuestion) => {
        const selectedOptionId = String(answers[question.id] ?? '')
        const selectedOption = question.options.find((option) => option.id === selectedOptionId)
        return {
          questionId: question.id,
          prompt: extractPromptText(question.prompt),
          selectedOptionId,
          selectedLabel: selectedOption?.label ?? (selectedOptionId ? selectedOptionId : 'Belum dijawab'),
        }
      }),
    },
  ]

  return blocks
}

function buildTextContentBlocks(raw: RawStaffSubmission): SubmissionContentBlock[] {
  const blocks: SubmissionContentBlock[] = []

  if (raw.plain_text?.trim()) {
    blocks.push({ type: 'text', text: raw.plain_text.trim() })
  }

  const richHtml = parseRichTextHtml(raw.rich_text)
  if (richHtml) {
    blocks.push({ type: 'html', html: richHtml })
  }

  if (raw.file_url?.trim()) {
    blocks.push({
      type: 'file',
      fileName: raw.file_original_filename?.trim() || 'Lampiran',
      url: raw.file_url,
      description: raw.file_description?.trim() || undefined,
    })
  }

  return blocks
}

export function mapStaffSubmission(
  raw: RawStaffSubmission,
  context: {
    lessonUid: string
    lessonTitle: string
    moduleTitle: string
    assignment: ILessonDetailAssignment
  },
): ICourseStaffSubmission | null {
  if (!raw.uid) return null

  const taskType = context.assignment.task_type
  const contentBlocks =
    taskType === 'quiz'
      ? buildQuizContentBlocks(context.assignment.quiz_payload, raw.quiz_answers)
      : buildTextContentBlocks(raw)

  return {
    uid: String(raw.uid),
    lessonUid: context.lessonUid,
    lessonTitle: context.lessonTitle,
    moduleTitle: context.moduleTitle,
    assignmentUid: context.assignment.uid,
    assignmentTitle: context.assignment.title,
    taskType,
    student: resolveStudent(raw),
    submittedAt: String(raw.updated_at ?? raw.created_at ?? ''),
    attemptCount: typeof raw.attempt_count === 'number' ? raw.attempt_count : 1,
    scorePercent: typeof raw.score_percent === 'number' ? raw.score_percent : null,
    passed: typeof raw.passed === 'boolean' ? raw.passed : null,
    feedback: raw.feedback?.trim() || null,
    gradedAt: raw.graded_at ?? null,
    gradedByUid: resolveGradedByUid(raw),
    isAutoGraded: Boolean(raw.is_auto_graded),
    quizCorrectCount:
      typeof raw.quiz_correct_count === 'number' ? raw.quiz_correct_count : null,
    quizQuestionCount:
      typeof raw.quiz_question_count === 'number' ? raw.quiz_question_count : null,
    contentBlocks,
    gradingStatus: resolveGradingStatus(raw.graded_at),
  }
}

export function mapStaffSubmissionsList(
  raw: StaffSubmissionsListApiRaw,
  context: {
    lessonUid: string
    lessonTitle: string
    moduleTitle: string
    assignment: ILessonDetailAssignment
  },
): ICourseStaffSubmission[] {
  if (!Array.isArray(raw.submissions)) return []

  return raw.submissions
    .map((item) => mapStaffSubmission(item, context))
    .filter((item): item is ICourseStaffSubmission => item !== null)
}
