import type { InstructionAttachmentApiRaw } from '@/lib/lesson-assignment/api-types'
import type { LessonAssignmentInstructionAttachment } from '@/lib/types/lesson'

export function normalizeInstructionAttachment(
  raw: InstructionAttachmentApiRaw | null | undefined,
): LessonAssignmentInstructionAttachment | null {
  if (!raw) return null

  const url = String(raw.url ?? raw.link ?? '').trim()
  const name = String(raw.name ?? raw.fileName ?? raw.filename ?? '').trim()

  if (!url && !name) return null

  return {
    url,
    name: name || extractNameFromUrl(url),
  }
}

export function normalizeInstructionAttachments(
  raw: InstructionAttachmentApiRaw[] | null | undefined,
): LessonAssignmentInstructionAttachment[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map(normalizeInstructionAttachment)
    .filter((item): item is LessonAssignmentInstructionAttachment => item !== null)
}

export function sanitizeInstructionAttachmentsForPayload(
  attachments: LessonAssignmentInstructionAttachment[],
): LessonAssignmentInstructionAttachment[] {
  return attachments
    .map((item) => ({
      name: item.name.trim(),
      url: item.url.trim(),
    }))
    .filter((item) => item.name.length > 0 && item.url.length > 0)
}

export function isValidInstructionAttachmentUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/files/')) return true

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateInstructionAttachments(
  attachments: LessonAssignmentInstructionAttachment[],
): string | null {
  for (const [index, item] of attachments.entries()) {
    const label = `#${index + 1}`

    if (!item.name.trim()) {
      return `Nama lampiran instruksi ${label} wajib diisi.`
    }

    if (!item.url.trim()) {
      return `URL lampiran instruksi ${label} wajib diisi.`
    }

    if (!isValidInstructionAttachmentUrl(item.url)) {
      return `URL lampiran instruksi ${label} harus berupa link http(s) atau path /files/...`
    }
  }

  return null
}

function extractNameFromUrl(url: string): string {
  const segment = url.split('/').filter(Boolean).pop()
  return segment ? decodeURIComponent(segment) : 'Lampiran'
}
