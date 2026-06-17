import {
  RICH_TEXT_CONTENT_VERSION,
  type ParsedRichTextContent,
  type RichTextContentFormat,
  type RichTextEnvelope,
} from './types/rich-text'
import type {
  CourseDetailLesson,
  LessonCreateRequest,
  LessonDeliveryType,
  LessonPayloadInput,
  LessonUpdateRequest,
} from './types/lesson'

export type { ParsedRichTextContent, RichTextContentFormat, RichTextEnvelope }

export type LessonContentRaw = string | RichTextEnvelopePartial | null | undefined

type RichTextEnvelopePartial = {
  contentHtml?: string
  content_html?: string
  html?: string
  version?: number
  contentType?: string
  content_type?: string
}

const EMPTY_CONTENT: ParsedRichTextContent = {
  contentHtml: '',
  contentFormat: 'tiptap',
  version: RICH_TEXT_CONTENT_VERSION,
}

function normalizeContentFormat(value: string | undefined): RichTextContentFormat {
  if (!value) return 'tiptap'
  const normalized = value.trim().toLowerCase()
  return normalized === 'html' ? 'html' : 'tiptap'
}

function extractContentHtml(obj: RichTextEnvelopePartial): string {
  if (typeof obj.contentHtml === 'string') return obj.contentHtml
  if (typeof obj.content_html === 'string') return obj.content_html
  if (typeof obj.html === 'string') return obj.html
  return ''
}

function extractVersion(obj: RichTextEnvelopePartial): number {
  const version = obj.version
  return typeof version === 'number' && version > 0 ? version : RICH_TEXT_CONTENT_VERSION
}

function parseLessonContentObject(obj: RichTextEnvelopePartial): ParsedRichTextContent {
  const contentHtml = extractContentHtml(obj)
  const envelopeType = obj.contentType ?? obj.content_type
  return {
    contentHtml,
    contentFormat: normalizeContentFormat(envelopeType),
    version: extractVersion(obj),
  }
}

/** Parse field `content` dari response API lesson/assignment. */
export function parseLessonContent(raw: LessonContentRaw): ParsedRichTextContent {
  if (raw == null) return EMPTY_CONTENT

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return EMPTY_CONTENT

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as RichTextEnvelopePartial
        return parseLessonContent(parsed)
      } catch {
        return { contentHtml: trimmed, contentFormat: 'html', version: RICH_TEXT_CONTENT_VERSION }
      }
    }

    return { contentHtml: trimmed, contentFormat: 'html', version: RICH_TEXT_CONTENT_VERSION }
  }

  return parseLessonContentObject(raw)
}

/** Bangun envelope rich text untuk field `content`. */
export function toRichTextEnvelope(
  contentHtml: string,
  contentFormat: RichTextContentFormat = 'tiptap',
): RichTextEnvelope {
  return {
    version: RICH_TEXT_CONTENT_VERSION,
    contentHtml: contentHtml.trim() || '<p></p>',
    contentType: contentFormat,
  }
}

/**
 * Field `content` sesuai aturan BE:
 * - `text` → envelope wajib
 * - `video` → null (BE menghapus content pada update video lesson)
 */
export function buildLessonContentField(
  deliveryType: LessonDeliveryType,
  contentHtml: string,
  contentFormat: RichTextContentFormat = 'tiptap',
): RichTextEnvelope | null {
  if (deliveryType === 'video') return null

  const trimmed = contentHtml.trim()
  if (!trimmed) return toRichTextEnvelope('<p></p>', contentFormat)

  return toRichTextEnvelope(trimmed, contentFormat)
}

/** Payload POST `/lessons` — selaras `dto.LessonCreateRequest` + `validateLessonPayload`. */
export function buildLessonCreatePayload(input: LessonPayloadInput): LessonCreateRequest {
  const deliveryType = input.deliveryType
  const videoUrl = deliveryType === 'video' ? (input.videoUrl ?? '').trim() : ''

  return {
    module_uid: input.module_uid,
    title: input.title,
    content_type: deliveryType,
    content: buildLessonContentField(deliveryType, input.contentHtml ?? '', input.contentFormat),
    video_url: videoUrl,
    start_time: input.start_time,
    end_time: input.end_time,
    order_index: input.order_index,
  }
}

/** Payload PUT `/lessons/:uid`. */
export function buildLessonUpdatePayload(input: LessonPayloadInput): LessonUpdateRequest {
  const deliveryType = input.deliveryType
  const videoUrl = deliveryType === 'video' ? (input.videoUrl ?? '').trim() : ''

  return {
    module_uid: input.module_uid,
    title: input.title,
    content_type: deliveryType,
    content: buildLessonContentField(deliveryType, input.contentHtml ?? '', input.contentFormat),
    video_url: videoUrl,
    start_time: input.start_time,
    end_time: input.end_time,
    order_index: input.order_index,
  }
}

/** Map state editor → bentuk `CourseDetailLesson` untuk outline/preview lokal. */
export function toCourseDetailLesson(
  lesson: {
    uid?: string
    id: string
    title: string
    order: number
    contentType: LessonDeliveryType
    contentHtml?: string
    contentFormat?: RichTextContentFormat
    videoUrl?: string
  },
  moduleUid: string,
  index: number,
): CourseDetailLesson {
  const deliveryType: LessonDeliveryType = lesson.contentType === 'video' ? 'video' : 'text'

  return {
    uid: lesson.uid ?? lesson.id,
    module_uid: moduleUid,
    title: lesson.title,
    content_type: deliveryType,
    content: buildLessonContentField(deliveryType, lesson.contentHtml ?? '', lesson.contentFormat),
    video_url: deliveryType === 'video' ? (lesson.videoUrl ?? '') : '',
    start_time: '',
    end_time: '',
    order_index: lesson.order ?? index + 1,
    created_at: '',
    updated_at: '',
  }
}
