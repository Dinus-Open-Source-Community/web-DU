import type { TripayPaymentApiEnvelope, TripayPaymentDetailData } from './payment-api-types'

export function unwrapTripayPaymentResponse(
  response: TripayPaymentApiEnvelope,
  fallbackMessage: string,
): TripayPaymentDetailData {
  if (response.success === false) {
    throw new Error(response.message || response.error || fallbackMessage)
  }

  if (!response.data) {
    throw new Error(response.message || fallbackMessage)
  }

  return response.data
}
