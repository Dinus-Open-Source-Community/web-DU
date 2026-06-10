import type { PaymentDetailQuery } from './payment-api-types'

export function buildPaymentDetailQuery(
  reference: string | null | undefined,
  merchantRef: string | null | undefined,
): PaymentDetailQuery | null {
  const normalizedReference = reference?.trim() ?? ''
  const normalizedMerchantRef = merchantRef?.trim() ?? ''

  if (!normalizedReference && !normalizedMerchantRef) {
    return null
  }

  return {
    ...(normalizedReference ? { reference: normalizedReference } : {}),
    ...(normalizedMerchantRef ? { merchantRef: normalizedMerchantRef } : {}),
  }
}
