/** Query `GET /payment/tripay?reference=&merchant_ref=` — merchant_ref = prefix enrollment UID. */
export type PaymentDetailQuery = {
  /** Tripay reference (`payments.transaction_id`). */
  reference?: string
  /** Tripay merchant_ref: prefix 8-char hex dari `enrollment_uid`. */
  merchantRef?: string
}

/** Payload Tripay di dalam envelope respons. */
export type TripayPaymentDetailData = {
  reference: string
  merchant_ref: string
  payment_method: string
  payment_name: string
  customer_name?: string
  customer_email?: string
  amount: number
  checkout_url?: string
  status: string
  pay_code?: string
  qr_url?: string
  qr_string?: string
  paid_at?: number | string | null
  expired_time?: number | null
  order_items?: Array<{
    name: string
    price: number
    quantity: number
  }>
  instructions?: Array<{
    title: string
    steps: string[]
  }>
}

export type TripayPaymentApiEnvelope = {
  success: boolean
  message?: string
  data?: TripayPaymentDetailData | null
  error?: string | null
}
