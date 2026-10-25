import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'

export type MentorApiItem = {
  uid: string
  name: string
  email: string
  role: string
  social_links?: { id: string; platform: import('@/lib/profile/social-links').SocialPlatform; url: string }[]
  avatar_url: string
  is_verified: boolean
  created_at: string
  assigned_courses: number
  joined_teach_courses: number
}

type MentorListData = {
  mentors: MentorApiItem[]
  meta: {
    total: number
    per_page: number
    current_page: number
    total_pages: number
  }
}

export type MentorAssignment = {
  course_uid: string
  course_title: string
  course_slug: string
  course_status: string
  cover_url: string
  thumbnail_url: string
  status: string
  assigned_at: string
  joined_at: string | null
}

export type MentorDetail = MentorApiItem & {
  assignments: MentorAssignment[]
  social_links?: MentorApiItem['social_links']
}

export async function fetchPublicMentors() {
  const response = await api.get<IResponse<MentorListData>>(
    API_ROUTES.mentor.getAll({ page: 1, per_page: 100 }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil daftar mentor')
}

export async function fetchPublicMentor(uid: string) {
  const response = await api.get<IResponse<MentorDetail>>(API_ROUTES.mentor.getByUid(uid))
  return unwrapApiResponse(response.data, 'Gagal mengambil detail mentor')
}
