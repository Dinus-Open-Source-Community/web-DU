export type TiptapMediaKind = 'link' | 'image' | 'youtube'

export function normalizeYoutubeWatchUrl(input: string): string | null {
  const s = input.trim()
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
  const watchUrl = normalizeYoutubeWatchUrl(input)
  if (!watchUrl) return null
  try {
    const u = new URL(watchUrl)
    const v = u.searchParams.get('v')
    return v ? `https://www.youtube.com/embed/${v}` : null
  } catch {
    return null
  }
}

export function isValidHttpUrl(input: string): boolean {
  try {
    const u = new URL(input.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateMediaUrl(kind: TiptapMediaKind, input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return kind === 'link' ? null : 'URL wajib diisi.'

  switch (kind) {
    case 'link':
      return isValidHttpUrl(trimmed) ? null : 'Masukkan URL tautan yang valid (http/https).'
    case 'image':
      return isValidHttpUrl(trimmed) ? null : 'Masukkan URL gambar yang valid (http/https).'
    case 'youtube':
      return normalizeYoutubeWatchUrl(trimmed) ? null : 'URL YouTube tidak valid.'
    default:
      return null
  }
}
