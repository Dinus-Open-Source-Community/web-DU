import { z } from 'zod'
import {
  beResolvableUidSchema,
  moduleTitleSchema,
  paginationPageSchema,
  paginationPerPageSchema,
  searchQuerySchema,
} from './common'

/** Payload POST `/modules` — selaras `dto.CreateModuleRequest`. */
export const moduleCreateRequestSchema = z
  .object({
    course_uid: beResolvableUidSchema,
    title: moduleTitleSchema,
    order_index: z
      .number({ message: 'Urutan modul wajib diisi' })
      .int('Urutan modul harus bilangan bulat')
      .min(1, 'Urutan modul minimal 1')
      .max(9999, 'Urutan modul maksimal 9999'),
  })
  .strict()

/** Payload PUT `/modules/:uid` — selaras `dto.UpdateModuleRequest`. */
export const moduleUpdateRequestSchema = z
  .object({
    title: moduleTitleSchema.optional(),
    order_index: z
      .number({ message: 'Urutan modul harus berupa angka' })
      .int('Urutan modul harus bilangan bulat')
      .min(1, 'Urutan modul minimal 1')
      .max(9999, 'Urutan modul maksimal 9999')
      .optional(),
  })
  .strict()
  .refine((data) => data.title !== undefined || data.order_index !== undefined, {
    message: 'Minimal satu field harus diisi untuk pembaruan modul',
  })
  .superRefine((data, ctx) => {
    if (data.title !== undefined && data.title.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Judul modul tidak boleh kosong',
        path: ['title'],
      })
    }
  })

export const moduleListParamsSchema = z
  .object({
    page: paginationPageSchema.optional(),
    per_page: paginationPerPageSchema.optional(),
    name: searchQuerySchema.optional(),
  })
  .strict()

export const moduleUidParamSchema = beResolvableUidSchema
export const moduleCourseUidParamSchema = beResolvableUidSchema

export type ModuleCreateRequestValidated = z.infer<typeof moduleCreateRequestSchema>
export type ModuleUpdateRequestValidated = z.infer<typeof moduleUpdateRequestSchema>
export type ModuleListParamsValidated = z.infer<typeof moduleListParamsSchema>
