import type { AdminStatusTone } from '@/lib/admin/status-label'

type ParticipantEnrollmentPresentation = {
  label: string
  tone: AdminStatusTone
}

const BY_API_STATUS: Record<string, ParticipantEnrollmentPresentation> = {
  active: { label: 'Aktif', tone: 'success' },
  completed: { label: 'Selesai', tone: 'info' },
  complete: { label: 'Selesai', tone: 'info' },
  pending: { label: 'Menunggu', tone: 'warning' },
  cancelled: { label: 'Dibatalkan', tone: 'neutral' },
  canceled: { label: 'Dibatalkan', tone: 'neutral' },
  late: { label: 'Terlambat', tone: 'warning' },
  not_started: { label: 'Belum mulai', tone: 'neutral' },
  registered: { label: 'Terdaftar', tone: 'neutral' },
}

const BY_INDONESIAN_LABEL: Record<string, ParticipantEnrollmentPresentation> = {
  aktif: { label: 'Aktif', tone: 'success' },
  selesai: { label: 'Selesai', tone: 'info' },
  terlambat: { label: 'Terlambat', tone: 'warning' },
  'belum mulai': { label: 'Belum mulai', tone: 'neutral' },
  terdaftar: { label: 'Terdaftar', tone: 'neutral' },
  menunggu: { label: 'Menunggu', tone: 'warning' },
  dibatalkan: { label: 'Dibatalkan', tone: 'neutral' },
}

export function resolveParticipantEnrollmentStatus(
  status?: string,
): ParticipantEnrollmentPresentation {
  const raw = status?.trim()
  if (!raw) {
    return { label: 'Terdaftar', tone: 'neutral' }
  }

  const normalized = raw.toLowerCase()
  return (
    BY_API_STATUS[normalized] ??
    BY_INDONESIAN_LABEL[normalized] ?? {
      label: raw,
      tone: 'neutral',
    }
  )
}

export function formatParticipantEnrollmentStatus(status?: string): string {
  return resolveParticipantEnrollmentStatus(status).label
}
