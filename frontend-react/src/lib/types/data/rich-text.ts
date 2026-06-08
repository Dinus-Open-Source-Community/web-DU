/** Versi envelope rich text yang didukung backend. */
export const RICH_TEXT_CONTENT_VERSION = 2 as const

/** Format HTML di dalam envelope `content`. */
export type RichTextContentFormat = 'tiptap' | 'html'

/** Payload JSONB field `content` — response & request body. */
export interface IRichTextEnvelope {
  version: number
  contentHtml: string
  contentType: RichTextContentFormat
}

/** Hasil parsing envelope untuk editor/viewer. */
export interface IParsedRichTextContent {
  contentHtml: string
  contentFormat: RichTextContentFormat
  version: number
}

/** Alias backward-compat. */
export type RichTextEnvelope = IRichTextEnvelope
export type ParsedRichTextContent = IParsedRichTextContent
