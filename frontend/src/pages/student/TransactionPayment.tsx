import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  TransactionPaymentDetailView,
} from '@/components/student/transactions/TransactionPaymentDetailView'
import { LottieStatusOverlay } from '@/components/student/transactions/payment-detail/LottieStatusOverlay'
import { TransactionPaymentNotFound } from '@/components/student/transactions/payment-detail/TransactionPaymentNotFound'
import { TransactionPaymentForbidden } from '@/components/student/transactions/payment-detail/TransactionPaymentForbidden'
import { PaymentDetailSkeleton } from '@/components/student/transactions/PaymentDetailSkeleton'
import { AppNavbarProvider } from '@/components/shared/Sidebar'
import { appPageContentCenteredClassName } from '@/lib/layout/page-layout'
import { usePaymentDetail } from '@/hooks/use-payment-detail'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { buildPaymentDetailQuery } from '@/lib/transactions/build-payment-detail-query'
import { presentTransactionPaymentDetail } from '@/lib/transactions/present-transaction-payment-detail'
import { useAuth } from '@/providers/auth-provider'

type OverlayPhase = 'loading' | 'status' | 'none'

export default function StudentTransactionPaymentPage() {
  const [searchParams] = useSearchParams()
  const sidebarUser = useSidebarUser('student')
  const { profile } = useAuth()

  const paymentQuery$ = useMemo(
    () => buildPaymentDetailQuery(searchParams.get('reference'), searchParams.get('merchant_ref')),
    [searchParams],
  )

  const { data, isLoading, isError, isForbidden, statusTransition, clearTransition } = usePaymentDetail(paymentQuery$)

  const detail = useMemo(() => {
    if (!data) return null
    return presentTransactionPaymentDetail(data, profile)
  }, [data, profile])

  const status = detail?.payment.paymentStatus ?? null
  const isTerminal = status === 'success' || status === 'failed'

  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('loading')
  const hasShownStatusRef = useRef(false)
  const lottieTargetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading) return

    if (isTerminal && !hasShownStatusRef.current) {
      hasShownStatusRef.current = true
      setOverlayPhase('status')
      return
    }

    setOverlayPhase('none')
  }, [isLoading, isTerminal])

  useEffect(() => {
    if (statusTransition && overlayPhase === 'none') {
      hasShownStatusRef.current = true
      setOverlayPhase('status')
    }
  }, [statusTransition, overlayPhase])

  const dismissOverlay = useCallback(() => {
    setOverlayPhase('none')
    clearTransition()
  }, [clearTransition])

  const showStatusOverlay = overlayPhase === 'status' && isTerminal

  return (
    <AppNavbarProvider role="student" user={sidebarUser} contentClassName={`${appPageContentCenteredClassName} max-w-7xl`}>
      <Suspense fallback={<PaymentDetailSkeleton />}>
        {showStatusOverlay && (
          <LottieStatusOverlay
            status={status as 'success' | 'failed'}
            targetRef={lottieTargetRef}
            onComplete={dismissOverlay}
          />
        )}

        {!paymentQuery$ ? (
          <TransactionPaymentNotFound />
        ) : isLoading ? (
          <PaymentDetailSkeleton />
        ) : isForbidden ? (
          <TransactionPaymentForbidden />
        ) : isError ? (
          <TransactionPaymentNotFound />
        ) : detail ? (
          <TransactionPaymentDetailView
            detail={detail}
            lottieTargetRef={lottieTargetRef}
          />
        ) : null}
      </Suspense>
    </AppNavbarProvider>
  )
}
