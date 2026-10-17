/** Daftar tautan media sosial di halaman Settings — murni frontend (localStorage per user).
 *
 *  Backend `PATCH /user/profile` (dto.UpdateUserProfileRequest) saat ini hanya
 *  mengenal `name/email/description`, jadi section ini sengaja disimpan lokal
 *  per `user.uid` sampai ada kolom sosial di backend. Bentuk `SocialLinkItem`
 *  dibuat kompatibel untuk dipindah ke API nanti (platform + url).
 */

export type SocialPlatform =
  | 'instagram'
  | 'github'
  | 'linkedin'
  | 'youtube'
  | 'x'
  | 'facebook'
  | 'tiktok'
  | 'website'

export interface SocialLinkItem {
  id: string
  platform: SocialPlatform
  url: string
}

export interface SocialPlatformOption {
  value: SocialPlatform
  label: string
  placeholder: string
  /** Host yang diharapkan — dipakai untuk peringatan, bukan penolakan. */
  hosts: string[]
}

export const SOCIAL_PLATFORM_OPTIONS: SocialPlatformOption[] = [
  {
    value: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    hosts: ['instagram.com', 'www.instagram.com'],
  },
  {
    value: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/username',
    hosts: ['github.com', 'www.github.com'],
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
    hosts: ['linkedin.com', 'www.linkedin.com'],
  },
  {
    value: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@channel',
    hosts: ['youtube.com', 'www.youtube.com', 'youtu.be'],
  },
  {
    value: 'x',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/username',
    hosts: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
  },
  {
    value: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/username',
    hosts: ['facebook.com', 'www.facebook.com'],
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@username',
    hosts: ['tiktok.com', 'www.tiktok.com'],
  },
  {
    value: 'website',
    label: 'Website',
    placeholder: 'https://namadomain.com',
    hosts: [],
  },
]

export const MAX_SOCIAL_LINKS = 10

export function socialPlatformLabel(platform: SocialPlatform): string {
  return SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === platform)?.label ?? platform
}

export function socialStorageKey(userUid: string): string {
  return `settings:social-links:${userUid}`
}

/** Normalisasi input user: trim + tambahkan https:// bila skema hilang. */
export function normalizeSocialUrl(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed === '') return ''
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export type SocialLinkValidation =
  | { ok: true; url: string; hostWarning: string | null }
  | { ok: false; error: string }

export function validateSocialLink(platform: SocialPlatform, rawUrl: string): SocialLinkValidation {
  const url = normalizeSocialUrl(rawUrl)
  if (url === '') return { ok: false, error: 'URL tidak boleh kosong.' }
  if (url.length > 2048) return { ok: false, error: 'URL terlalu panjang (maks 2048 karakter).' }
  if (!isValidHttpUrl(url)) {
    return { ok: false, error: 'URL tidak valid. Contoh: https://instagram.com/username' }
  }

  const option = SOCIAL_PLATFORM_OPTIONS.find((item) => item.value === platform)
  if (option && option.hosts.length > 0) {
    const host = new URL(url).hostname.toLowerCase()
    const matched = option.hosts.some((h) => host === h || host.endsWith(`.${h.replace(/^www\./, '')}`))
    if (!matched) {
      return {
        ok: true,
        url,
        hostWarning: `URL ini tidak terlihat seperti ${option.label} (contoh: ${option.placeholder}). Tetap disimpan?`,
      }
    }
  }
  return { ok: true, url, hostWarning: null }
}

export function loadSocialLinks(userUid: string): SocialLinkItem[] {
  if (typeof window === 'undefined' || !userUid) return []
  try {
    const raw = window.localStorage.getItem(socialStorageKey(userUid))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const validPlatforms = new Set(SOCIAL_PLATFORM_OPTIONS.map((o) => o.value))
    return parsed
      .filter(
        (entry): entry is SocialLinkItem =>
          typeof entry === 'object' &&
          entry !== null &&
          typeof (entry as SocialLinkItem).id === 'string' &&
          validPlatforms.has((entry as SocialLinkItem).platform) &&
          typeof (entry as SocialLinkItem).url === 'string' &&
          isValidHttpUrl((entry as SocialLinkItem).url),
      )
      .slice(0, MAX_SOCIAL_LINKS)
  } catch {
    return []
  }
}

export function persistSocialLinks(userUid: string, links: SocialLinkItem[]): void {
  if (typeof window === 'undefined' || !userUid) return
  try {
    window.localStorage.setItem(socialStorageKey(userUid), JSON.stringify(links))
  } catch {
    // Kuota penuh / mode privat — biarkan state in-memory tetap jalan.
  }
}

export function createSocialLinkId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `social-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
}
