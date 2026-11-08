import { API_ROUTES, type IQueryParamsPayload } from './api-path'
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

export interface ITargetUserSummary {
  uid: string
  name: string
  email: string
  avatar_url?: string
}

export interface IGenerateRedeemCodePayload {
  course_uid: string
  target_user_uid?: string
  target_email?: string
  code?: string
  prefix?: string
  max_uses?: number
  expires_at?: string
  is_active?: boolean
}

export interface IRedeemCodeItem {
  uid: string
  code: string
  course_uid: string
  course_title: string
  target_email?: string
  target_user?: ITargetUserSummary
  max_uses: number
  used_count: number
  is_active: boolean
  expires_at?: string
  created_by_uid: string
  created_at: string
}

export interface IRedeemCodeListResponse {
  items: IRedeemCodeItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface ICandidateStudentUser {
  uid: string
  name: string
  email: string
  avatar_url?: string
  role: string
  is_verified: boolean
  created_at: string
}

export interface ICandidateStudentsResponse {
  users: ICandidateStudentUser[]
  total: number
  current_page: number
  per_page: number
  total_pages: number
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

export async function fetchRedeemCodes(params?: IQueryParamsPayload): Promise<IRedeemCodeListResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<IRedeemCodeListResponse>>(
      API_ROUTES.redeemCodes.getAll(params),
    )
    return unwrapApiResponse(response.data, 'Gagal mengambil daftar kode redeem')
  }, 'Gagal mengambil daftar kode redeem')
}

export async function generateRedeemCode(payload: IGenerateRedeemCodePayload): Promise<IRedeemCodeItem> {
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<IRedeemCodeItem>>(
      API_ROUTES.redeemCodes.generate,
      payload,
    )
    return unwrapApiResponse(response.data, 'Gagal membuat kode redeem')
  }, 'Gagal membuat kode redeem')
}

export async function deleteRedeemCode(uid: string): Promise<void> {
  return withApiErrorHandling(async () => {
    const response = await api.delete<IResponse<null>>(API_ROUTES.redeemCodes.deleteByUid(uid))
    if (response.data.success === false) {
      throw new Error(response.data.message || response.data.error || 'Gagal menghapus kode redeem')
    }
  }, 'Gagal menghapus kode redeem')
}

export async function fetchCandidateStudentsForRedeem(params?: IQueryParamsPayload): Promise<ICandidateStudentsResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<ICandidateStudentsResponse>>(
      API_ROUTES.redeemCodes.candidateStudents(params),
    )
    return unwrapApiResponse(response.data, 'Gagal mengambil daftar calon siswa')
  }, 'Gagal mengambil daftar calon siswa')
}
