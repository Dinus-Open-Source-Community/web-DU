const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS
const MONTH_MS = 30 * DAY_MS

function formatClockRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/** Sisa waktu deadline untuk UI countdown — selaras preferensi: >24 jam pakai hari/minggu/bulan. */
export function formatAssignmentDeadlineRemaining(ms: number): string {
  if (ms <= 0) return '00:00:00'

  if (ms >= MONTH_MS) {
    const months = Math.floor(ms / MONTH_MS)
    const weeks = Math.floor((ms % MONTH_MS) / WEEK_MS)
    if (weeks > 0) return `${months} bulan ${weeks} minggu`
    return months === 1 ? '1 bulan' : `${months} bulan`
  }

  if (ms >= WEEK_MS) {
    const weeks = Math.floor(ms / WEEK_MS)
    const days = Math.floor((ms % WEEK_MS) / DAY_MS)
    if (days > 0) return `${weeks} minggu ${days} hari`
    return weeks === 1 ? '1 minggu' : `${weeks} minggu`
  }

  if (ms >= DAY_MS) {
    const days = Math.floor(ms / DAY_MS)
    return days === 1 ? '1 hari' : `${days} hari`
  }

  return formatClockRemaining(ms)
}

/** Label tenggat absolut + relatif untuk teks deskriptif. */
export function formatAssignmentDeadlineLabel(
  deadlineAt: string,
  now = new Date(),
): { relative: string; absolute: string } | null {
  const deadlineMs = new Date(deadlineAt).getTime()
  if (Number.isNaN(deadlineMs)) return null

  const remainingMs = deadlineMs - now.getTime()
  const showClockTime = remainingMs > 0 && remainingMs < DAY_MS

  const absolute = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(showClockTime
      ? { hour: '2-digit', minute: '2-digit' as const }
      : {}),
  }).format(new Date(deadlineMs))

  if (remainingMs <= 0) {
    return { relative: 'Waktu habis', absolute }
  }

  return {
    relative: formatAssignmentDeadlineRemaining(remainingMs),
    absolute,
  }
}
