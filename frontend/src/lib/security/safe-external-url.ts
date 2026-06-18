import { getEmbedUrl } from '@/lib/course-module-viewer/lesson-viewer-utils'

const ALLOWED_EMBED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
])

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, '')
}

function isAllowedEmbedHost(hostname: string) {
  const normalized = normalizeHostname(hostname)
  return ALLOWED_EMBED_HOSTS.has(normalized) || normalized.endsWith('.youtube.com')
}

function normalizeYoutubeEmbedUrl(parsed: URL): string | null {
  const host = normalizeHostname(parsed.hostname)
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const match = parsed.pathname.match(/^\/embed\/([^/?#]+)/)
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
  }
  return null
}

function normalizeVimeoEmbedUrl(parsed: URL): string | null {
  if (normalizeHostname(parsed.hostname) !== 'player.vimeo.com') {
    return null
  }

  const match = parsed.pathname.match(/^\/video\/(\d+)/)
  if (!match?.[1]) {
    return null
  }

  return `https://player.vimeo.com/video/${match[1]}`
}

const SAFE_DATA_IMAGE_PREFIXES = [
  'data:image/png;',
  'data:image/jpeg;',
  'data:image/jpg;',
  'data:image/gif;',
  'data:image/webp;',
] as const

function isSafeDataImageUrl(value: string): boolean {
  const lower = value.toLowerCase()
  return SAFE_DATA_IMAGE_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

/** Allows http(s), same-origin paths, and data:image/* for QR/thumbnail payloads from trusted APIs. */
export function resolveSafeImageSrc(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  if (isSafeDataImageUrl(trimmed)) {
    return trimmed
  }

  return resolveSafeExternalHref(trimmed)
}

/** Allows same-origin relative paths and http(s) absolute URLs. Blocks javascript:, data:, etc. */
export function resolveSafeExternalHref(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('://')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href
    }
  } catch {
    return null
  }

  return null
}

/** Whitelist YouTube/Vimeo embed URLs for iframe src. */
export function resolveSafeEmbedUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:') {
      return null
    }

    if (!isAllowedEmbedHost(parsed.hostname)) {
      return getEmbedUrl(trimmed)
    }

    return normalizeYoutubeEmbedUrl(parsed) ?? normalizeVimeoEmbedUrl(parsed) ?? getEmbedUrl(trimmed)
  } catch {
    return null
  }
}
