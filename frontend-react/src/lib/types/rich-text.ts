/**
 * Rich text envelope — isi field `content` pada lesson/assignment.
 * Selaras dengan `backend/internal/service/rich_text.go`.
 *
 * BUKAN sama dengan `LessonDeliveryType` (`content_type` di level lesson).
 */

export const RICH_TEXT_CONTENT_VERSION = 2 as const

/**
 * Format HTML di dalam envelope `content`.
 * - `tiptap` — diedit via WYSIWYG (Tiptap)
 * - `html` — HTML mentah dari backend / legacy
 */
export type RichTextContentFormat = 'tiptap' | 'html'

/** Payload JSONB field `content` — response & request body. */
export interface RichTextEnvelope {
  version: number
  contentHtml: string
  /** Format rich text (bukan `content_type` lesson). */
  contentType: RichTextContentFormat
}

/** Hasil parsing envelope untuk editor/viewer. */
export interface ParsedRichTextContent {
  contentHtml: string
  /** Alias internal — sama dengan `RichTextEnvelope.contentType`. */
  contentFormat: RichTextContentFormat
  version: number
}

export type TiptapEditorVariant = 'default' | 'compact'

export interface TiptapEditorProps {
  initialContent: string
  onChange: (html: string) => void
  placeholder?: string
  variant?: TiptapEditorVariant
}
