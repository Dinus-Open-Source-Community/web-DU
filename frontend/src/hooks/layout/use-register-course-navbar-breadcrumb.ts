import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { ROUTES } from '@/lib/routes'
import { useNavbarSearch } from '@/providers/navbar-search-provider'

function courseUidFromDashboardPath(pathname: string): string | null {
  const prefix = `${ROUTES.dashboardMenu.courses}/`
  if (!pathname.startsWith(prefix)) return null
  const segment = pathname.slice(prefix.length).split('/').filter(Boolean)[0]
  return segment?.length ? segment : null
}

/** Menampilkan judul kursus di breadcrumb navbar (Dasbor › Kursus › …). */
export function useRegisterCourseNavbarBreadcrumb(
  courseUid: string | undefined,
  title: string | undefined,
) {
  const { pathname } = useLocation()
  const { registerCourseBreadcrumb } = useNavbarSearch()

  useEffect(() => {
    const pathCourseUid = courseUidFromDashboardPath(pathname)
    const uid = courseUid?.trim() || pathCourseUid
    const label = title?.trim()

    if (!uid || !label) return

    return registerCourseBreadcrumb({ courseUid: uid, label })
  }, [courseUid, title, pathname, registerCourseBreadcrumb])
}
