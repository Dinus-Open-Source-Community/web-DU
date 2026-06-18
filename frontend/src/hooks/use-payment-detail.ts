import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { authKeys, paymentKeys } from '@/hooks/query-keys'
import { PAYMENT_DETAIL_REALTIME } from '@/lib/transactions/payment-realtime'
import type { PaymentDetailQuery } from '@/lib/transactions/payment-api-types'
import type { PaymentStatus } from '@/lib/types/common/domain'
import { isForbiddenFromError } from '@/services/api-error'
import { fetchTripayPaymentDetail } from '@/services/payment'

function hasPaymentQuery(query: PaymentDetailQuery | null): query is PaymentDetailQuery {
  return Boolean(query?.reference || query?.merchantRef)
}

function isTerminalStatus(status: PaymentStatus | null | undefined): status is 'success' | 'failed' {
  return status === 'success' || status === 'failed'
}

export function usePaymentDetail(query: PaymentDetailQuery | null) {
  const queryClient = useQueryClient()
  const [statusTransition, setStatusTransition] = useState<'success' | 'failed' | null>(null)
  const prevStatusRef = useRef<PaymentStatus | null>(null)

  const result = useQuery({
    queryKey: paymentKeys.tripayDetail(query?.reference ?? '', query?.merchantRef ?? ''),
    queryFn: () => fetchTripayPaymentDetail(query!),
    enabled: hasPaymentQuery(query),
    staleTime: PAYMENT_DETAIL_REALTIME.staleTimeMs,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: PAYMENT_DETAIL_REALTIME.refetchInBackground,
    refetchInterval: (queryState) => {
      const status = queryState.state.data?.paymentStatus
      return status === 'pending' ? PAYMENT_DETAIL_REALTIME.pollIntervalMs : false
    },
  })

  useEffect(() => {
    const current = result.data?.paymentStatus ?? null
    const prev = prevStatusRef.current

    if (prev !== null && current !== null && prev !== current) {
      if (isTerminalStatus(current)) {
        setStatusTransition(current)
      }

      void queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
    }

    prevStatusRef.current = current
  }, [queryClient, result.data?.paymentStatus])

  const clearTransition = useCallback(() => setStatusTransition(null), [])

  const isForbidden = isForbiddenFromError(result.error)

  return {
    ...result,
    isForbidden,
    statusTransition,
    clearTransition,
  }
}
