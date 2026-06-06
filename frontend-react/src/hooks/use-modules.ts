import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { IQueryParamsPayload } from '@/services/api-path'
import {
  createModule,
  fetchModulesByCourseUid,
  updateModule,
  type ModuleUpdateRequest,
} from '@/services/module'
import { moduleKeys } from './query-keys'

export function useModulesByCourse(courseUid: string, params?: IQueryParamsPayload) {
  return useQuery({
    queryKey: moduleKeys.byCourse(courseUid, params),
    enabled: !!courseUid,
    queryFn: () => fetchModulesByCourseUid(courseUid, params),
  })
}

export function useCreateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createModule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: moduleKeys.all })
      toast.success('Modul berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat modul')
    },
  })
}

export function useUpdateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: ModuleUpdateRequest }) =>
      updateModule(uid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: moduleKeys.all })
      toast.success('Modul berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui modul')
    },
  })
}
