import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { AxiosError } from 'axios'
import type { IUpdatePasswordPayload, IUpdateProfilePayload } from '@/lib/types/user'

const useUpdateProfilePhoto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (photo: File) => {
      const formData = new FormData()
      formData.append('avatar', photo)

      return api.post(API_ROUTES.avatar.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      toast.success('Foto profil berhasil diubah')
    },
    onError: (error) => {
      toast.error(error instanceof AxiosError ? error.response?.data?.message : error instanceof Error ? error.message : 'Gagal mengubah foto profil')
    },
  })
}

const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IUpdateProfilePayload) => {
      return api.patch(API_ROUTES.user.updateProfile, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      toast.success('Profil berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(error instanceof AxiosError ? error.response?.data?.message : error instanceof Error ? error.message : 'Gagal memperbarui profil')
    },
  })
}

const useUpdatePassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IUpdatePasswordPayload) => {
      return api.patch(API_ROUTES.user.changePassword, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      toast.success('Password berhasil diubah')
    },
    onError: (error) => {
      toast.error(error instanceof AxiosError ? error.response?.data?.message : error instanceof Error ? error.message : 'Gagal mengubah password')
    },
  })
}

export { useUpdatePassword, useUpdateProfile, useUpdateProfilePhoto }
