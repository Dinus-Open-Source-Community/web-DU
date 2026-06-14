import type { SubmissionContentBlock } from '@/lib/types/course'
import type {
  ICourseStaffSubmission,
  ICourseStaffSubmissionStudent,
  CourseStaffGradingStatus,
} from '@/lib/types/features/course-detail-assignments'
import type { ILessonDetailAssignment, IQuiz, IQuizQuestion } from '@/lib/types/lesson'
import type { IRichTextEnvelope } from '@/lib/types/rich-text'

type RawSubmissionUser = {
  uid?: string
  name?: string
  avatar_url?: string
}

type RawSubmission = {
  uid?: string
  user_uid?: string
  plain_text?: string
  rich_text?: unknown
  file_url?: string
  file_original_filename?: string
  file_description?: string
  quiz_answers?: Record<string, unknown>
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

function resolveGradingStatus(gradedAt: string | null | undefined): CourseStaffGradingStatus {
  return gradedAt ? 'graded' : 'pending'
}

function resolveStudent(raw: RawSubmission): ICourseStaffSubmissionStudent {
  const user = raw.user
  return {
    uid: String(user?.uid ?? raw.user_uid ?? ''),
    name: String(user?.name ?? 'Siswa'),
    avatar_url: String(user?.avatar_url ?? ''),
  }
}

function resolveGradedByUid(raw: RawSubmission): string | null {
  if (!raw.graded_by_uid) return null
  return String(raw.graded_by_uid)
}

function extractPromptText(prompt: string | IRichTextEnvelope): string {
  if (typeof prompt === 'string') return prompt
  return prompt.contentHtml?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Pertanyaan'
}

function parseRichTextHtml(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const envelope = value as IRichTextEnvelope
  if (typeof envelope.contentHtml === 'string' && envelope.contentHtml.trim()) {
    return envelope.contentHtml
  }
  return null
}

function buildQuizContentBlocks(
  quizPayload: IQuiz | null,
  quizAnswers: Record<string, unknown> | undefined,
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

function buildTextContentBlocks(raw: RawSubmission): SubmissionContentBlock[] {
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
  raw: unknown,
  context: {
    lessonUid: string
    lessonTitle: string
    moduleTitle: string
    assignment: ILessonDetailAssignment
  },
): ICourseStaffSubmission | null {
  if (!raw || typeof raw !== 'object') return null

  const data = raw as RawSubmission
  if (!data.uid) return null

  const taskType = context.assignment.task_type
  const contentBlocks =
    taskType === 'quiz'
      ? buildQuizContentBlocks(context.assignment.quiz_payload, data.quiz_answers)
      : buildTextContentBlocks(data)

  return {
    uid: String(data.uid),
    lessonUid: context.lessonUid,
    lessonTitle: context.lessonTitle,
    moduleTitle: context.moduleTitle,
    assignmentUid: context.assignment.uid,
    assignmentTitle: context.assignment.title,
    taskType,
    student: resolveStudent(data),
    submittedAt: String(data.updated_at ?? data.created_at ?? ''),
    attemptCount: typeof data.attempt_count === 'number' ? data.attempt_count : 1,
    scorePercent: typeof data.score_percent === 'number' ? data.score_percent : null,
    passed: typeof data.passed === 'boolean' ? data.passed : null,
    feedback: data.feedback?.trim() || null,
    gradedAt: data.graded_at ?? null,
    gradedByUid: resolveGradedByUid(data),
    isAutoGraded: Boolean(data.is_auto_graded),
    quizCorrectCount:
      typeof data.quiz_correct_count === 'number' ? data.quiz_correct_count : null,
    quizQuestionCount:
      typeof data.quiz_question_count === 'number' ? data.quiz_question_count : null,
    contentBlocks,
    gradingStatus: resolveGradingStatus(data.graded_at),
  }
}

export function mapStaffSubmissionsList(
  raw: unknown,
  context: {
    lessonUid: string
    lessonTitle: string
    moduleTitle: string
    assignment: ILessonDetailAssignment
  },
): ICourseStaffSubmission[] {
  if (!raw || typeof raw !== 'object') return []

  const data = raw as { submissions?: unknown[] }
  if (!Array.isArray(data.submissions)) return []

  return data.submissions
    .map((item) => mapStaffSubmission(item, context))
    .filter((item): item is ICourseStaffSubmission => item !== null)
}
