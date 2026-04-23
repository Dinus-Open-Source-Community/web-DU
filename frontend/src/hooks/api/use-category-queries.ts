'use client'

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type CategoryItem = {
  uid: string
  name: string
  description: string
  is_active: boolean
  courses: unknown[]
  created_at: string
  updated_at: string
}

type CategoryListResponse = {
  course_categories: CategoryItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

type CreateCategoryInput = { name: string; description?: string; is_active?: boolean }
type UpdateCategoryInput = { name?: string; description?: string; is_active?: boolean }

export function useCourseCategories(filters: { page?: number; per_page?: number; name?: string } = {}) {
  return useSuspenseQuery({
    queryKey: queryKeys.courseCategories.list(filters),
    queryFn: () =>
      get<Envelope<CategoryListResponse>>('/course-categories', filters as Record<string, string | number>).then(
        (r) => r.data,
      ),
  })
}

export function useCourseCategoryByUid(uid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.courseCategories.byUid(uid),
    queryFn: () => get<Envelope<CategoryItem>>(`/course-categories/${uid}`).then((r) => r.data),
  })
}

export function useCreateCourseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => post<Envelope<CategoryItem>>('/course-categories', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courseCategories.all })
    },
  })
}

export function useUpdateCourseCategory(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => put<Envelope<CategoryItem>>(`/course-categories/${uid}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courseCategories.all })
    },
  })
}

export function useDeleteCourseCategory(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => del<Envelope<null>>(`/course-categories/${uid}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courseCategories.all })
    },
  })
}
