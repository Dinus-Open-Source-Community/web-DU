import type { InstructionAttachmentApiRaw } from '@/lib/lesson-assignment/api-types'
import type { LessonAssignmentInstructionAttachment } from '@/lib/types/lesson'
import { resolveSafeExternalHref } from '@/lib/security/safe-external-url'
import {
  messageInstructionAttachmentLinkInvalid,
  messageInstructionAttachmentLinkRequired,
  messageInstructionAttachmentNameRequired,
} from '@/lib/Message'

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
  return resolveSafeExternalHref(url.trim()) !== null
}

export function validateInstructionAttachments(
  attachments: LessonAssignmentInstructionAttachment[],
): string | null {
  for (const [index, item] of attachments.entries()) {
    const label = index + 1

    if (!item.name.trim()) {
      return messageInstructionAttachmentNameRequired(label)
    }

    if (!item.url.trim()) {
      return messageInstructionAttachmentLinkRequired(label)
    }

    if (!isValidInstructionAttachmentUrl(item.url)) {
      return messageInstructionAttachmentLinkInvalid(label)
    }
  }

  return null
}

function extractNameFromUrl(url: string): string {
  const segment = url.split('/').filter(Boolean).pop()
  return segment ? decodeURIComponent(segment) : 'Lampiran'
}
