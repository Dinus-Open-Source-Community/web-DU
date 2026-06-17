import { useMemo } from 'react'

import { applyResolvedAvatarToUserProfile } from '@/lib/files/apply-resolved-images'
import type { IUserData } from '@/lib/types/user'

import { useResolveProtectedFiles } from './use-resolve-protected-files'

/** Profil: hanya avatar di-resolve saat boot auth; cover kursus di halaman terkait. */
export function useResolvedAuthProfile(rawProfile: IUserData | null) {
  const avatarReference = rawProfile?.avatar_url?.trim() ?? ''
  const avatarReferences = avatarReference ? [avatarReference] : []

  const fileResolver = useResolveProtectedFiles(avatarReferences, {
    enabled: Boolean(rawProfile),
    singleReferences: avatarReferences,
  })

  const profile = useMemo(() => {
    if (!rawProfile) return null
    return applyResolvedAvatarToUserProfile(rawProfile, fileResolver.getDisplayUrl)
  }, [fileResolver.getDisplayUrl, rawProfile])

  return {
    profile,
    isResolvingImages: fileResolver.isLoading || fileResolver.isFetching,
  }
}
