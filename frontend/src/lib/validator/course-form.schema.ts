import { z } from 'zod'
import { COURSE_CREATE_AS_DRAFT } from '@/lib/course-form/types'
import { beResolvableUidSchema, imageUploadFileSchema } from './common'

/** Selaras `entity.CourseLevel` — PEMULA | MENENGAH | LANJUTAN. */
export const courseApiLevelSchema = z.enum(['PEMULA', 'MENENGAH', 'LANJUTAN'], {
  message: 'Level harus PEMULA, MENENGAH, atau LANJUTAN',
})

/** Selaras `entity.Course.Title` — varchar(200). */
export const courseTitleSchema = z
  .string({ message: 'Judul wajib diisi' })
  .trim()
  .min(1, 'Judul wajib diisi')
  .max(200, 'Judul maksimal 200 karakter')

/** Selaras `entity.Course.Subtitle` — varchar(255); opsional di BE create. */
export const courseSubtitleSchema = z
  .string()
  .trim()
  .max(255, 'Subtitle maksimal 255 karakter')

export const courseDescriptionSchema = z
  .string({ message: 'Deskripsi wajib diisi' })
  .trim()
  .min(1, 'Deskripsi wajib diisi')
  .max(20000, 'Deskripsi maksimal 20000 karakter')

/** Selaras `entity.Course.Slug` — varchar(255). */
export const courseSlugSchema = z
  .string()
  .trim()
  .max(255, 'Slug maksimal 255 karakter')
  .regex(/^[a-z0-9-]*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung')

export const courseSlotSchema = z
  .number({ message: 'Slot harus berupa angka' })
  .int('Slot harus bilangan bulat')
  .min(0, 'Slot tidak boleh negatif')
  .max(999_999, 'Slot terlalu besar')

export const whatYouLearnItemSchema = z
  .string()
  .trim()
  .min(1, 'Poin pembelajaran tidak boleh kosong')
  .max(500, 'Poin pembelajaran maksimal 500 karakter')

export const whatYouLearnSchema = z
  .array(whatYouLearnItemSchema)
  .min(1, 'Minimal satu poin pembelajaran harus diisi')
  .max(50, 'Maksimal 50 poin pembelajaran')

const courseFormFieldsSchema = z.object({
  title: courseTitleSchema,
  subtitle: courseSubtitleSchema,
  slug: courseSlugSchema.optional(),
  description: courseDescriptionSchema,
  category_uid: beResolvableUidSchema,
  course_type_uid: beResolvableUidSchema,
  level: courseApiLevelSchema,
  what_you_learn: whatYouLearnSchema,
  slot: courseSlotSchema.optional(),
  cover: imageUploadFileSchema.optional(),
})

export const createCoursePayloadSchema = courseFormFieldsSchema
  .extend({
    is_published: z.literal(COURSE_CREATE_AS_DRAFT),
  })
  .strict()

export const updateCoursePayloadSchema = courseFormFieldsSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk pembaruan kursus',
  })
  .superRefine((data, ctx) => {
    if (data.title !== undefined && data.title.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Judul tidak boleh kosong',
        path: ['title'],
      })
    }

    if (data.description !== undefined && data.description.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Deskripsi tidak boleh kosong',
        path: ['description'],
      })
    }
  })

export const updateCourseStatusRequestSchema = z
  .object({
    courseUid: beResolvableUidSchema,
  })
  .strict()

const optionalNonNegativeNumber = z.union([
  z.number().min(0, 'Nilai tidak boleh negatif'),
  z.literal(''),
])

export const courseFormValuesSchema = z
  .object({
    title: courseTitleSchema,
    subtitle: courseSubtitleSchema,
    description: courseDescriptionSchema,
    categoryUid: beResolvableUidSchema,
    courseTypeUid: beResolvableUidSchema,
    level: courseApiLevelSchema,
    whatYouLearn: whatYouLearnSchema,
    slot: optionalNonNegativeNumber,
    coverFile: imageUploadFileSchema.nullable(),
    coverPreviewUrl: z.string().trim().max(2048).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (typeof data.slot === 'number') {
      if (!Number.isInteger(data.slot)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Slot harus bilangan bulat',
          path: ['slot'],
        })
      } else if (data.slot > 999_999) {
        ctx.addIssue({
          code: 'custom',
          message: 'Slot terlalu besar',
          path: ['slot'],
        })
      }
    }
  })

export const courseUidParamSchema = beResolvableUidSchema

export type CreateCoursePayloadValidated = z.infer<typeof createCoursePayloadSchema>
export type UpdateCoursePayloadValidated = z.infer<typeof updateCoursePayloadSchema>
export type UpdateCourseStatusRequestValidated = z.infer<typeof updateCourseStatusRequestSchema>
export type CourseFormValuesValidated = z.infer<typeof courseFormValuesSchema>
