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

/** Full UUID v4 — selaras `uuid.Parse` di BE. */
export const FULL_UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

/** Prefix hex tanpa dash — selaras `database.ResolveUID` (min 4, max 32 hex). */
export const HEX_UID_PREFIX_REGEX = /^[0-9a-fA-F]{4,32}$/

/**
 * UID yang bisa di-resolve BE: full UUID atau prefix hex (>=4 karakter).
 * Selaras `backend/internal/database/uid.go` — `ResolveUID`.
 */
export const beResolvableUidSchema = z
  .string({ message: 'UID wajib diisi' })
  .trim()
  .min(1, 'UID wajib diisi')
  .refine(
    (value) => FULL_UUID_REGEX.test(value) || HEX_UID_PREFIX_REGEX.test(value),
    'Format UID tidak valid (full UUID atau prefix hex minimal 4 karakter)',
  )

export const paginationPageSchema = z
  .number({ message: 'Halaman harus berupa angka' })
  .int('Halaman harus bilangan bulat')
  .min(1, 'Halaman minimal 1')

export const paginationPerPageSchema = z
  .number({ message: 'Jumlah per halaman harus berupa angka' })
  .int('Jumlah per halaman harus bilangan bulat')
  .min(1, 'Jumlah per halaman minimal 1')
  .max(100, 'Jumlah per halaman maksimal 100')

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

/** Selaras `utils.MaxLessonAssignmentSubmissionAttachmentBytes` di BE — 10 MiB per file. */
export const MAX_LESSON_ASSIGNMENT_SUBMISSION_FILE_BYTES = 10 * 1024 * 1024

/** Selaras `entity.LessonAssignment.Title` — varchar(200). */
export const MAX_ASSIGNMENT_TITLE_LENGTH = 200

export const imageUploadFileSchema = z
  .instanceof(File, { message: 'File gambar tidak valid' })
  .refine((file) => file.size > 0, 'File gambar tidak boleh kosong')
  .refine((file) => file.size <= MAX_IMAGE_UPLOAD_BYTES, 'Ukuran gambar maksimal 5 MB')
  .refine(
    (file) => ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]),
    'Format gambar harus JPEG, PNG, WebP, atau GIF',
  )
