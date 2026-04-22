import type { NavItem } from '@/components/sidebar/types'

import { flattenNavItems } from '@/lib/navigation'

export type SidebarBreadcrumb = {
  label: string
  href?: string
}

function normalizePath(path: string): string {
  if (!path) return '/'
  const [withoutQuery] = path.split('?')
  const [withoutHash] = withoutQuery.split('#')
  const trimmed = withoutHash.replace(/\/+$/, '')
  return trimmed || '/'
}

function toLabel(segment: string): string {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getPathLabelMap(navigation: NavItem[]): Map<string, string> {
  const links = flattenNavItems(navigation)
  return new Map(links.map((link) => [normalizePath(link.path), link.name]))
}

export function shouldHideSidebarForPath(pathname: string, navigation: NavItem[], roleRoot: string): boolean {
  const normalizedPath = normalizePath(pathname)
  const rootPath = `/${roleRoot}`

  if (!normalizedPath.startsWith(rootPath)) return false

  const pathLabelMap = getPathLabelMap(navigation)
  return !pathLabelMap.has(normalizedPath)
}

export function buildSidebarBreadcrumbs(pathname: string, navigation: NavItem[], roleRoot: string): SidebarBreadcrumb[] {
  const normalizedPath = normalizePath(pathname)
  const pathLabelMap = getPathLabelMap(navigation)

  const segments = normalizedPath.split('/').filter(Boolean)
  if (segments.length <= 1) return []

  const crumbs: SidebarBreadcrumb[] = []
  let accumulator = `/${segments[0]}`

  for (let index = 1; index < segments.length; index += 1) {
    accumulator = `${accumulator}/${segments[index]}`
    const label = pathLabelMap.get(accumulator) ?? toLabel(segments[index])
    const isLast = index === segments.length - 1
    crumbs.push({
      label,
      href: isLast ? undefined : accumulator,
    })
  }

  return crumbs
}
