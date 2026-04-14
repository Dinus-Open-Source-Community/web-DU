import type { MentorSessionAttendanceStatus } from '@/lib/types'

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function formatIsoDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  try {
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export function sessionLabel(s: MentorSessionAttendanceStatus): string {
  switch (s) {
    case 'belum':
      return 'Belum'
    case 'hadir':
      return 'Hadir'
    case 'izin':
      return 'Izin'
    case 'alpha':
      return 'Alpha'
    default:
      return s
  }
}

export type AttendanceSessionRow = {
  effective: MentorSessionAttendanceStatus
  pendingKind: 'hadir' | 'izin' | null
}

export function hasLeaveForSession(row: AttendanceSessionRow | undefined): boolean {
  if (!row) return false
  return row.effective === 'izin' || row.pendingKind === 'izin'
}
