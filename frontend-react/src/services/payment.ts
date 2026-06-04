import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './axios'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'

const useGetAllPayment = () => {
  return useQuery({
    queryKey: ['payment'],
    queryFn: async () => {
      const response = await api.get<IResponse<[]>>(API_ROUTES.payment.getAll())
      return response.data
    },
  })
}

const useCreatePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post(API_ROUTES.payment.create, paymentData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment'] })
    },
  })
}

export { useGetAllPayment, useCreatePayment }
