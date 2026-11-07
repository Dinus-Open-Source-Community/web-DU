import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchCandidateStudentsForRedeem,
  fetchRedeemCodes,
  generateRedeemCode,
  type ICandidateStudentUser,
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
  const query = useInfiniteQuery({
    queryKey: redeemCodeKeys.candidateStudents(courseUid, params),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchCandidateStudentsForRedeem({
        ...params,
        page: pageParam,
        course_uid: courseUid || undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined,
    enabled: options?.enabled ?? true,
  })

  const users = useMemo(() => {
    const seen = new Set<string>()
    const list: ICandidateStudentUser[] = []
    for (const page of query.data?.pages ?? []) {
      for (const user of page.users ?? []) {
        if (seen.has(user.uid)) continue
        seen.add(user.uid)
        list.push(user)
      }
    }
    return list
  }, [query.data?.pages])

  const imageReferences = useMemo(() => {
    const urls: string[] = []
    for (const user of users) {
      const avatar = user.avatar_url?.trim()
      if (avatar) urls.push(avatar)
    }
    return urls
  }, [users])

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    const firstPage = query.data.pages[0]
    return {
      users: users.map((user) => ({
        ...user,
        avatar_url: fileMap.getDisplayUrl(user.avatar_url) || user.avatar_url,
      })),
      total: firstPage?.total ?? users.length,
      current_page: firstPage?.current_page ?? 1,
      per_page: firstPage?.per_page ?? 0,
      total_pages: firstPage?.total_pages ?? 0,
    }
  }, [fileMap, query.data, users])

  return {
    ...query,
    data,
  }
}
