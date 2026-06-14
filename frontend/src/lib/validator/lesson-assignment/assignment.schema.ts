import { z } from 'zod'

import { isValidInstructionAttachmentUrl } from '@/lib/course-edit/instruction-attachments'
import { MAX_ASSIGNMENT_TITLE_LENGTH } from '../common'
import { rfc3339DateTimeSchema } from '../lessons/lesson.schema'
import { richTextEnvelopeSchema } from '../lessons/rich-text.schema'

/** Selaras `entity.LessonAssignmentTaskType`. */
export const lessonAssignmentTaskTypeSchema = z.enum(['text', 'quiz'], {
  message: 'task_type harus text atau quiz',
})

/** Selaras `entity.LessonAssignmentStatus` — BE menormalisasi ke uppercase. */
export const lessonAssignmentStatusSchema = z
  .string({ message: 'status wajib diisi' })
  .trim()
  .min(1, 'status wajib diisi')
  .transform((value) => value.toUpperCase())
  .pipe(
    z.enum(['DRAFT', 'TERBIT', 'DITUTUP'], {
      message: 'status harus DRAFT, TERBIT, atau DITUTUP',
    }),
  )

export const assignmentTitleSchema = z
  .string({ message: 'Judul tugas wajib diisi' })
  .trim()
  .min(1, 'Judul tugas wajib diisi')
  .max(MAX_ASSIGNMENT_TITLE_LENGTH, `Judul tugas maksimal ${MAX_ASSIGNMENT_TITLE_LENGTH} karakter`)

export const instructionAttachmentSchema = z
  .object({
    name: z
      .string({ message: 'Nama lampiran wajib diisi' })
      .trim()
      .min(1, 'Nama lampiran wajib diisi')
      .max(512, 'Nama lampiran maksimal 512 karakter'),
    url: z
      .string({ message: 'URL lampiran wajib diisi' })
      .trim()
      .min(1, 'URL lampiran wajib diisi')
      .max(2048, 'URL lampiran terlalu panjang')
      .refine(isValidInstructionAttachmentUrl, 'URL lampiran harus http(s) atau path /files/...'),
  })
  .strict()

const quizPromptSchema = z.union([
  z
    .string({ message: 'Pertanyaan kuis wajib diisi' })
    .trim()
    .min(1, 'Pertanyaan kuis wajib diisi')
    .max(10_000, 'Pertanyaan kuis terlalu panjang'),
  richTextEnvelopeSchema,
])

export const quizOptionSchema = z
  .object({
    id: z
      .string({ message: 'ID opsi kuis wajib diisi' })
      .trim()
      .min(1, 'ID opsi kuis wajib diisi')
      .max(64, 'ID opsi kuis terlalu panjang'),
    label: z
      .string({ message: 'Label opsi kuis wajib diisi' })
      .trim()
      .min(1, 'Label opsi kuis wajib diisi')
      .max(2_000, 'Label opsi kuis terlalu panjang'),
  })
  .strict()

export const quizQuestionSchema = z
  .object({
    id: z
      .string({ message: 'ID pertanyaan kuis wajib diisi' })
      .trim()
      .min(1, 'ID pertanyaan kuis wajib diisi')
      .max(64, 'ID pertanyaan kuis terlalu panjang'),
    prompt: quizPromptSchema,
    options: z
      .array(quizOptionSchema)
      .min(2, 'Setiap pertanyaan kuis minimal 2 opsi')
      .max(8, 'Setiap pertanyaan kuis maksimal 8 opsi'),
    correctOptionId: z
      .string({ message: 'Jawaban benar wajib dipilih' })
      .trim()
      .min(1, 'Jawaban benar wajib dipilih')
      .max(64, 'ID jawaban benar tidak valid'),
    explanation: z.string().trim().max(5_000, 'Penjelasan terlalu panjang').optional(),
  })
  .strict()
  .superRefine((question, ctx) => {
    const optionIds = new Set(question.options.map((option) => option.id))
    if (!optionIds.has(question.correctOptionId)) {
      ctx.addIssue({
        code: 'custom',
        message: 'correctOptionId harus cocok dengan salah satu opsi pertanyaan',
        path: ['correctOptionId'],
      })
    }

    if (optionIds.size !== question.options.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'ID opsi dalam satu pertanyaan tidak boleh duplikat',
        path: ['options'],
      })
    }
  })

export const quizPayloadSchema = z
  .object({
    questions: z
      .array(quizQuestionSchema)
      .min(1, 'Quiz wajib memiliki minimal 1 pertanyaan')
      .max(100, 'Quiz maksimal 100 pertanyaan'),
    passingScore: z
      .number({ message: 'Passing score harus berupa angka' })
      .min(0, 'Passing score minimal 0')
      .max(100, 'Passing score maksimal 100')
      .optional(),
  })
  .strict()
  .superRefine((quiz, ctx) => {
    const questionIds = quiz.questions.map((question) => question.id)
    const uniqueIds = new Set(questionIds)
    if (uniqueIds.size !== questionIds.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'ID pertanyaan kuis tidak boleh duplikat',
        path: ['questions'],
      })
    }
  })

type AssignmentUpsertShape = {
  title: string
  task_type: 'text' | 'quiz'
  task_description: z.infer<typeof richTextEnvelopeSchema> | null
  quiz: z.infer<typeof quizPayloadSchema> | null
  allow_file_submission: boolean
  allow_plain_text_submission: boolean
  allow_rich_text_submission: boolean
  require_file_description: boolean
  instruction_attachments: z.infer<typeof instructionAttachmentSchema>[]
  deadline_at: string
  status: string
  auto_close_after_deadline: boolean
  allow_resubmit: boolean
  max_resubmit_count: number | null
}

function validateAssignmentBusinessRules(data: AssignmentUpsertShape, ctx: z.RefinementCtx) {
  if (
    !data.allow_file_submission &&
    !data.allow_plain_text_submission &&
    !data.allow_rich_text_submission
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Minimal satu metode pengumpulan jawaban harus diaktifkan',
      path: ['allow_file_submission'],
    })
  }

  if (data.require_file_description && !data.allow_file_submission) {
    ctx.addIssue({
      code: 'custom',
      message: 'require_file_description hanya boleh true jika allow_file_submission true',
      path: ['require_file_description'],
    })
  }

  if (data.allow_resubmit) {
    if (data.max_resubmit_count == null || data.max_resubmit_count < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'max_resubmit_count wajib diisi dan minimal 1 jika allow_resubmit true',
        path: ['max_resubmit_count'],
      })
    }
  }

  if (data.task_type === 'text') {
    if (!data.task_description) {
      ctx.addIssue({
        code: 'custom',
        message: 'task_description wajib diisi untuk tugas teks',
        path: ['task_description'],
      })
    }
    if (data.quiz != null) {
      ctx.addIssue({
        code: 'custom',
        message: 'quiz harus null untuk tugas teks',
        path: ['quiz'],
      })
    }
  }

  if (data.task_type === 'quiz') {
    if (!data.quiz) {
      ctx.addIssue({
        code: 'custom',
        message: 'quiz wajib diisi untuk tugas kuis',
        path: ['quiz'],
      })
    }
    if (data.task_description != null) {
      ctx.addIssue({
        code: 'custom',
        message: 'task_description harus null untuk tugas kuis',
        path: ['task_description'],
      })
    }
  }
}

/** Payload POST/PUT `/lessons/:id/assignment` — selaras `dto.LessonAssignmentUpsertRequest` + `buildLessonAssignmentModel`. */
export const lessonAssignmentUpsertRequestSchema = z
  .object({
    title: assignmentTitleSchema,
    task_type: lessonAssignmentTaskTypeSchema,
    task_description: richTextEnvelopeSchema.nullable(),
    quiz: quizPayloadSchema.nullable(),
    allow_file_submission: z.boolean(),
    allow_plain_text_submission: z.boolean(),
    allow_rich_text_submission: z.boolean(),
    require_file_description: z.boolean(),
    instruction_attachments: z.array(instructionAttachmentSchema).max(20, 'Maksimal 20 lampiran instruksi'),
    deadline_at: rfc3339DateTimeSchema,
    status: lessonAssignmentStatusSchema,
    auto_close_after_deadline: z.boolean(),
    allow_resubmit: z.boolean(),
    max_resubmit_count: z
      .number({ message: 'max_resubmit_count harus berupa angka' })
      .int('max_resubmit_count harus bilangan bulat')
      .min(1, 'max_resubmit_count minimal 1')
      .max(99, 'max_resubmit_count maksimal 99')
      .nullable(),
  })
  .strict()
  .superRefine(validateAssignmentBusinessRules)
  .transform((data) => ({
    ...data,
    max_resubmit_count: data.allow_resubmit ? data.max_resubmit_count : null,
    deadline_at: new Date(data.deadline_at).toISOString(),
  }))

export type LessonAssignmentUpsertRequestValidated = z.infer<typeof lessonAssignmentUpsertRequestSchema>
