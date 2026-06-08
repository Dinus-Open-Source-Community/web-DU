import { toRichTextEnvelope } from '@/lib/rich-text'
import {
  sanitizeInstructionAttachmentsForPayload,
  validateInstructionAttachments,
  normalizeInstructionAttachments,
} from '@/lib/course-edit/instruction-attachments'
import type {
  IQuiz,
  LessonAssignmentInstructionAttachment,
  LessonAssignmentStatus,
  LessonDetailAssignment,
} from '@/lib/types/lesson'

import type { HomeworkRulesDraft } from '@/lib/types/lesson'
import type { EditableLesson } from './types'

const DEFAULT_DEADLINE_OFFSET_MS = 7 * 24 * 60 * 60 * 1000

export type LessonAssignmentUpsertPayload = {
  title: string
  task_type: 'text' | 'quiz'
  task_description: ReturnType<typeof toRichTextEnvelope> | null
  quiz: IQuiz | null
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
}

export function createDefaultHomeworkRules(
  taskType: 'text' | 'quiz' = 'text',
): HomeworkRulesDraft {
  const deadlineAt = new Date(Date.now() + DEFAULT_DEADLINE_OFFSET_MS).toISOString()

  if (taskType === 'quiz') {
    return {
      allowFileSubmission: false,
      allowPlainTextSubmission: true,
      allowRichTextSubmission: false,
      requireFileDescription: false,
      deadlineAt,
      status: 'DRAFT',
      autoCloseAfterDeadline: true,
      allowResubmit: false,
      maxResubmitCount: null,
      instructionAttachments: [],
    }
  }

  return {
    allowFileSubmission: true,
    allowPlainTextSubmission: false,
    allowRichTextSubmission: true,
    requireFileDescription: false,
    deadlineAt,
    status: 'DRAFT',
    autoCloseAfterDeadline: true,
    allowResubmit: false,
    maxResubmitCount: null,
    instructionAttachments: [],
  }
}

export function mapAssignmentToHomeworkRules(
  assignment: LessonDetailAssignment,
): HomeworkRulesDraft {
  return {
    allowFileSubmission: assignment.allow_file_submission,
    allowPlainTextSubmission: assignment.allow_plain_text_submission,
    allowRichTextSubmission: assignment.allow_rich_text_submission,
    requireFileDescription: assignment.require_file_description,
    deadlineAt: assignment.deadline_at,
    status: assignment.status,
    autoCloseAfterDeadline: assignment.auto_close_after_deadline,
    allowResubmit: assignment.allow_resubmit,
    maxResubmitCount: assignment.max_resubmit_count,
    instructionAttachments: normalizeInstructionAttachments(
      assignment.instruction_attachments,
    ),
  }
}

export function ensureHomeworkRules(
  lesson: EditableLesson,
): HomeworkRulesDraft {
  return lesson.homeworkRules ?? createDefaultHomeworkRules(lesson.homeworkType ?? 'text')
}

export function applyHomeworkRulesPatch(
  lesson: EditableLesson,
  patch: Partial<HomeworkRulesDraft>,
): EditableLesson {
  const current = ensureHomeworkRules(lesson)
  return {
    ...lesson,
    homeworkRules: { ...current, ...patch },
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export function validateHomeworkForSave(lesson: EditableLesson): string | null {
  const title = (lesson.homeworkTitle ?? lesson.title).trim()
  if (!title) return 'Judul tugas wajib diisi.'

  const taskType = lesson.homeworkType ?? 'text'
  const rules = ensureHomeworkRules(lesson)

  if (
    !rules.allowFileSubmission &&
    !rules.allowPlainTextSubmission &&
    !rules.allowRichTextSubmission
  ) {
    return 'Aktifkan minimal satu metode pengumpulan jawaban.'
  }

  if (rules.requireFileDescription && !rules.allowFileSubmission) {
    return 'Deskripsi file hanya bisa wajib jika unggah file diaktifkan.'
  }

  if (rules.allowResubmit) {
    if (rules.maxResubmitCount == null || rules.maxResubmitCount < 1) {
      return 'Jumlah pengumpulan ulang wajib diisi (minimal 1) jika resubmit diaktifkan.'
    }
  }

  const deadlineMs = new Date(rules.deadlineAt).getTime()
  if (Number.isNaN(deadlineMs)) {
    return 'Tenggat waktu tidak valid.'
  }

  if (taskType === 'text') {
    const description = lesson.homeworkDescriptionHtml ?? ''
    if (!stripHtml(description)) {
      return 'Deskripsi tugas teks wajib diisi.'
    }
  }

  if (taskType === 'quiz') {
    const questionCount = lesson.homeworkQuiz?.questions.length ?? 0
    if (questionCount === 0) {
      return 'Tambahkan minimal satu soal quiz.'
    }
  }

  const attachmentError = validateInstructionAttachments(rules.instructionAttachments)
  if (attachmentError) return attachmentError

  return null
}

export function buildAssignmentUpsertPayload(
  lesson: EditableLesson,
): LessonAssignmentUpsertPayload {
  const taskType = lesson.homeworkType ?? 'text'
  const rules = ensureHomeworkRules(lesson)
  const title = (lesson.homeworkTitle ?? lesson.title).trim()

  return {
    title,
    task_type: taskType,
    task_description:
      taskType === 'text'
        ? toRichTextEnvelope(lesson.homeworkDescriptionHtml ?? '<p></p>')
        : null,
    quiz: taskType === 'quiz' ? (lesson.homeworkQuiz ?? null) : null,
    allow_file_submission: rules.allowFileSubmission,
    allow_plain_text_submission: rules.allowPlainTextSubmission,
    allow_rich_text_submission: rules.allowRichTextSubmission,
    require_file_description: rules.requireFileDescription,
    instruction_attachments: sanitizeInstructionAttachmentsForPayload(
      rules.instructionAttachments,
    ),
    deadline_at: new Date(rules.deadlineAt).toISOString(),
    status: rules.status,
    auto_close_after_deadline: rules.autoCloseAfterDeadline,
    allow_resubmit: rules.allowResubmit,
    max_resubmit_count: rules.allowResubmit ? rules.maxResubmitCount : null,
  }
}

export function formatHomeworkRulesSummary(
  rules: HomeworkRulesDraft,
  taskType: 'text' | 'quiz',
): {
  methodsLabel: string
  resubmitLabel: string
  maxAttempts: number
  attachmentLabel: string
} {
  const methods: string[] = []
  if (rules.allowPlainTextSubmission) methods.push('Teks')
  if (rules.allowRichTextSubmission) methods.push('Rich text')
  if (rules.allowFileSubmission) methods.push('File')

  const maxAttempts = !rules.allowResubmit
    ? 1
    : rules.maxResubmitCount != null && rules.maxResubmitCount >= 1
      ? 1 + rules.maxResubmitCount
      : 1

  const resubmitLabel = !rules.allowResubmit
    ? 'Pengumpulan ulang tidak diizinkan (1x)'
    : `Maks. ${maxAttempts}x pengumpulan (${maxAttempts - 1}x ulang)`

  const attachmentCount = sanitizeInstructionAttachmentsForPayload(
    rules.instructionAttachments,
  ).length

  return {
    methodsLabel:
      taskType === 'quiz'
        ? 'Jawaban kuis'
        : methods.length > 0
          ? methods.join(', ')
          : 'Tidak ada metode aktif',
    resubmitLabel,
    maxAttempts,
    attachmentLabel:
      attachmentCount > 0
        ? `${attachmentCount} lampiran instruksi`
        : 'Tanpa lampiran instruksi',
  }
}

export function clearHomeworkFromLesson(lesson: EditableLesson): EditableLesson {
  return {
    ...lesson,
    hasHomework: false,
    homeworkTitle: '',
    homeworkAssignmentUid: lesson.homeworkAssignmentUid ?? null,
    homeworkType: 'text',
    homeworkDescriptionHtml: '<p></p>',
    homeworkQuiz: { questions: [], passingScore: 70 },
    homeworkRules: createDefaultHomeworkRules('text'),
  }
}
