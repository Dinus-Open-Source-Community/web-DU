import { z } from 'zod'
import { normalizeYoutubeWatchUrl } from '@/lib/tiptap-media'
import { beResolvableUidSchema, lessonTitleSchema } from '../common'
import { richTextContentFormatSchema, richTextEnvelopeSchema } from './rich-text.schema'

/** Selaras `backend/internal/service/lessons.go` — youtubeURLRegex */
export const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]+$/

export const lessonDeliveryTypeSchema = z.enum(['text', 'video'], {
  message: 'content_type harus text atau video',
})

export const uidSchema = beResolvableUidSchema

export const orderIndexSchema = z
  .number({ message: 'Urutan lesson wajib diisi' })
  .int('Urutan lesson harus bilangan bulat')
  .min(1, 'Urutan lesson minimal 1')
  .max(9999, 'Urutan lesson maksimal 9999')

export const rfc3339DateTimeSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Format waktu harus RFC3339 yang valid')

export const youtubeUrlSchema = z
  .string({ message: 'URL video YouTube wajib diisi' })
  .trim()
  .min(1, 'URL video YouTube wajib diisi')
  .max(2048, 'URL video terlalu panjang')
  .transform((value) => normalizeYoutubeWatchUrl(value) ?? value)
  .refine((value) => YOUTUBE_URL_REGEX.test(value), 'video_url harus URL YouTube yang valid (youtube.com/watch?v= atau youtu.be/)')

const optionalRfc3339Schema = z.union([rfc3339DateTimeSchema, z.literal('')]).optional()

type LessonPayloadShape = {
  content_type?: 'text' | 'video'
  content?: z.infer<typeof richTextEnvelopeSchema> | null
  video_url?: string
}

function validateLessonDeliveryRules(
  data: LessonPayloadShape,
  ctx: z.RefinementCtx,
  options?: { requireContent?: boolean },
) {
  const contentType = data.content_type ?? 'text'
  const videoUrl = (data.video_url ?? '').trim()

  if (contentType === 'text') {
    if (options?.requireContent && (data.content == null || data.content === undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: 'content is required for text lessons',
        path: ['content'],
      })
      return
    }

    if (data.content != null && data.content !== undefined) {
      const contentResult = richTextEnvelopeSchema.safeParse(data.content)
      if (!contentResult.success) {
        for (const issue of contentResult.error.issues) {
          ctx.addIssue({ ...issue, path: ['content', ...issue.path] })
        }
      }
    }

    if (videoUrl) {
      ctx.addIssue({
        code: 'custom',
        message: 'video_url must be empty for text lessons',
        path: ['video_url'],
      })
    }
    return
  }

  if (contentType === 'video') {
    if (!videoUrl) {
      ctx.addIssue({
        code: 'custom',
        message: 'video_url is required for video lessons',
        path: ['video_url'],
      })
      return
    }

    if (!YOUTUBE_URL_REGEX.test(videoUrl)) {
      ctx.addIssue({
        code: 'custom',
        message: 'video_url must be a valid YouTube URL',
        path: ['video_url'],
      })
    }
  }
}

/** Input dari editor kurikulum sebelum di-build ke request BE. */
export const lessonPayloadInputSchema = z
  .object({
    module_uid: uidSchema,
    title: lessonTitleSchema,
    order_index: orderIndexSchema,
    deliveryType: lessonDeliveryTypeSchema,
    contentHtml: z.string().max(500_000, 'Konten terlalu panjang').optional(),
    contentFormat: richTextContentFormatSchema.optional(),
    videoUrl: z.string().max(2048).optional(),
    start_time: optionalRfc3339Schema,
    end_time: optionalRfc3339Schema,
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === 'text') {
      const html = (data.contentHtml ?? '').trim()
      if (!html) {
        ctx.addIssue({
          code: 'custom',
          message: 'Konten teks lesson wajib diisi',
          path: ['contentHtml'],
        })
        return
      }

      const envelopeResult = richTextEnvelopeSchema.safeParse({
        version: 2,
        contentHtml: html,
        contentType: data.contentFormat ?? 'tiptap',
      })

      if (!envelopeResult.success) {
        for (const issue of envelopeResult.error.issues) {
          ctx.addIssue({ ...issue, path: ['contentHtml', ...issue.path] })
        }
      }

      if ((data.videoUrl ?? '').trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'video_url must be empty for text lessons',
          path: ['videoUrl'],
        })
      }
      return
    }

    const normalized = normalizeYoutubeWatchUrl(data.videoUrl ?? '')
    if (!normalized || !YOUTUBE_URL_REGEX.test(normalized)) {
      ctx.addIssue({
        code: 'custom',
        message: 'video_url must be a valid YouTube URL',
        path: ['videoUrl'],
      })
    }
  })

/** Payload POST `/lessons` — selaras `dto.LessonCreateRequest` + `validateLessonPayload`. */
export const lessonCreateRequestSchema = z
  .object({
    module_uid: uidSchema,
    title: lessonTitleSchema,
    content_type: lessonDeliveryTypeSchema.optional(),
    content: richTextEnvelopeSchema.nullable().optional(),
    video_url: z.string().max(2048).optional().default(''),
    start_time: optionalRfc3339Schema,
    end_time: optionalRfc3339Schema,
    order_index: orderIndexSchema,
  })
  .superRefine((data, ctx) => {
    const contentType =
      data.content_type ??
      ((data.video_url ?? '').trim() ? ('video' as const) : ('text' as const))

    validateLessonDeliveryRules(
      {
        content_type: contentType,
        content: data.content ?? null,
        video_url: data.video_url,
      },
      ctx,
      { requireContent: contentType === 'text' },
    )
  })
  .transform((data) => {
    const contentType =
      data.content_type ??
      (data.video_url.trim() ? ('video' as const) : ('text' as const))

    return {
      ...data,
      content_type: contentType,
      video_url: contentType === 'video' ? (normalizeYoutubeWatchUrl(data.video_url) ?? data.video_url.trim()) : '',
      content: contentType === 'text' ? data.content ?? null : null,
    }
  })

/** Payload PUT `/lessons/:uid` — selaras `dto.LessonUpdateRequest` + `validateLessonPayload`. */
export const lessonUpdateRequestSchema = z
  .object({
    module_uid: uidSchema.optional(),
    title: lessonTitleSchema.optional(),
    content_type: lessonDeliveryTypeSchema.optional(),
    content: richTextEnvelopeSchema.nullable().optional(),
    video_url: z.string().max(2048).optional(),
    start_time: optionalRfc3339Schema,
    end_time: optionalRfc3339Schema,
    order_index: orderIndexSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.content_type && data.video_url === undefined && data.content === undefined) {
      return
    }

    const contentType = data.content_type ?? ((data.video_url ?? '').trim() ? 'video' : 'text')

    validateLessonDeliveryRules(
      {
        content_type: contentType,
        content: data.content ?? null,
        video_url: data.video_url ?? '',
      },
      ctx,
      { requireContent: contentType === 'text' && data.content !== undefined },
    )
  })
  .transform((data) => {
    if (!data.content_type) return data

    const contentType = data.content_type
    return {
      ...data,
      video_url:
        contentType === 'video'
          ? normalizeYoutubeWatchUrl(data.video_url ?? '') ?? (data.video_url ?? '').trim()
          : '',
      content: contentType === 'video' ? null : data.content,
    }
  })

export type LessonPayloadInputValidated = z.infer<typeof lessonPayloadInputSchema>
export type LessonCreateRequestValidated = z.infer<typeof lessonCreateRequestSchema>
export type LessonUpdateRequestValidated = z.infer<typeof lessonUpdateRequestSchema>
