import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { API_ROUTES } from './api-path'
import { api } from './axios'
import { AxiosError } from 'axios'

export const useUpdateProfilePhoto = () => {
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
      toast.error(error instanceof AxiosError ? error.response?.data?.message : 'Gagal mengubah foto profil')
    },
  })
}
