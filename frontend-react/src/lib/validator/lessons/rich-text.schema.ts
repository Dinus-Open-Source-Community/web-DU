import { z } from 'zod'
import { RICH_TEXT_CONTENT_VERSION } from '@/lib/types/rich-text'

export const richTextContentFormatSchema = z.enum(['tiptap', 'html'], {
  message: 'Format konten harus tiptap atau html',
})

const EMPTY_HTML_PATTERN = /^(?:<p>\s*(?:<br\s*\/?>)?\s*<\/p>|<br\s*\/?>|\s|&nbsp;)*$/i

function hasMeaningfulHtml(html: string): boolean {
  const trimmed = html.trim()
  if (!trimmed) return false
  if (EMPTY_HTML_PATTERN.test(trimmed)) return false
  if (/<(img|iframe|video|table|ul|ol|blockquote|pre|div)[\s>]/i.test(trimmed)) return true
  if (/data-youtube-video/i.test(trimmed)) return true

  const textOnly = trimmed
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return textOnly.length > 0
}

export const richTextEnvelopeSchema = z
  .object({
    version: z
      .number({ message: 'Versi konten wajib berupa angka' })
      .int('Versi konten harus bilangan bulat')
      .positive('Versi konten harus lebih dari 0')
      .max(99, 'Versi konten tidak valid')
      .default(RICH_TEXT_CONTENT_VERSION),
    contentHtml: z
      .string({ message: 'Konten HTML wajib diisi' })
      .min(1, 'Konten HTML wajib diisi')
      .max(500_000, 'Konten terlalu panjang (maks. 500.000 karakter)')
      .refine(hasMeaningfulHtml, 'Konten lesson tidak boleh kosong'),
    contentType: richTextContentFormatSchema,
  })
  .strict()

export type RichTextEnvelopeInput = z.input<typeof richTextEnvelopeSchema>
export type RichTextEnvelopeValidated = z.output<typeof richTextEnvelopeSchema>
