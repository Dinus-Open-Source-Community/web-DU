import { useQuery } from '@tanstack/react-query'

import { paymentKeys } from '@/hooks/query-keys'
import type { PaymentDetailQuery } from '@/lib/transactions/payment-api-types'
import { fetchTripayPaymentDetail } from '@/services/payment'

function hasPaymentQuery(query: PaymentDetailQuery | null): query is PaymentDetailQuery {
  return Boolean(query?.reference || query?.merchantRef)
}

export function usePaymentDetail(query: PaymentDetailQuery | null) {
  return useQuery({
    queryKey: paymentKeys.tripayDetail(query?.reference ?? '', query?.merchantRef ?? ''),
    queryFn: () => fetchTripayPaymentDetail(query!),
    enabled: hasPaymentQuery(query),
    staleTime: 60_000,
    retry: false,
  })
}
