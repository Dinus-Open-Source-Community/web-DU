import { z } from 'zod'
import { beResolvableUidSchema, paginationPageSchema, paginationPerPageSchema, searchQuerySchema } from './common'
import { courseApiLevelSchema } from './course-form.schema'

export const courseListSortOrderSchema = z.enum(['asc', 'desc'], {
  message: 'Sort order harus asc atau desc',
})

/** Query GET `/courses` — selaras filter yang dipakai FE + BE handler. */
export const courseListParamsSchema = z
  .object({
    page: paginationPageSchema.optional(),
    per_page: paginationPerPageSchema.optional(),
    mentor_id: beResolvableUidSchema.optional(),
    title: searchQuerySchema.optional(),
    price: z.union([z.string().trim(), z.number()]).optional(),
    is_premium: z.boolean().optional(),
    course_category_id: beResolvableUidSchema.optional(),
    course_type_id: beResolvableUidSchema.optional(),
    class_type_id: beResolvableUidSchema.optional(),
    status: z.string().trim().max(32).optional(),
    sort_by: z.string().trim().max(64).optional(),
    sort_order: courseListSortOrderSchema.optional(),
    level: courseApiLevelSchema.optional(),
  })
  .strict()

export const genericPaginationParamsSchema = z
  .object({
    page: paginationPageSchema.optional(),
    per_page: paginationPerPageSchema.optional(),
  })
  .strict()

export const joinCourseUidParamSchema = beResolvableUidSchema

export type CourseListParamsValidated = z.infer<typeof courseListParamsSchema>
export type GenericPaginationParamsValidated = z.infer<typeof genericPaginationParamsSchema>
