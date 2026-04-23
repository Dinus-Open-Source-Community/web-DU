'use client'

import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { get, post, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type PaymentRecord = Record<string, unknown>

type CreatePaymentInput = {
  method: string
  amount: number
  order_items: { name: string; price: number; quantity: number }[]
  enrollment_uid?: string
  callback_url?: string
  return_url?: string
}

type CreatePaymentResponse = Record<string, unknown>

export function usePaymentByReference(reference: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.payment.byRef(reference),
    queryFn: () => get<Envelope<PaymentRecord>>('/payment', { reference }).then((r) => r.data),
    enabled: reference.length > 0,
  })
}

export function usePaymentByEnrollment(enrollmentId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.payment.byEnrollment(enrollmentId),
    queryFn: () => get<Envelope<PaymentRecord>>('/payment', { enrollmentId }).then((r) => r.data),
    enabled: enrollmentId.length > 0,
  })
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: (input: CreatePaymentInput) =>
      post<Envelope<CreatePaymentResponse>>('/payment/create', input),
  })
}
