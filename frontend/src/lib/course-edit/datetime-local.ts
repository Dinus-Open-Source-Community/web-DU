export function isoToDatetimeLocalValue(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function parseIsoToDate(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined

  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function getTimeStringFromIso(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '23:59'

  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function mergeDateAndTimeToIso(date: Date, time: string): string | null {
  const [hours, minutes] = time.split(':').map((part) => Number.parseInt(part, 10))
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  const merged = new Date(date)
  merged.setHours(hours, minutes, 0, 0)
  if (Number.isNaN(merged.getTime())) return null

  return merged.toISOString()
}

export function datetimeLocalToIso(value: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}
