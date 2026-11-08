import { z } from 'zod'
import { SOCIAL_PLATFORM_OPTIONS, type SocialPlatform } from '@/lib/profile/social-links'
import {
  avatarUploadFileSchema,
  currentPasswordSchema,
  emailSchema,
  passwordSchema,
  userNameSchema,
} from './common'

const optionalProfileString = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

/** Payload PATCH `/user/profile` — selaras `dto.UpdateUserProfileRequest`. */
export const updateProfileSchema = z
  .object({
    name: optionalProfileString.pipe(userNameSchema.optional()),
    email: z.preprocess((value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      return trimmed === '' ? undefined : trimmed
    }, emailSchema.optional()),
    social_links: z.array(z.object({
      id: z.string(),
      platform: z.custom<SocialPlatform>((value) =>
        typeof value === 'string' && SOCIAL_PLATFORM_OPTIONS.some((option) => option.value === value),
      ),
      url: z.string().url(),
    })).optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Minimal satu data profil harus diisi',
  })

/** Payload PATCH `/user/password` — selaras `dto.ChangePasswordRequest`. */
export const changePasswordPayloadSchema = z.object({
  old_password: currentPasswordSchema,
  new_password: passwordSchema,
})

export const changePasswordFormSchema = changePasswordPayloadSchema
  .extend({
    confirm_password: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
  })

export const updateEmailSchema = z.object({
  email: emailSchema,
  password: currentPasswordSchema,
})

export { avatarUploadFileSchema }

/** Alias kompatibilitas — gunakan avatarUploadFileSchema. */
export const avatarFileSchema = avatarUploadFileSchema

export const profileDisplayNameSchema = userNameSchema

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>
export type ChangePasswordPayloadValues = z.infer<typeof changePasswordPayloadSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>
export type UpdateEmailValues = z.infer<typeof updateEmailSchema>
export type AvatarFileValue = z.infer<typeof avatarUploadFileSchema>
