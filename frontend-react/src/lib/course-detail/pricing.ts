export function buildDiscountLabel(price: number, priceStrike?: number): string | undefined {
  if (!priceStrike || priceStrike <= price) return undefined

  const percent = Math.round(((priceStrike - price) / priceStrike) * 100)
  return `Hemat ${percent}%`
}
