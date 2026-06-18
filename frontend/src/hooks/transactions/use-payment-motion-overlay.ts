import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  const shownPendingRef = useRef(false)
  const shownTerminalRef = useRef(false)
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

    if (status === 'pending' && !shownPendingRef.current) return 'pending'
    if ((status === 'success' || status === 'failed') && !shownTerminalRef.current) return status

    return null
  }, [enabled, showLoader, status, statusTransition])

  const overlayMode = useMemo<PaymentMotionOverlayMode | null>(() => {
    if (!enabled) return null
    if (showLoader) return 'loading'
    if (dismissed || !overlayStatus) return null
    return 'status'
  }, [dismissed, enabled, overlayStatus, showLoader])

  useEffect(() => {
    if (overlayMode !== 'status' || !overlayStatus) return

    if (overlayStatus === 'pending') {
      shownPendingRef.current = true
      return
    }

    shownTerminalRef.current = true
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
