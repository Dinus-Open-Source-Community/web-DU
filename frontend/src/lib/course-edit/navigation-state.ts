export type CourseEditNavigationState = {
  from?: string
}

export function serializeLocationPath(pathname: string, search = ''): string {
  return `${pathname}${search}`
}

export function buildCourseEditNavigationState(from: {
  pathname: string
  search?: string
}): CourseEditNavigationState {
  return { from: serializeLocationPath(from.pathname, from.search ?? '') }
}

function isSafeBackPath(path: string, currentPath: string): boolean {
  if (!path.startsWith('/')) return false
  if (path === currentPath) return false
  if (path.endsWith('/edit')) return false
  return true
}

export type CourseEditBackTarget =
  | { type: 'path'; path: string }
  | { type: 'history' }
  | { type: 'fallback'; path: string }

export function resolveCourseEditBackTarget(
  state: CourseEditNavigationState | null | undefined,
  currentPath: string,
  fallbackPath: string,
): CourseEditBackTarget {
  const from = state?.from
  if (typeof from === 'string' && isSafeBackPath(from, currentPath)) {
    return { type: 'path', path: from }
  }

  if (typeof window !== 'undefined' && window.history.length > 1) {
    return { type: 'history' }
  }

  return { type: 'fallback', path: fallbackPath }
}
