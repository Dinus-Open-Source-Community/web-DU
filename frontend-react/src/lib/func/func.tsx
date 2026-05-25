import slugify from 'slugify'
interface ICriteriaResult {
  label: string
  met: boolean
}

export const EvaluatePassword = (password: string) => {
  const criteria: ICriteriaResult[] = [
    { label: 'Minimal 8 karakter', met: password.length >= 8 },
    { label: 'Huruf besar (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Huruf kecil (a-z)', met: /[a-z]/.test(password) },
    { label: 'Angka (0-9)', met: /\d/.test(password) },
    { label: 'Karakter spesial (!@#$%...)', met: /[^A-Za-z0-9]/.test(password) },
  ]

  const metCount = criteria.filter((c) => c.met).length
  const strengthIndex = Math.max(0, metCount - 1)

  return { criteria, metCount, strengthIndex }
}

/** Format angka, tanggal, dan countdown untuk tampilan ID. */

export const FormatRupiah = (value: number | string, format: 'currency' | 'display' | 'parse' = 'currency'): number | string => {
  if (format === 'display') {
    if (value === 0) return 'Rp 0'
    return 'Rp ' + (value as number).toLocaleString('id-ID')
  }

  if (format === 'parse') {
    const digits = (value as string).replace(/[^\d]/g, '')
    return digits ? parseInt(digits, 10) : 0
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value as number)
}

export const FormatDateTime = (isoDate: string) => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const FormatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export const FormatPaymentDate = (purchasedAt: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(purchasedAt))
}

export const CreateSlug = (text: string) => {
  return slugify(text, { lower: true, strict: true })
}

export const FormatTrend = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) return null
  const abs = Math.abs(value)
  const rounded = abs >= 10 ? abs.toFixed(0) : abs.toFixed(1)
  return `${rounded}%`
}

export const CurrencyCompact = (v: number) => (v >= 1_000_000_000 ? `${(v / 1_000_000_000).toFixed(1)}M` : `${(v / 1_000_000).toFixed(0)}jt`)

export const Initials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function EscapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function ToPreviewHtmlFragment(raw: string): string {
  const t = raw.trim()
  if (t.startsWith('<')) return raw
  return `<p class="text-sm leading-relaxed text-slate-700">${EscapeHtml(raw)}</p>`
}

