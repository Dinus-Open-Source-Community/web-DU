import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  TransactionPaymentDetailView,
} from '@/components/student/transactions/TransactionPaymentDetailView'
import {
  PaymentMotionOverlay,
  PaymentMotionPageLoader,
} from '@/components/student/transactions/payment-detail/PaymentMotionOverlay'
import { TransactionPaymentNotFound } from '@/components/student/transactions/payment-detail/TransactionPaymentNotFound'
import { TransactionPaymentForbidden } from '@/components/student/transactions/payment-detail/TransactionPaymentForbidden'
import { AppNavbarProvider } from '@/components/shared/Sidebar'
import { appPageContentCenteredClassName } from '@/lib/layout/page-layout'
import { usePaymentDetail } from '@/hooks/use-payment-detail'
import { usePaymentMotionOverlay } from '@/hooks/transactions/use-payment-motion-overlay'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { buildPaymentDetailQuery } from '@/lib/transactions/build-payment-detail-query'
import { presentTransactionPaymentDetail } from '@/lib/transactions/present-transaction-payment-detail'
import { useAuth } from '@/providers/auth-provider'

export default function StudentTransactionPaymentPage() {
  const sidebarUser = useSidebarUser('student')

  return (
    <AppNavbarProvider
      role="student"
      user={sidebarUser}
      contentClassName={`${appPageContentCenteredClassName} max-w-7xl`}
    >
      <Suspense fallback={<PaymentMotionPageLoader />}>
        <TransactionPaymentContent />
      </Suspense>
    </AppNavbarProvider>
  )
}

function TransactionPaymentContent() {
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()

  const paymentQuery$ = useMemo(
    () => buildPaymentDetailQuery(searchParams.get('reference'), searchParams.get('merchant_ref')),
    [searchParams],
  )

  const { data, isLoading, isError, isForbidden, statusTransition, clearTransition } =
    usePaymentDetail(paymentQuery$)

  const detail = useMemo(() => {
    if (!data) return null
    return presentTransactionPaymentDetail(data, profile)
  }, [data, profile])

  const status = detail?.payment.paymentStatus ?? null

  const { overlayMode, overlayStatus, dismissOverlay } = usePaymentMotionOverlay({
    enabled: Boolean(paymentQuery$),
    status,
    isLoading,
    statusTransition,
  })

  const handleDismissOverlay = () => {
    dismissOverlay()
    clearTransition()
  }

  return (
    <>
      {overlayMode ? (
        <PaymentMotionOverlay
          mode={overlayMode}
          status={overlayStatus ?? 'pending'}
          onDismiss={handleDismissOverlay}
        />
      ) : null}

      {!paymentQuery$ ? (
        <TransactionPaymentNotFound />
      ) : isLoading ? null : isForbidden ? (
        <TransactionPaymentForbidden />
      ) : isError ? (
        <TransactionPaymentNotFound />
      ) : detail ? (
        <TransactionPaymentDetailView detail={detail} />
      ) : null}
    </>
  )
}
