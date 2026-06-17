import { z } from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email wajib diisi')
  .max(150, 'Email maksimal 150 karakter')
  .email('Format email tidak valid')
  .transform((value) => value.toLowerCase())

export const requiredStringSchema = (fieldName: string) => z.string().trim().min(1, `${fieldName} wajib diisi`)

/** Selaras `entity.User.Name` — varchar(150). */
export const userNameSchema = requiredStringSchema('Nama')
  .min(2, 'Nama minimal 2 karakter')
  .max(150, 'Nama maksimal 150 karakter')

/** Selaras `entity.User.Description` — type text (batas FE konservatif). */
export const userDescriptionSchema = z
  .string()
  .trim()
  .max(10_000, 'Deskripsi maksimal 10000 karakter')

/** Selaras `entity.Module.Title` / `entity.Lesson.Title` — varchar(200). */
export const moduleTitleSchema = requiredStringSchema('Judul modul').max(200, 'Judul modul maksimal 200 karakter')

export const lessonTitleSchema = requiredStringSchema('Judul lesson').max(200, 'Judul lesson maksimal 200 karakter')

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

/** Cover/thumbnail kursus — BE `UploadFile` tidak membatasi MIME ketat di handler create course. */
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

/** Avatar — selaras `utils.allowedAvatarExts` + magic-byte check di BE. */
export const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'] as const

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

export const MAX_FILE_PROXY_BATCH_OBJECTS = 50

export const searchQuerySchema = z
  .string()
  .trim()
  .max(200, 'Kata kunci pencarian maksimal 200 karakter')

export const positiveIntSchema = z
  .number({ message: 'Nilai harus berupa angka' })
  .int('Nilai harus bilangan bulat')
  .positive('Nilai harus lebih dari 0')

export const nonNegativeIntSchema = z
  .number({ message: 'Nilai harus berupa angka' })
  .int('Nilai harus bilangan bulat')
  .min(0, 'Nilai tidak boleh negatif')

/** Selaras `dto.CreatePaymentRequest.Method` — binding oneof Tripay. */
export const PAYMENT_METHOD_CODES = [
  'PERMATAVA',
  'BNIVA',
  'BRIVA',
  'MANDIRIVA',
  'BCAVA',
  'MUAMALATVA',
  'CIMBVA',
  'BSIVA',
  'OCBCVA',
  'DANAMONVA',
  'OVO',
  'DANA',
  'QRIS2',
] as const

export const paymentMethodCodeSchema = z.enum(PAYMENT_METHOD_CODES, {
  message: 'Metode pembayaran tidak valid',
})

export const returnUrlSchema = z
  .string()
  .trim()
  .max(2048, 'Return URL terlalu panjang')
  .refine(
    (value) => {
      if (!value) return true
      try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    },
    'Return URL harus http(s) yang valid',
  )
  .optional()

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

/** Selaras `utils.ValidateAndReencodeAvatar` — jpg/jpeg/png/gif, max 5 MiB. */
export const avatarUploadFileSchema = z
  .instanceof(File, { message: 'Silakan pilih file foto terlebih dahulu' })
  .refine((file) => file.size > 0, 'File foto tidak boleh kosong')
  .refine((file) => file.size <= MAX_IMAGE_UPLOAD_BYTES, 'Ukuran foto maksimal 5MB')
  .refine(
    (file) => ALLOWED_AVATAR_MIME_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number]),
    'Tipe file tidak valid. Silakan pilih file gambar (jpg, png, gif).',
  )

export const beUidParamSchema = beResolvableUidSchema
