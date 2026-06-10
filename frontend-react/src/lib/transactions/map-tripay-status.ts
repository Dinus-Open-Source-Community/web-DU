import type { PaymentStatus } from '@/lib/types/transaction'

export function mapTripayStatusToPaymentStatus(tripayStatus: string): PaymentStatus {
  const normalized = tripayStatus.trim().toUpperCase()

  if (normalized === 'PAID') return 'success'
  if (normalized === 'UNPAID') return 'pending'
  if (normalized === 'EXPIRED' || normalized === 'FAILED' || normalized === 'REFUND') {
    return 'failed'
  }

  return 'pending'
}
