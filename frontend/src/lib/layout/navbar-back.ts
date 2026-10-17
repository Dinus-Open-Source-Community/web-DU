import type { NavigateFunction } from 'react-router-dom'

import { ROUTES } from '@/lib/routes'

/** Kembali ke halaman sebelumnya di SPA; fallback dashboard jika tidak ada riwayat. */
export function navigateBackOrDashboard(navigate: NavigateFunction) {
  const idx = (window.history.state as { idx?: number } | null)?.idx
  if (typeof idx === 'number' && idx > 0) {
    navigate(-1)
    return
  }
  navigate(ROUTES.dashboard)
}
