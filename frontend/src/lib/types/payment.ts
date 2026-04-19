import type { TransactionHistoryItem } from './transaction'

/** Alur langkah pembayaran (UI stepper). */
export interface PaymentStepConfig {
  label: string
  subtitle: string
}

/** Instruksi pembayaran per metode. */
export type PaymentMethodKey = TransactionHistoryItem['paymentMethod']

export interface PaymentInstructionSet {
  iconKey: 'qr-code' | 'wallet' | 'landmark' | 'credit-card'
  title: string
  steps: string[]
}
