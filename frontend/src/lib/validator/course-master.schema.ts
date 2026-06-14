import { z } from 'zod'
import { beResolvableUidSchema } from './common'

/** Selaras `entity.CourseCategory.Name` / `entity.ClassType.Name` — varchar(120). */
export const courseMasterNameSchema = z
  .string({ message: 'Nama wajib diisi' })
  .trim()
  .min(1, 'Nama wajib diisi')
  .max(120, 'Nama maksimal 120 karakter')

export const courseMasterDescriptionSchema = z
  .string()
  .trim()
  .max(5000, 'Deskripsi maksimal 5000 karakter')

export const createCourseMasterPayloadSchema = z
  .object({
    name: courseMasterNameSchema,
    description: courseMasterDescriptionSchema.optional(),
    is_active: z.boolean().optional(),
  })
  .strict()

export const updateCourseMasterPayloadSchema = z
  .object({
    name: courseMasterNameSchema.optional(),
    description: courseMasterDescriptionSchema.optional(),
    is_active: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) => data.name !== undefined || data.description !== undefined || data.is_active !== undefined,
    { message: 'Minimal satu field harus diisi untuk pembaruan' },
  )
  .superRefine((data, ctx) => {
    if (data.name !== undefined && data.name.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Nama tidak boleh kosong',
        path: ['name'],
      })
    }
  })

export const courseMasterFormValuesSchema = z
  .object({
    name: courseMasterNameSchema,
    description: courseMasterDescriptionSchema,
    isActive: z.boolean(),
  })
  .strict()

export const courseMasterUidParamSchema = beResolvableUidSchema

export type CreateCourseMasterPayloadValidated = z.infer<typeof createCourseMasterPayloadSchema>
export type UpdateCourseMasterPayloadValidated = z.infer<typeof updateCourseMasterPayloadSchema>
export type CourseMasterFormValuesValidated = z.infer<typeof courseMasterFormValuesSchema>
