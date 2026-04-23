'use client'

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type ModuleItem = Record<string, unknown>

type ModuleListResponse = {
  modules: ModuleItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

type CreateModuleInput = { course_uid: string; title: string; order_index: number }
type UpdateModuleInput = { title?: string; order_index?: number }

export function useModulesByCourse(
  courseUid: string,
  filters: { page?: number; per_page?: number; name?: string } = {},
) {
  return useSuspenseQuery({
    queryKey: queryKeys.modules.byCourse(courseUid, filters),
    queryFn: () =>
      get<Envelope<ModuleListResponse>>(
        `/modules/course/${courseUid}`,
        filters as Record<string, string | number>,
      ).then((r) => r.data),
  })
}

export function useModuleByUid(uid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.modules.byUid(uid),
    queryFn: () => get<Envelope<ModuleItem>>(`/modules/${uid}`).then((r) => r.data),
  })
}

export function useCreateModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateModuleInput) => post<Envelope<ModuleItem>>('/modules', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.modules.all })
    },
  })
}

export function useUpdateModule(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateModuleInput) => put<Envelope<ModuleItem>>(`/modules/${uid}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.modules.all })
    },
  })
}

export function useDeleteModule(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => del<Envelope<null>>(`/modules/${uid}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.modules.all })
    },
  })
}
