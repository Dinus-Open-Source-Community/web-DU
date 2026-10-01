import type { NavItem } from '@/lib/types/components/navigation'
import { ROUTES } from '@/lib/routes'

export type DashboardBreadcrumb = {
  label: string
  path?: string
}

const COURSES_LIST_PATH = ROUTES.dashboardMenu.courses

export type DashboardBreadcrumbContext = {
  /** Judul kursus untuk segmen `/dashboard/courses/:courseUid` */
  courseDetailLabel?: string
}

const DASHBOARD_ROOT: DashboardBreadcrumb = {
  label: 'Dasbor',
  path: ROUTES.dashboard,
}

const TAIL_SEGMENT_LABELS: Record<string, string> = {
  edit: 'Edit Kurikulum',
  assignments: 'Tugas',
  submissions: 'Pengumpulan',
  payment: 'Pembayaran',
  'course-categories': 'Kategori Kursus',
  'course-types': 'Tipe Kursus',
  'reviews-and-qa': 'Ulasan & Tanya Jawab',
}

const TAIL_SEGMENTS_TO_SKIP = new Set(['courses'])

function extractCourseUidFromPath(pathname: string): string | null {
  const prefix = `${COURSES_LIST_PATH}/`
  if (!pathname.startsWith(prefix)) return null
  const segment = pathname.slice(prefix.length).split('/').filter(Boolean)[0]
  if (!segment || !isLikelyUid(segment)) return null
  return segment
}

function isCoursesNavMatch(matchedPath: string) {
  return matchedPath === COURSES_LIST_PATH
}

function titleCaseSegment(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function isLikelyUid(segment: string) {
  return /^[a-z0-9_-]{8,}$/i.test(segment)
}

function collectNavLinks(items: NavItem[]) {
  const links: { name: string; path: string }[] = []

  for (const item of items) {
    if (item.children?.length) {
      for (const child of item.children) {
        links.push({ name: child.name, path: child.path.split('?', 1)[0] })
      }
      continue
    }
    if (item.path) {
      links.push({ name: item.name, path: item.path.split('?', 1)[0] })
    }
  }

  return links
}

function findBestNavLink(pathname: string, items: NavItem[]) {
  const links = collectNavLinks(items)
  let best: { name: string; path: string } | null = null

  for (const link of links) {
    if (link.path === ROUTES.dashboard) {
      if (pathname === ROUTES.dashboard) return link
      continue
    }

    const isExact = pathname === link.path
    const isNested = pathname.startsWith(`${link.path}/`)
    if (!isExact && !isNested) continue

    if (!best || link.path.length > best.path.length) {
      best = link
    }
  }

  return best
}

function tailBreadcrumbs(
  pathname: string,
  matchedPath: string,
  context?: DashboardBreadcrumbContext,
): DashboardBreadcrumb[] {
  const remainder = pathname.slice(matchedPath.length).split('/').filter(Boolean)
  const crumbs: DashboardBreadcrumb[] = []
  let index = 0

  if (
    remainder.length > 0 &&
    isCoursesNavMatch(matchedPath) &&
    isLikelyUid(remainder[0] ?? '')
  ) {
    const courseUid = remainder[0]!
    const coursePath = `${matchedPath}/${courseUid}`
    const label = context?.courseDetailLabel?.trim() || 'Detail Kursus'
    crumbs.push({ label, path: coursePath })
    index = 1
  }

  for (; index < remainder.length; index += 1) {
    const segment = remainder[index]!
    if (isLikelyUid(segment) || TAIL_SEGMENTS_TO_SKIP.has(segment)) continue
    const label = TAIL_SEGMENT_LABELS[segment] ?? titleCaseSegment(segment)
    crumbs.push({ label })
  }

  return crumbs
}

export function buildDashboardBreadcrumbs(
  pathname: string,
  navItems: NavItem[],
  context?: DashboardBreadcrumbContext,
): DashboardBreadcrumb[] {
  if (pathname === ROUTES.dashboard) {
    return [DASHBOARD_ROOT]
  }

  if (pathname === ROUTES.profile) {
    return [DASHBOARD_ROOT, { label: 'Pengaturan', path: ROUTES.profile }]
  }

  const navMatch = findBestNavLink(pathname, navItems)
  if (navMatch) {
    const section: DashboardBreadcrumb = {
      label: navMatch.name,
      path: navMatch.path,
    }

    if (pathname === navMatch.path) {
      return [DASHBOARD_ROOT, section]
    }

    return [DASHBOARD_ROOT, section, ...tailBreadcrumbs(pathname, navMatch.path, context)]
  }

  const courseUid = extractCourseUidFromPath(pathname)
  if (courseUid) {
    return [
      DASHBOARD_ROOT,
      { label: 'Kursus', path: COURSES_LIST_PATH },
      ...tailBreadcrumbs(pathname, COURSES_LIST_PATH, context),
    ]
  }

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .slice(1)
    .filter((segment) => !isLikelyUid(segment) && !TAIL_SEGMENTS_TO_SKIP.has(segment))
    .map((segment) => ({
      label: TAIL_SEGMENT_LABELS[segment] ?? titleCaseSegment(segment),
    }))

  if (segments.length === 0) {
    return [DASHBOARD_ROOT]
  }

  return [DASHBOARD_ROOT, ...segments]
}
