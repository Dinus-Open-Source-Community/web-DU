import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import { unwrapApiResponse } from './api-error'
import { api } from './axios'
import type { AdminModerationActionResponse, AdminModerationListData } from '@/lib/admin-moderation/api-types'
import {
  mapAdminQaThreadItem,
  mapAdminReviewItem,
} from '@/lib/admin-moderation/map-admin-moderation'
import {
  parseAdminModerationListParams,
  parseAdminModerationQnaReplyPayload,
  parseAdminModerationReviewReplyPayload,
  parseAdminModerationReviewUidParam,
  parseAdminModerationThreadUidParam,
} from '@/lib/validator/admin-moderation'
import type {
  AdminModerationQnaReplyPayload,
  AdminModerationReviewReplyPayload,
  AdminQnaListResponse,
  AdminReviewsListResponse,
} from '@/lib/admin-moderation/types'
import type { IResponse } from '@/lib/types/api'
import type { IPaginationMeta } from '@/lib/types/common/pagination'

function mapPaginationMeta(raw: Partial<IPaginationMeta> | undefined): IPaginationMeta {
  return {
    current_page: raw?.current_page ?? 1,
    per_page: raw?.per_page ?? 10,
    total: raw?.total ?? 0,
    total_pages: raw?.total_pages ?? 0,
  }
}

export async function fetchAdminReviews(
  params?: IQueryParamsPayload & { courseUid?: string },
): Promise<AdminReviewsListResponse> {
  const validatedParams = parseAdminModerationListParams(params)
  const response = await api.get<IResponse<AdminModerationListData>>(
    API_ROUTES.admin.moderation.reviews(validatedParams),
  )
  const data = unwrapApiResponse(response.data, 'Gagal mengambil review admin')

  const reviews = (data.reviews ?? [])
    .map(mapAdminReviewItem)
    .filter((review): review is NonNullable<typeof review> => review !== null)

  return {
    reviews,
    meta: mapPaginationMeta(data.meta),
  }
}

export async function fetchAdminQnaThreads(
  params?: IQueryParamsPayload & { courseUid?: string; status?: string },
): Promise<AdminQnaListResponse> {
  const validatedParams = parseAdminModerationListParams(params)
  const response = await api.get<IResponse<AdminModerationListData>>(
    API_ROUTES.admin.moderation.qna(validatedParams),
  )
  const data = unwrapApiResponse(response.data, 'Gagal mengambil Q&A admin')

  const threads = (data.threads ?? [])
    .map(mapAdminQaThreadItem)
    .filter((thread): thread is NonNullable<typeof thread> => thread !== null)

  return {
    threads,
    meta: mapPaginationMeta(data.meta),
  }
}

export async function replyAdminReview(
  reviewUid: string,
  payload: AdminModerationReviewReplyPayload,
) {
  const validatedUid = parseAdminModerationReviewUidParam(reviewUid)
  const validatedPayload = parseAdminModerationReviewReplyPayload(payload)
  const response = await api.post<IResponse<AdminModerationActionResponse>>(
    API_ROUTES.admin.moderation.replyReview(validatedUid),
    validatedPayload,
  )
  return unwrapApiResponse(response.data, 'Gagal mengirim balasan review')
}

export async function replyAdminQnaThread(
  threadUid: string,
  payload: AdminModerationQnaReplyPayload,
) {
  const validatedUid = parseAdminModerationThreadUidParam(threadUid)
  const validatedPayload = parseAdminModerationQnaReplyPayload(payload)
  const response = await api.post<IResponse<AdminModerationActionResponse>>(
    API_ROUTES.admin.moderation.replyQna(validatedUid),
    validatedPayload,
  )
  return unwrapApiResponse(response.data, 'Gagal mengirim balasan Q&A')
}
