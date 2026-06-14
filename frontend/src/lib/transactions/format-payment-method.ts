const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Kartu Kredit',
  bank_transfer: 'Transfer Bank',
  ewallet: 'E-Wallet',
  QRIS: 'QRIS',
  qris: 'QRIS',
}

export function formatPaymentMethodLabel(method: string | null | undefined): string {
  if (!method) return '-'

  const normalized = method.trim()
  if (!normalized) return '-'

  return PAYMENT_METHOD_LABELS[normalized] ?? normalized.replace(/_/g, ' ')
}
