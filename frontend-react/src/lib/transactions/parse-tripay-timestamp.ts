export function parseTripayTimestamp(value: unknown): string | null {
  if (value == null) return null

  if (typeof value === 'number' && value > 0) {
    return new Date(value * 1000).toISOString()
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString()
  }

  return null
}
