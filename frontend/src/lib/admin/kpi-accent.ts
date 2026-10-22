import type { AdminKpiIconName } from '@/lib/types/admin/dashboard'

/** Aksen kiri KPI — warna sticky-note / brand DOSCOM, selaras design tokens. */
export const adminKpiAccentClassName: Record<string, string> = {
  users: 'border-l-note-mint',
  ticket: 'border-l-note-yellow',
  courses: 'border-l-note-sky',
  completion: 'border-l-note-lavender',
  mint: 'border-l-note-mint',
  yellow: 'border-l-note-yellow',
  sky: 'border-l-note-sky',
  lavender: 'border-l-note-lavender',
  peach: 'border-l-note-peach',
  pink: 'border-l-note-pink',
}

export function getAdminKpiAccent(iconName?: AdminKpiIconName, id?: string): string {
  if (id === 'active-users') return 'border-l-note-mint'
  if (id === 'total-students') return 'border-l-note-sky'
  if (id === 'active-courses') return 'border-l-note-yellow'
  if (id === 'course-completion') return 'border-l-note-lavender'
  if (iconName && adminKpiAccentClassName[iconName]) {
    return adminKpiAccentClassName[iconName]
  }
  return 'border-l-note-mint'
}
