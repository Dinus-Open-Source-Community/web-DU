import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMinimumDuration } from '@/hooks/use-minimum-duration'
import {
  PAYMENT_MOTION_MIN_LOADER_MS,
  type PaymentMotionOverlayMode,
  type PaymentMotionStatus,
} from '@/lib/transactions/payment-motion'
import type { PaymentStatus } from '@/lib/types/common/domain'

type UsePaymentMotionOverlayOptions = {
  enabled: boolean
  status: PaymentStatus | null
  isLoading: boolean
  statusTransition: 'success' | 'failed' | null
}

export function usePaymentMotionOverlay({
  enabled,
  status,
  isLoading,
  statusTransition,
}: UsePaymentMotionOverlayOptions) {
  const [dismissed, setDismissed] = useState(false)
  const [shownPending, setShownPending] = useState(false)
  const [shownTerminal, setShownTerminal] = useState(false)
  const showLoader = useMinimumDuration(Boolean(enabled && isLoading), PAYMENT_MOTION_MIN_LOADER_MS)

  useEffect(() => {
    if (!statusTransition) return
    setDismissed(false)
  }, [statusTransition])

  const overlayStatus = useMemo<PaymentMotionStatus | null>(() => {
    if (!enabled) return null
    if (showLoader) return null
    if (!status) return null

    if (statusTransition) return statusTransition

    if (status === 'pending' && !shownPending) return 'pending'
    if ((status === 'success' || status === 'failed') && !shownTerminal) return status

    return null
  }, [enabled, showLoader, shownPending, shownTerminal, status, statusTransition])

  const overlayMode = useMemo<PaymentMotionOverlayMode | null>(() => {
    if (!enabled) return null
    if (showLoader) return 'loading'
    if (dismissed || !overlayStatus) return null
    return 'status'
  }, [dismissed, enabled, overlayStatus, showLoader])

  useEffect(() => {
    if (overlayMode !== 'status' || !overlayStatus) return

    if (overlayStatus === 'pending') {
      setShownPending(true)
      return
    }

    setShownTerminal(true)
  }, [overlayMode, overlayStatus])

  const dismissOverlay = useCallback(() => {
    setDismissed(true)
  }, [])

  return {
    overlayMode,
    overlayStatus,
    dismissOverlay,
  }
}
