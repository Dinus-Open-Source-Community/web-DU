import { z } from 'zod'
import { ASSIGNABLE_USER_ROLES } from '@/lib/user-manage/types'
import { beResolvableUidSchema, paginationPageSchema, paginationPerPageSchema } from './common'

export const assignableUserRoleSchema = z.enum(ASSIGNABLE_USER_ROLES, {
  message: 'Role harus admin, mentor, atau student',
})

/** Filter role pada GET /user/manage/all — termasuk super_admin untuk halaman administrator. */
export const managedUserListRoleFilterSchema = z.enum(
  [...ASSIGNABLE_USER_ROLES, 'super_admin'] as const,
  { message: 'Filter role tidak valid' },
)

export const managedUserListSortSchema = z.enum(['created_at', 'name'], {
  message: 'Sort harus created_at atau name',
})

export const managedUserListOrderSchema = z.enum(['asc', 'desc'], {
  message: 'Order harus asc atau desc',
})

export const managedUserListParamsSchema = z
  .object({
    page: paginationPageSchema.optional(),
    per_page: paginationPerPageSchema.optional(),
    role: managedUserListRoleFilterSchema.optional(),
    search: z
      .string()
      .trim()
      .max(200, 'Kata kunci pencarian maksimal 200 karakter')
      .optional(),
    sort: managedUserListSortSchema.optional(),
    order: managedUserListOrderSchema.optional(),
  })
  .strict()

export const updateUserRolePayloadSchema = z
  .object({
    role: assignableUserRoleSchema,
  })
  .strict()

export const managedUserUidParamSchema = beResolvableUidSchema

export type ManagedUserListParamsValidated = z.infer<typeof managedUserListParamsSchema>
export type UpdateUserRolePayloadValidated = z.infer<typeof updateUserRolePayloadSchema>
