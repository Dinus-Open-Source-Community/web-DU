import { useCallback, useEffect, useState } from 'react'

import {
  MAX_SOCIAL_LINKS,
  createSocialLinkId,
  loadSocialLinks,
  persistSocialLinks,
  validateSocialLink,
  type SocialLinkItem,
  type SocialPlatform,
} from '@/lib/profile/social-links'

export type AddSocialLinkOutcome =
  | { ok: true; warning?: string }
  | { ok: false; error: string }

/** CRUD tautan sosial per user (localStorage). Persist otomatis tiap berubah. */
export function useSocialLinks(userUid: string) {
  const [links, setLinks] = useState<SocialLinkItem[]>([])

  useEffect(() => {
    setLinks(loadSocialLinks(userUid))
  }, [userUid])

  useEffect(() => {
    persistSocialLinks(userUid, links)
  }, [links, userUid])

  const addSocialLink = useCallback(
    (platform: SocialPlatform, rawUrl: string): AddSocialLinkOutcome => {
      const validation = validateSocialLink(platform, rawUrl)
      if (!validation.ok) return { ok: false, error: validation.error }
      if (links.length >= MAX_SOCIAL_LINKS) {
        return { ok: false, error: `Maksimal ${MAX_SOCIAL_LINKS} tautan sosial.` }
      }
      if (links.some((item) => item.url.toLowerCase() === validation.url.toLowerCase())) {
        return { ok: false, error: 'URL ini sudah ditambahkan.' }
      }

      setLinks((prev) => [...prev, { id: createSocialLinkId(), platform, url: validation.url }])
      if (validation.hostWarning) return { ok: true, warning: validation.hostWarning }
      return { ok: true }
    },
    [links],
  )

  const removeSocialLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return { links, addSocialLink, removeSocialLink }
}
