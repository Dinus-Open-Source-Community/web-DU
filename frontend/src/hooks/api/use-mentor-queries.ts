'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { get, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type MentorListItem = {
  uid: string
  name: string
  email: string
  avatar_url: string
  description: string
  is_verified: boolean
  total_courses: number
  total_students: number
  created_at: string
}

type MentorListResponse = {
  mentors: MentorListItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

type MentorDetail = {
  uid: string
  name: string
  email: string
  avatar_url: string
  role: string
  description: string
  assignments: unknown[]
  review_summary: unknown
  course_reviews: unknown[]
}

export function useMentors(filters: { page?: number; per_page?: number } = {}) {
  return useSuspenseQuery({
    queryKey: queryKeys.mentor.list(filters),
    queryFn: () => get<Envelope<MentorListResponse>>('/mentor/all', filters as Record<string, number>).then((r) => r.data),
  })
}

export function useMentorByUid(uid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.mentor.byUid(uid),
    queryFn: () => get<Envelope<MentorDetail>>(`/mentor/${uid}`).then((r) => r.data),
  })
}
