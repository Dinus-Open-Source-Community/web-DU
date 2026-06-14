import type { TripayPaymentDetailData } from './payment-api-types'
import { mapTripayStatusToPaymentStatus } from './map-tripay-status'
import { parseTripayTimestamp } from './parse-tripay-timestamp'
import type { PaymentDetail } from './payment-types'

export function mapTripayPaymentDetail(raw: TripayPaymentDetailData): PaymentDetail {
  return {
    reference: raw.reference,
    merchantRef: raw.merchant_ref,
    amount: raw.amount,
    paymentMethod: raw.payment_method,
    paymentName: raw.payment_name,
    paymentStatus: mapTripayStatusToPaymentStatus(raw.status),
    tripayStatus: raw.status,
    checkoutUrl: raw.checkout_url ?? '',
    paidAt: parseTripayTimestamp(raw.paid_at),
    expiredAt: parseTripayTimestamp(raw.expired_time),
    payCode: raw.pay_code ?? '',
    qrUrl: raw.qr_url ?? '',
    qrString: raw.qr_string ?? '',
    customerName: raw.customer_name ?? '',
    enrollmentUid: null,
    instructions: (raw.instructions ?? []).map((instr) => ({
      title: instr.title,
      steps: instr.steps,
    })),
    orderItems: (raw.order_items ?? []).map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  }
}
