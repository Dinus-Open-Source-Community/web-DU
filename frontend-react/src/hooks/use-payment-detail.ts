import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { paymentKeys } from '@/hooks/query-keys'
import type { PaymentDetailQuery } from '@/lib/transactions/payment-api-types'
import type { PaymentStatus } from '@/lib/types/common/domain'
import { fetchTripayPaymentDetail } from '@/services/payment'

const POLL_INTERVAL_MS = 5_000

function hasPaymentQuery(query: PaymentDetailQuery | null): query is PaymentDetailQuery {
  return Boolean(query?.reference || query?.merchantRef)
}

export function usePaymentDetail(query: PaymentDetailQuery | null) {
  const [statusTransition, setStatusTransition] = useState<'success' | 'failed' | null>(null)
  const prevStatusRef = useRef<PaymentStatus | null>(null)

  const result = useQuery({
    queryKey: paymentKeys.tripayDetail(query?.reference ?? '', query?.merchantRef ?? ''),
    queryFn: () => fetchTripayPaymentDetail(query!),
    enabled: hasPaymentQuery(query),
    staleTime: 10_000,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.paymentStatus
      return status === 'pending' ? POLL_INTERVAL_MS : false
    },
  })

  useEffect(() => {
    const current = result.data?.paymentStatus ?? null
    const prev = prevStatusRef.current

    if (prev === 'pending' && (current === 'success' || current === 'failed')) {
      setStatusTransition(current)
    }

    prevStatusRef.current = current
  }, [result.data?.paymentStatus])

  const clearTransition = useCallback(() => setStatusTransition(null), [])

  return {
    ...result,
    statusTransition,
    clearTransition,
  }
}
