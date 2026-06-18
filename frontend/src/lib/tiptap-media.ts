import type { Editor } from '@tiptap/core'

import { isResolvableProtectedFileReference } from '@/lib/files/parse-protected-file-reference'
import {
  resolveSafeEmbedUrl,
  resolveSafeExternalHref,
  resolveSafeImageSrc,
} from '@/lib/security/safe-external-url'
import type { SavedTextSelection } from '@/lib/tiptap-selection'
import { restoreTextSelection } from '@/lib/tiptap-selection'

export type TiptapMediaKind = 'link' | 'image' | 'youtube'

const PLACEHOLDER_LINK_PREFIXES = ['https://', 'http://'] as const

/** Normalize user input for lesson editor media (http(s), /files/, files/). */
export function normalizeTiptapMediaUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return trimmed
  if (trimmed.startsWith('files/')) return `/${trimmed}`
  return trimmed
}

export function isPlaceholderLinkUrl(input: string): boolean {
  const trimmed = input.trim()
  return PLACEHOLDER_LINK_PREFIXES.some((prefix) => trimmed === prefix)
}

export function normalizeYoutubeWatchUrl(input: string): string | null {
  const s = normalizeTiptapMediaUrl(input)
  if (!s) return null
  try {
    const u = new URL(s)
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '')
      return id ? `https://www.youtube.com/watch?v=${id}` : null
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/watch?v=${v}`
      const shorts = u.pathname.match(/\/shorts\/([^/?]+)/)
      if (shorts?.[1]) return `https://www.youtube.com/watch?v=${shorts[1]}`
    }
    return s
  } catch {
    return null
  }
}

export function getYoutubeEmbedUrl(input: string): string | null {
  const normalized = normalizeTiptapMediaUrl(input)
  return resolveSafeEmbedUrl(normalized) ?? resolveSafeEmbedUrl(normalizeYoutubeWatchUrl(normalized) ?? '')
}

export function isValidHttpUrl(input: string): boolean {
  return resolveSafeExternalHref(normalizeTiptapMediaUrl(input)) !== null
}

export function validateMediaUrl(kind: TiptapMediaKind, input: string): string | null {
  const trimmed = normalizeTiptapMediaUrl(input)
  if (!trimmed) return 'URL wajib diisi.'
  if (kind === 'link' && isPlaceholderLinkUrl(trimmed)) {
    return 'Masukkan URL tautan yang valid (http/https).'
  }

  switch (kind) {
    case 'link':
      return resolveSafeExternalHref(trimmed) ? null : 'Masukkan URL tautan yang valid (http/https).'
    case 'image':
      return resolveSafeImageSrc(trimmed) ? null : 'Masukkan URL gambar yang valid (http/https atau /files/...).'
    case 'youtube':
      return getYoutubeEmbedUrl(trimmed) ? null : 'URL YouTube tidak valid.'
    default:
      return null
  }
}

export function insertTiptapLink(
  editor: Editor,
  rawUrl: string,
  savedSelection?: SavedTextSelection | null,
): boolean {
  const href = normalizeTiptapMediaUrl(rawUrl)
  if (!resolveSafeExternalHref(href)) return false

  restoreTextSelection(editor, savedSelection)

  const { empty } = editor.state.selection
  if (empty) {
    return editor
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: href,
        marks: [{ type: 'link', attrs: { href } }],
      })
      .run()
  }

  return editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
}

export function insertTiptapImage(editor: Editor, rawUrl: string): boolean {
  const src = normalizeTiptapMediaUrl(rawUrl)
  if (!resolveSafeImageSrc(src)) return false

  return editor
    .chain()
    .focus()
    .setImage({
      src,
      alt: isResolvableProtectedFileReference(src) ? 'Gambar lesson' : '',
    })
    .run()
}

export function insertTiptapYoutube(editor: Editor, rawUrl: string): boolean {
  const normalized = normalizeYoutubeWatchUrl(rawUrl)
  if (!normalized) return false
  return editor.chain().focus().setYoutubeVideo({ src: normalized }).run()
}
