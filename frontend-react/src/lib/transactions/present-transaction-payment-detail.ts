import type { IUserData } from '@/lib/types/user'

import { buildCourseImageMap } from './build-course-image-map'
import { findTransactionByEnrollmentUid } from './find-transaction-by-enrollment'
import { findTransactionByReference } from './find-transaction-by-reference'
import type { PaymentDetail, TransactionPaymentDetailViewModel } from './payment-types'
import { toTripayMerchantRef } from './to-tripay-merchant-ref'

function resolveProfileTransaction(
  payment: PaymentDetail,
  profile: IUserData | null | undefined,
) {
  const transactions = profile?.transaction_history ?? []

  if (payment.reference) {
    const byReference = findTransactionByReference(transactions, payment.reference)
    if (byReference) return byReference
  }

  if (payment.merchantRef) {
    const byMerchantRef = transactions.find(
      (transaction) => toTripayMerchantRef(transaction.enrollment_uid) === payment.merchantRef,
    )
    if (byMerchantRef) return byMerchantRef
  }

  if (payment.enrollmentUid) {
    return findTransactionByEnrollmentUid(transactions, payment.enrollmentUid)
  }

  return null
}

export function presentTransactionPaymentDetail(
  payment: PaymentDetail,
  profile: IUserData | null | undefined,
): TransactionPaymentDetailViewModel {
  const profileTransaction = resolveProfileTransaction(payment, profile)
  const courseImages = buildCourseImageMap(profile)
  const courseUid = profileTransaction?.course?.uid ?? null

  return {
    payment: {
      ...payment,
      enrollmentUid: profileTransaction?.enrollment_uid ?? payment.enrollmentUid,
    },
    courseTitle: profileTransaction?.course?.title ?? 'Kursus',
    courseImageUrl: courseUid ? courseImages.get(courseUid) ?? null : null,
    userUid: profile?.uid ?? null,
    courseUid,
  }
}
