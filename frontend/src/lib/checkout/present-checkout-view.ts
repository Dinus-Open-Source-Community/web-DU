import type { PaymentMethodItem, TripayFee } from '@/lib/types/checkout/payment-method'

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatFeeLabel(fee: TripayFee): string {
  const parts: string[] = []
  if (fee.flat > 0) parts.push(formatCurrency(fee.flat))
  if (fee.percent > 0) parts.push(`${fee.percent}%`)
  return parts.length > 0 ? parts.join(' + ') : 'Gratis'
}

export function isFreeOfCharge(fee: TripayFee): boolean {
  return fee.flat === 0 && fee.percent === 0
}

export type CheckoutCourseViewModel = {
  title: string
  level: string | null
  coverUrl: string | null
  priceLabel: string
  strikePriceLabel: string | null
  hasDiscount: boolean
}

export function presentCheckoutCourse(course: {
  title?: string
  level?: string
  cover_url?: string
  price?: number
  price_strike?: number
}): CheckoutCourseViewModel {
  const price = course.price ?? 0
  const strike = course.price_strike ?? 0
  const hasDiscount = strike > price

  return {
    title: course.title ?? 'Kursus',
    level: course.level ?? null,
    coverUrl: course.cover_url ?? null,
    priceLabel: formatCurrency(price),
    strikePriceLabel: hasDiscount ? formatCurrency(strike) : null,
    hasDiscount,
  }
}

export type PaymentMethodCardViewModel = {
  code: string
  name: string
  iconUrl: string
  feeLabel: string
  isFree: boolean
}

export function presentPaymentMethod(method: PaymentMethodItem): PaymentMethodCardViewModel {
  const fee = method.fee_customer
  return {
    code: method.code,
    name: method.name,
    iconUrl: method.icon_url,
    feeLabel: formatFeeLabel(fee),
    isFree: isFreeOfCharge(fee),
  }
}
