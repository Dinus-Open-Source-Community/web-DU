import type { PaymentStatus } from '@/lib/types/transaction'

export type PaymentInstruction = {
  title: string
  steps: string[]
}

export type PaymentOrderItem = {
  name: string
  price: number
  quantity: number
}

export type PaymentDetail = {
  reference: string
  merchantRef: string
  amount: number
  paymentMethod: string
  paymentName: string
  paymentStatus: PaymentStatus
  tripayStatus: string
  checkoutUrl: string
  paidAt: string | null
  expiredAt: string | null
  payCode: string
  qrUrl: string
  qrString: string
  customerName: string
  enrollmentUid: string | null
  instructions: PaymentInstruction[]
  orderItems: PaymentOrderItem[]
}

export type TransactionPaymentDetailViewModel = {
  payment: PaymentDetail
  courseTitle: string
  courseImageUrl: string | null
  userUid: string | null
  courseUid: string | null
}
