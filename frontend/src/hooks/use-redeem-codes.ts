import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchCandidateStudentsForRedeem,
  fetchRedeemCodes,
  generateRedeemCode,
  type IGenerateRedeemCodePayload,
} from '@/services/redeem'
import type { IQueryParamsPayload } from '@/services/api-path'
import { useProtectedFileMap } from '@/hooks/files/use-protected-file-map'
import { redeemCodeKeys } from './query-keys'

export function useRedeemCodes(
  params?: IQueryParamsPayload,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: redeemCodeKeys.list(params),
    queryFn: () => fetchRedeemCodes(params),
    enabled: options?.enabled ?? true,
  })

  const imageReferences = useMemo(() => {
    const urls: string[] = []
    for (const item of query.data?.items ?? []) {
      const avatar = item.target_user?.avatar_url?.trim()
      if (avatar) urls.push(avatar)
    }
    return urls
  }, [query.data?.items])

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return {
      ...query.data,
      items: query.data.items.map((item) => {
        if (!item.target_user) return item
        const resolvedAvatar = fileMap.getDisplayUrl(item.target_user.avatar_url)
        return {
          ...item,
          target_user: {
            ...item.target_user,
            avatar_url: resolvedAvatar || item.target_user.avatar_url,
          },
        }
      }),
    }
  }, [fileMap, query.data])

  return {
    ...query,
    data,
  }
}

export function useGenerateRedeemCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IGenerateRedeemCodePayload) => generateRedeemCode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: redeemCodeKeys.all })
    },
  })
}

export function useRedeemCandidateStudents(
  courseUid?: string,
  params?: IQueryParamsPayload,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: redeemCodeKeys.candidateStudents(courseUid, params),
    queryFn: () =>
      fetchCandidateStudentsForRedeem({
        ...params,
        course_uid: courseUid || undefined,
      }),
    enabled: options?.enabled ?? true,
  })

  const imageReferences = useMemo(() => {
    const urls: string[] = []
    for (const user of query.data?.users ?? []) {
      const avatar = user.avatar_url?.trim()
      if (avatar) urls.push(avatar)
    }
    return urls
  }, [query.data?.users])

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return {
      ...query.data,
      users: query.data.users.map((user) => ({
        ...user,
        avatar_url: fileMap.getDisplayUrl(user.avatar_url) || user.avatar_url,
      })),
    }
  }, [fileMap, query.data])

  return {
    ...query,
    data,
  }
}
