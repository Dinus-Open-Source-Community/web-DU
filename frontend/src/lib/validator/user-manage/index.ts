import type { ManagedUserListParams, UpdateUserRolePayload } from '@/lib/user-manage/types'
import { getValidationMessage, parseWithValidationMessage } from '../errors'
import {
  managedUserListParamsSchema,
  managedUserUidParamSchema,
  updateUserRolePayloadSchema,
  type ManagedUserListParamsValidated,
  type UpdateUserRolePayloadValidated,
} from '../user-manage.schema'

export * from '../user-manage.schema'

export function parseManagedUserListParams(
  params?: ManagedUserListParams,
  fallback = 'Parameter daftar user tidak valid',
): ManagedUserListParamsValidated {
  return parseWithValidationMessage(managedUserListParamsSchema, params ?? {}, fallback)
}

export function parseUpdateUserRolePayload(
  payload: UpdateUserRolePayload,
  fallback = 'Payload perubahan role tidak valid',
): UpdateUserRolePayloadValidated {
  return parseWithValidationMessage(updateUserRolePayloadSchema, payload, fallback)
}

export function parseManagedUserUidParam(uid: string, fallback = 'UID user tidak valid'): string {
  return parseWithValidationMessage(managedUserUidParamSchema, uid, fallback)
}

export function getManagedUserListParamsValidationMessage(params?: ManagedUserListParams): string | null {
  const result = managedUserListParamsSchema.safeParse(params ?? {})
  if (!result.success) return getValidationMessage(result.error)
  return null
}
