type LocationLike = {
  pathname?: string
  search?: string
  hash?: string
}

/** Blocks open redirects (`//evil.com`, absolute URLs, backslashes). */
export function isSafeInternalPath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://') || path.includes('\\')) {
    return false
  }

  if (typeof window === 'undefined') {
    return true
  }

  try {
    const url = new URL(path, window.location.origin)
    return url.origin === window.location.origin
  } catch {
    return false
  }
}

export function resolveSafeRedirectPath(
  requested: string | LocationLike | null | undefined,
  fallback: string,
) {
  if (typeof requested === 'string' && isSafeInternalPath(requested)) {
    return requested
  }

  if (requested && typeof requested === 'object') {
    if (typeof requested.pathname === 'string' && isSafeInternalPath(requested.pathname)) {
      return `${requested.pathname}${requested.search ?? ''}${requested.hash ?? ''}`
    }
  }

  return fallback
}
