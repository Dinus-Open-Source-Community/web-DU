import { z } from 'zod'

export const emailSchema = z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid').transform((value) => value.toLowerCase())

export const requiredStringSchema = (fieldName: string) => z.string().trim().min(1, `${fieldName} wajib diisi`)

export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password maksimal 128 karakter')
  .refine((value) => /[A-Za-z]/.test(value), 'Password harus mengandung huruf')
  .refine((value) => /\d/.test(value), 'Password harus mengandung angka')

export const currentPasswordSchema = z.string().min(1, 'Password saat ini wajib diisi')
