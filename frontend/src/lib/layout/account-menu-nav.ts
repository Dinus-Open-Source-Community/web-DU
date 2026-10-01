import type { LucideIcon } from 'lucide-react'
import { Home, LayoutDashboard } from 'lucide-react'

import { DASHBOARD_PATH } from '@/lib/dashboard-route'
import { ROUTES } from '@/lib/routes'

export type AccountMenuNavContext = 'home' | 'dashboard' | 'settings' | 'other'

export type AccountMenuNavLink = {
  to: string
  label: string
  icon: LucideIcon
}

export function getAccountMenuNavContext(pathname: string): AccountMenuNavContext {
  if (pathname === ROUTES.profile || pathname.startsWith(`${ROUTES.profile}/`)) {
    return 'settings'
  }
  if (pathname === ROUTES.home) {
    return 'home'
  }
  if (pathname === DASHBOARD_PATH || pathname.startsWith(`${DASHBOARD_PATH}/`)) {
    return 'dashboard'
  }
  return 'other'
}

/** Item navigasi Beranda/Dasbor di menu profil — tergantung halaman aktif. */
export function getAccountMenuNavLinks(
  context: AccountMenuNavContext,
  dashboardHref: string,
): AccountMenuNavLink[] {
  const beranda: AccountMenuNavLink = {
    to: ROUTES.home,
    label: 'Beranda',
    icon: Home,
  }
  const dasbor: AccountMenuNavLink = {
    to: dashboardHref,
    label: 'Dasbor',
    icon: LayoutDashboard,
  }

  switch (context) {
    case 'home':
      return [dasbor]
    case 'dashboard':
      return [beranda]
    case 'settings':
    case 'other':
      return [beranda, dasbor]
  }
}

export function shouldShowAccountSettingsLink(context: AccountMenuNavContext) {
  return context !== 'settings'
}
