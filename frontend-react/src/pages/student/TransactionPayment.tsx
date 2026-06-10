import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  TransactionPaymentDetailView,
  TransactionPaymentNotFound,
  TransactionPaymentLoading,
} from '@/components/student/transactions/TransactionPaymentDetailView'
import { AppNavbarProvider } from '@/components/shared/Sidebar'
import { usePaymentDetail } from '@/hooks/use-payment-detail'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { buildPaymentDetailQuery } from '@/lib/transactions/build-payment-detail-query'
import { presentTransactionPaymentDetail } from '@/lib/transactions/present-transaction-payment-detail'
import { useAuth } from '@/providers/auth-provider'

export default function StudentTransactionPaymentPage() {
  const [searchParams] = useSearchParams()
  const sidebarUser = useSidebarUser('student')
  const { profile } = useAuth()

  const paymentQuery$ = useMemo(
    () => buildPaymentDetailQuery(searchParams.get('reference'), searchParams.get('merchant_ref')),
    [searchParams],
  )

  const { data, isLoading, isError } = usePaymentDetail(paymentQuery$)

  const detail = useMemo(() => {
    if (!data) return null
    return presentTransactionPaymentDetail(data, profile)
  }, [data, profile])

  const content = !paymentQuery$
    ? <TransactionPaymentNotFound />
    : isLoading
      ? <TransactionPaymentLoading />
      : isError
        ? <TransactionPaymentNotFound />
        : detail
          ? <TransactionPaymentDetailView detail={detail} />
          : null

  return (
    <AppNavbarProvider role="student" user={sidebarUser} contentClassName="mx-auto w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {content}
    </AppNavbarProvider>
  )
}
