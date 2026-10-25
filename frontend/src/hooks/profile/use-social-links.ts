import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchSelfUserData, updateUserProfile } from '@/services/user'

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

/** CRUD tautan sosial per user. Persist ke backend dan localStorage sebagai fallback. */
export function useSocialLinks(userUid: string) {
  const [links, setLinks] = useState<SocialLinkItem[]>([])
  const hydrated = useRef(false)

  useEffect(() => {
    hydrated.current = false
    let active = true
    void fetchSelfUserData()
      .then((profile) => {
        if (!active) return
        setLinks(profile.social_links ?? loadSocialLinks(userUid))
        hydrated.current = true
      })
      .catch(() => {
        if (active) setLinks(loadSocialLinks(userUid))
        hydrated.current = true
      })
    return () => {
      active = false
    }
  }, [userUid])

  useEffect(() => {
    persistSocialLinks(userUid, links)
    if (userUid && hydrated.current) {
      void updateUserProfile({ social_links: links })
    }
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
