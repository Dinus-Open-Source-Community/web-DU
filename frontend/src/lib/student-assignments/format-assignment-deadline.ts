import type { DeadlineUrgency } from '@/lib/types/utils'

function parseDeadlineTimestamp(deadlineAt: string): number | null {
  if (!deadlineAt.trim()) return null

  const timestamp = new Date(deadlineAt).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

export function formatAssignmentDeadlineRelative(
  deadlineAt: string,
  now: Date,
  urgency: DeadlineUrgency,
): string {
  const deadline = parseDeadlineTimestamp(deadlineAt)
  if (deadline == null) return 'Belum diatur'

  const current = now.getTime()
  const diff = deadline - current
  if (urgency === 'closed') return 'Ditutup'

  if (diff > 0) {
    const hours = diff / 3_600_000
    if (hours < 1) return `${Math.max(1, Math.ceil(diff / 60_000))} menit lagi`
    if (hours < 48) return `${Math.floor(hours)} jam lagi`

    const days = Math.floor(diff / 86_400_000)
    const remainingHours = Math.floor((diff % 86_400_000) / 3_600_000)
    return remainingHours > 0 ? `${days} hari ${remainingHours} jam lagi` : `${days} hari lagi`
  }

  const late = current - deadline
  const lateHours = late / 3_600_000
  if (lateHours < 1) return `Terlambat ${Math.max(1, Math.floor(late / 60_000))} menit`
  if (lateHours < 48) return `Terlambat ${Math.floor(lateHours)} jam`

  const days = Math.floor(late / 86_400_000)
  const remainingHours = Math.floor((late % 86_400_000) / 3_600_000)
  return remainingHours > 0 ? `Terlambat ${days} hari ${remainingHours} jam` : `Terlambat ${days} hari`
}
