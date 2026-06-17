import { parseWithValidationMessage } from '../errors'
import {
  avatarUploadFileSchema,
  changePasswordFormSchema,
  changePasswordPayloadSchema,
  updateProfileSchema,
  type ChangePasswordFormValues,
  type ChangePasswordPayloadValues,
  type UpdateProfileValues,
} from '../profile.schema'

export * from '../profile.schema'

export function parseUpdateProfilePayload(
  payload: UpdateProfileValues,
  fallback = 'Data profil tidak valid',
) {
  return parseWithValidationMessage(updateProfileSchema, payload, fallback)
}

export function parseChangePasswordPayload(
  payload: ChangePasswordPayloadValues,
  fallback = 'Data password tidak valid',
) {
  return parseWithValidationMessage(changePasswordPayloadSchema, payload, fallback)
}

export function parseChangePasswordForm(
  payload: ChangePasswordFormValues,
  fallback = 'Form password tidak valid',
) {
  return parseWithValidationMessage(changePasswordFormSchema, payload, fallback)
}

export function parseAvatarUploadFile(file: File, fallback = 'Foto profil tidak valid') {
  return parseWithValidationMessage(avatarUploadFileSchema, file, fallback)
}
