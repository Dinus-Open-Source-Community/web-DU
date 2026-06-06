import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPayment, fetchPayments } from '@/services/payment'
import { paymentKeys } from './query-keys'

export function usePayments() {
  return useQuery({
    queryKey: paymentKeys.all,
    queryFn: () => fetchPayments(),
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all })
    },
  })
}
