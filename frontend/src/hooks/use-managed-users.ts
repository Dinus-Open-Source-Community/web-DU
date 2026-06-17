import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  applyResolvedImagesToManagedUsersList,
  collectManagedUsersListImageReferences,
} from '@/lib/files'
import type { ManagedUserListParams } from '@/lib/user-manage/types'
import { useProtectedFileMap } from '@/hooks/files/use-protected-file-map'
import { fetchManagedUsers } from '@/services/user-manage'
import { userManageKeys } from './query-keys'

export function useManagedUsers(params?: ManagedUserListParams) {
  const query = useQuery({
    queryKey: userManageKeys.list(params),
    queryFn: () => fetchManagedUsers(params),
  })

  const imageReferences = useMemo(
    () => collectManagedUsersListImageReferences(query.data?.users),
    [query.data?.users],
  )

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return applyResolvedImagesToManagedUsersList(query.data, fileMap.getDisplayUrl)
  }, [fileMap.getDisplayUrl, query.data])

  return {
    ...query,
    data,
    isResolvingImages: fileMap.isLoading || fileMap.isFetching,
  }
}
