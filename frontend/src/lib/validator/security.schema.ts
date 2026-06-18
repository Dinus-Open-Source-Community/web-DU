import { z } from 'zod'

import {
  resolveSafeEmbedUrl,
  resolveSafeExternalHref,
  resolveSafeImageSrc,
} from '@/lib/security/safe-external-url'

/** External or internal navigable URL — blocks javascript:, data:, vbscript:, etc. */
export const safeExternalHrefSchema = z
  .string()
  .trim()
  .min(1, 'URL wajib diisi')
  .max(2048, 'URL terlalu panjang')
  .refine((value) => resolveSafeExternalHref(value) !== null, 'URL tidak valid atau tidak diizinkan')

/** YouTube/Vimeo embed URL for iframe src. */
export const safeEmbedUrlSchema = z
  .string()
  .trim()
  .min(1, 'URL embed wajib diisi')
  .max(2048, 'URL embed terlalu panjang')
  .refine((value) => resolveSafeEmbedUrl(value) !== null, 'URL embed video tidak valid atau tidak diizinkan')

/** Image src from API — http(s), /files/, or data:image/*. */
export const safeImageSrcSchema = z
  .string()
  .trim()
  .min(1, 'URL gambar wajib diisi')
  .max(4096, 'URL gambar terlalu panjang')
  .refine((value) => resolveSafeImageSrc(value) !== null, 'URL gambar tidak valid atau tidak diizinkan')

export type SafeExternalHrefValidated = z.infer<typeof safeExternalHrefSchema>
export type SafeEmbedUrlValidated = z.infer<typeof safeEmbedUrlSchema>
export type SafeImageSrcValidated = z.infer<typeof safeImageSrcSchema>
