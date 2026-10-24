import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

export interface IRedeemCourseData {
  uid: string
  title: string
  slug: string
  description: string
  cover_url: string
  level: string
}

export interface IRedeemResult {
  enrollment_uid: string
  redeemed_at: string
  course: IRedeemCourseData
}

export interface IRedeemCodePayload {
  code: string
}

export async function redeemCourseCode(payload: IRedeemCodePayload): Promise<IRedeemResult> {
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<IRedeemResult>>(
      API_ROUTES.students.redeem,
      payload,
    )
    return unwrapApiResponse(response.data, 'Gagal menukarkan kode redeem')
  }, 'Gagal menukarkan kode redeem')
}
