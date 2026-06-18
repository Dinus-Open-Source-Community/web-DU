import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Message, resolveActionError } from '@/lib/Message'
import {
  applyResolvedImagesToAdminQnaThread,
  applyResolvedImagesToAdminReview,
  collectAdminModerationImageReferences,
} from '@/lib/files'
import { useProtectedFileMap } from '@/hooks/files/use-protected-file-map'
import { adminModerationKeys } from '@/hooks/query-keys'
import type { IQueryParamsPayload } from '@/services/api-path'
import {
  fetchAdminQnaThreads,
  fetchAdminReviews,
  replyAdminQnaThread,
  replyAdminReview,
} from '@/services/admin-moderation'

type AdminModerationListParams = IQueryParamsPayload & {
  courseUid?: string
  status?: string
}

export function useAdminReviews(params?: AdminModerationListParams) {
  const query = useQuery({
    queryKey: adminModerationKeys.reviews(params),
    queryFn: () => fetchAdminReviews(params),
  })

  const imageReferences = useMemo(
    () => collectAdminModerationImageReferences(query.data?.reviews, null),
    [query.data?.reviews],
  )

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return {
      ...query.data,
      reviews: query.data.reviews.map((review) =>
        applyResolvedImagesToAdminReview(review, fileMap.getDisplayUrl),
      ),
    }
  }, [fileMap.getDisplayUrl, query.data])

  return {
    ...query,
    data,
    isResolvingImages: fileMap.isLoading || fileMap.isFetching,
  }
}

export function useAdminQnaThreads(params?: AdminModerationListParams) {
  const query = useQuery({
    queryKey: adminModerationKeys.qna(params),
    queryFn: () => fetchAdminQnaThreads(params),
  })

  const imageReferences = useMemo(
    () => collectAdminModerationImageReferences(null, query.data?.threads),
    [query.data?.threads],
  )

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return {
      ...query.data,
      threads: query.data.threads.map((thread) =>
        applyResolvedImagesToAdminQnaThread(thread, fileMap.getDisplayUrl),
      ),
    }
  }, [fileMap.getDisplayUrl, query.data])

  return {
    ...query,
    data,
    isResolvingImages: fileMap.isLoading || fileMap.isFetching,
  }
}

export function useReplyAdminReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reviewUid,
      comment,
    }: {
      reviewUid: string
      comment: string
    }) => replyAdminReview(reviewUid, { comment }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminModerationKeys.all })
      toast.success(Message.review.replySent)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.review.replyFailed))
    },
  })
}

export function useReplyAdminQnaThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      threadUid,
      body,
    }: {
      threadUid: string
      body: string
    }) => replyAdminQnaThread(threadUid, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminModerationKeys.all })
      toast.success(Message.qa.replySent)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.qa.replyFailed))
    },
  })
}
