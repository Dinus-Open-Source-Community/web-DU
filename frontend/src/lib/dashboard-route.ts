import type { UserRole } from '@/lib/types/user'

export const DASHBOARD_PATH = '/dashboard'

/** Peran untuk memilih komponen dashboard (bukan URL). */
export type DashboardShellRole = 'student' | 'mentor' | 'admin'

export function dashboardPathForUserRole(_userRole?: UserRole): string {
  return DASHBOARD_PATH
}

export function dashboardShellRoleForUser(userRole: UserRole): DashboardShellRole {
  if (userRole === 'admin' || userRole === 'super_admin') return 'admin'
  if (userRole === 'mentor') return 'mentor'
  return 'student'
}

function pathMatchesNavHref(pathname: string, hrefPath: string): boolean {
  if (pathname === hrefPath) return true
  // Root dashboard hanya exact — hindari semua subpath ikut aktif.
  if (hrefPath === DASHBOARD_PATH) return false
  return hrefPath !== '/' && pathname.startsWith(`${hrefPath}/`)
}

/** Aktif untuk link sidebar/nav (termasuk href dengan query, mis. filter halaman). */
export function isNavLinkActive(pathname: string, search: string, href: string): boolean {
  const [hrefPath, hrefQuery = ''] = href.split('?', 2)

  if (!hrefQuery) {
    return pathMatchesNavHref(pathname, hrefPath)
  }

  if (pathname !== hrefPath) return false

  const expected = new URLSearchParams(hrefQuery)
  const current = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)

  for (const key of expected.keys()) {
    if (current.get(key) !== expected.get(key)) return false
  }
  return true
}
