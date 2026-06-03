import { z } from 'zod'
import { currentPasswordSchema, emailSchema, passwordSchema, requiredStringSchema } from './common'

const optionalProfileString = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

export const updateProfileSchema = z
  .object({
    name: optionalProfileString.refine((value) => value === undefined || value.length >= 2, 'Nama minimal 2 karakter'),
    email: z.preprocess((value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      return trimmed === '' ? undefined : trimmed
    }, emailSchema.optional()),
    description: optionalProfileString.refine((value) => value === undefined || value.length <= 500, 'Deskripsi maksimal 500 karakter'),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined || data.description !== undefined, {
    message: 'Minimal satu data profil harus diisi',
  })

export const changePasswordPayloadSchema = z.object({
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

export const avatarFileSchema = z
  .instanceof(File, { message: 'Silakan pilih file foto terlebih dahulu' })
  .refine((file) => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type), 'Tipe file tidak valid. Silakan pilih file gambar (jpg, png, gif).')
  .refine((file) => file.size <= 5 * 1024 * 1024, 'Ukuran foto maksimal 5MB')

export const profileDisplayNameSchema = requiredStringSchema('Nama tampilan').min(2, 'Nama tampilan minimal 2 karakter').max(100, 'Nama tampilan maksimal 100 karakter')

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>
export type ChangePasswordPayloadValues = z.infer<typeof changePasswordPayloadSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>
export type UpdateEmailValues = z.infer<typeof updateEmailSchema>
export type AvatarFileValue = z.infer<typeof avatarFileSchema>
