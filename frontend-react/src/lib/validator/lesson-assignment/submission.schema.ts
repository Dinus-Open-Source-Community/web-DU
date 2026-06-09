import { z } from 'zod'

import type { LessonDetailAssignment } from '@/lib/types/lesson'
import type { QuizAnswersMap } from '@/lib/types/features/lesson-assignment'
import { MAX_LESSON_ASSIGNMENT_SUBMISSION_FILE_BYTES } from '../common'
import { richTextEnvelopeSchema } from '../lessons/rich-text.schema'

const MAX_PLAIN_TEXT_LENGTH = 100_000
const MAX_FILE_DESCRIPTION_LENGTH = 5_000

export const quizAnswersMapSchema = z
  .record(
    z
      .string({ message: 'ID pertanyaan kuis tidak valid' })
      .trim()
      .min(1, 'ID pertanyaan kuis tidak valid')
      .max(64, 'ID pertanyaan kuis tidak valid'),
    z
      .string({ message: 'Jawaban kuis wajib diisi' })
      .trim()
      .min(1, 'Jawaban kuis wajib diisi')
      .max(256, 'Jawaban kuis terlalu panjang'),
  )
  .refine((answers) => Object.keys(answers).length > 0, 'quiz_answers tidak boleh kosong')

export const assignmentSubmissionFileSchema = z
  .instanceof(File, { message: 'File submission tidak valid' })
  .refine((file) => file.size > 0, 'File submission tidak boleh kosong')
  .refine(
    (file) => file.size <= MAX_LESSON_ASSIGNMENT_SUBMISSION_FILE_BYTES,
    'Ukuran file maksimal 10 MB',
  )

export type LessonAssignmentSubmissionInput = {
  plainText?: string
  richText?: z.infer<typeof richTextEnvelopeSchema> | null
  file?: File | null
  fileDescription?: string
  quizAnswers?: QuizAnswersMap
  removeFile?: boolean
}

export type LessonAssignmentSubmissionValidationContext = {
  assignment: Pick<
    LessonDetailAssignment,
    | 'task_type'
    | 'allow_file_submission'
    | 'allow_plain_text_submission'
    | 'allow_rich_text_submission'
    | 'require_file_description'
    | 'quiz_payload'
  >
  priorFileUrl?: string | null
}

function hasStoredFile(priorFileUrl: string | null | undefined, removeFile: boolean) {
  return Boolean(priorFileUrl?.trim()) && !removeFile
}

function validateSubmissionAgainstAssignment(
  data: {
    plainText?: string
    richText?: z.infer<typeof richTextEnvelopeSchema> | null
    file?: File | null
    fileDescription?: string
    quizAnswers?: QuizAnswersMap
    removeFile?: boolean
  },
  context: LessonAssignmentSubmissionValidationContext,
  ctx: z.RefinementCtx,
) {
  const assignment = context.assignment
  const plainText = (data.plainText ?? '').trim()
  const fileDescription = (data.fileDescription ?? '').trim()
  const hasPlain = plainText.length > 0
  const hasRich = data.richText != null
  const hasNewFile = data.file != null
  const hasStoredFileValue = hasStoredFile(context.priorFileUrl, data.removeFile ?? false)

  if (assignment.task_type === 'quiz') {
    if (hasNewFile) {
      ctx.addIssue({
        code: 'custom',
        message: 'Unggahan file tidak diizinkan untuk kuis',
        path: ['file'],
      })
    }
    if (hasPlain || hasRich) {
      ctx.addIssue({
        code: 'custom',
        message: 'Gunakan quiz_answers untuk kuis, bukan plain_text atau rich_text',
        path: ['quizAnswers'],
      })
    }
    if (!data.quizAnswers) {
      ctx.addIssue({
        code: 'custom',
        message: 'quiz_answers wajib diisi',
        path: ['quizAnswers'],
      })
      return
    }

    const questions = assignment.quiz_payload?.questions ?? []
    for (const question of questions) {
      if (!question.id.trim()) continue
      if (!data.quizAnswers[question.id]?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: `Jawaban untuk pertanyaan "${question.id}" wajib diisi`,
          path: ['quizAnswers', question.id],
        })
      }
    }
    return
  }

  if (data.quizAnswers && Object.keys(data.quizAnswers).length > 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'quiz_answers hanya valid untuk tugas kuis',
      path: ['quizAnswers'],
    })
  }

  if (hasNewFile && !assignment.allow_file_submission) {
    ctx.addIssue({
      code: 'custom',
      message: 'Unggahan file tidak diizinkan untuk tugas ini',
      path: ['file'],
    })
  }

  if (hasPlain && !assignment.allow_plain_text_submission) {
    ctx.addIssue({
      code: 'custom',
      message: 'Jawaban plain_text tidak diizinkan untuk tugas ini',
      path: ['plainText'],
    })
  }

  if (hasRich && !assignment.allow_rich_text_submission) {
    ctx.addIssue({
      code: 'custom',
      message: 'Jawaban rich_text tidak diizinkan untuk tugas ini',
      path: ['richText'],
    })
  }

  const effectiveHasFile = hasNewFile || hasStoredFileValue
  if (assignment.require_file_description && effectiveHasFile && !fileDescription) {
    ctx.addIssue({
      code: 'custom',
      message: 'file_description wajib diisi saat mengirim file',
      path: ['fileDescription'],
    })
  }

  if (!hasPlain && !hasRich && !hasNewFile && !hasStoredFileValue) {
    ctx.addIssue({
      code: 'custom',
      message: 'Kirim minimal salah satu dari plain_text, rich_text, atau file sesuai metode yang diaktifkan',
      path: ['plainText'],
    })
  }
}

const lessonAssignmentSubmissionInputBaseSchema = z
  .object({
    plainText: z.string().max(MAX_PLAIN_TEXT_LENGTH, 'plain_text terlalu panjang').optional(),
    richText: richTextEnvelopeSchema.nullable().optional(),
    file: assignmentSubmissionFileSchema.nullable().optional(),
    fileDescription: z
      .string()
      .max(MAX_FILE_DESCRIPTION_LENGTH, 'file_description terlalu panjang')
      .optional(),
    quizAnswers: quizAnswersMapSchema.optional(),
    removeFile: z.boolean().optional(),
  })
  .strict()

/** Validasi input pengumpulan tugas siswa sebelum POST/PUT submission. */
export function createLessonAssignmentSubmissionInputSchema(
  context: LessonAssignmentSubmissionValidationContext,
) {
  return lessonAssignmentSubmissionInputBaseSchema
    .superRefine((data, ctx) => validateSubmissionAgainstAssignment(data, context, ctx))
    .transform((data) => {
      const sanitized: LessonAssignmentSubmissionInput = {}

      if (data.plainText?.trim()) sanitized.plainText = data.plainText.trim()
      if (data.richText) sanitized.richText = data.richText
      if (data.file) sanitized.file = data.file
      if (data.fileDescription?.trim()) sanitized.fileDescription = data.fileDescription.trim()
      if (data.quizAnswers) sanitized.quizAnswers = data.quizAnswers
      if (data.removeFile) sanitized.removeFile = true

      return sanitized
    })
}

/** Payload JSON PUT submission — selaras `dto.LessonAssignmentSubmissionUpsertRequest`. */
export const lessonAssignmentSubmissionJsonRequestSchema = z
  .object({
    plain_text: z.string().max(MAX_PLAIN_TEXT_LENGTH, 'plain_text terlalu panjang').optional(),
    rich_text: richTextEnvelopeSchema.nullable().optional(),
    file_description: z
      .string()
      .max(MAX_FILE_DESCRIPTION_LENGTH, 'file_description terlalu panjang')
      .optional(),
    quiz_answers: quizAnswersMapSchema.optional(),
    remove_file: z.boolean().optional().default(false),
  })
  .strict()

export type LessonAssignmentSubmissionInputValidated = LessonAssignmentSubmissionInput
