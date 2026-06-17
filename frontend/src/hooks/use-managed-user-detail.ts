import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  applyResolvedImagesToManagedUserDetail,
  collectManagedUserDetailImageReferences,
} from '@/lib/files'
import { presentManagedUserDetail } from '@/lib/user-manage/user-detail-presenter'
import type { UserManageKind } from '@/lib/user-manage/page-config'
import { useResolveProtectedFiles } from '@/hooks/files/use-resolve-protected-files'
import { fetchManagedUserDetail } from '@/services/user-manage'
import { userManageKeys } from './query-keys'

type UseManagedUserDetailOptions = {
  uid: string
  kind: UserManageKind
  enabled?: boolean
}

export function useManagedUserDetail({ uid, kind, enabled = true }: UseManagedUserDetailOptions) {
  const query = useQuery({
    queryKey: userManageKeys.detail(uid),
    queryFn: () => fetchManagedUserDetail(uid),
    enabled: Boolean(uid) && enabled,
  })

  const imageReferences = useMemo(
    () => collectManagedUserDetailImageReferences(query.data),
    [query.data],
  )

  const fileResolver = useResolveProtectedFiles(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
    singleReferences: query.data?.avatar_url ? [query.data.avatar_url] : [],
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    const resolved = applyResolvedImagesToManagedUserDetail(
      query.data,
      fileResolver.getDisplayUrl,
    )
    return presentManagedUserDetail(resolved, kind)
  }, [fileResolver.getDisplayUrl, kind, query.data])

  return {
    ...query,
    data,
    isResolvingImages: fileResolver.isLoading || fileResolver.isFetching,
  }
}
