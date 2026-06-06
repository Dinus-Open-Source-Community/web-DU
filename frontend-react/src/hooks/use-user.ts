import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import type { IUpdatePasswordPayload, IUpdateProfilePayload } from '@/lib/types/user'
import {
  updateUserPassword,
  updateUserProfile,
  uploadProfilePhoto,
} from '@/services/user'
import { authKeys } from './query-keys'

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function useUpdateProfilePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      toast.success('Foto profil berhasil diubah')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Gagal mengubah foto profil'))
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IUpdateProfilePayload) => updateUserProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      toast.success('Profil berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Gagal memperbarui profil'))
    },
  })
}

export function useUpdatePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IUpdatePasswordPayload) => updateUserPassword(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      toast.success('Password berhasil diubah')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Gagal mengubah password'))
    },
  })
}
