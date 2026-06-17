import { z } from 'zod'
import { beResolvableUidSchema } from './common'

/** Selaras `entity.CourseQaThread.Title` — varchar(255). */
export const courseQaThreadTitleSchema = z
  .string({ message: 'Judul wajib diisi' })
  .trim()
  .min(1, 'Judul wajib diisi')
  .max(255, 'Judul maksimal 255 karakter')

export const courseQaBodySchema = z
  .string({ message: 'Isi pesan wajib diisi' })
  .trim()
  .min(1, 'Isi pesan wajib diisi')
  .max(10_000, 'Isi pesan maksimal 10000 karakter')

/** Payload POST `/courses/:uid/qna` — selaras `dto.CreateCourseQaThreadRequest`. */
export const createCourseQaThreadPayloadSchema = z
  .object({
    title: courseQaThreadTitleSchema,
    body: courseQaBodySchema,
  })
  .strict()

/** Payload POST reply Q&A (student/admin) — selaras `dto.CreateCourseQaReplyRequest`. */
export const createCourseQaReplyPayloadSchema = z
  .object({
    body: courseQaBodySchema,
  })
  .strict()

export const courseQaCourseUidParamSchema = beResolvableUidSchema
export const courseQaThreadUidParamSchema = beResolvableUidSchema

export type CreateCourseQaThreadPayloadValidated = z.infer<typeof createCourseQaThreadPayloadSchema>
export type CreateCourseQaReplyPayloadValidated = z.infer<typeof createCourseQaReplyPayloadSchema>
