import type { QueryClient } from '@tanstack/react-query'

import { revokeObjectDisplayUrl } from './display-url'

type ProtectedFileCacheData = string | Record<string, string> | undefined

function revokeCachedDisplayUrls(data: ProtectedFileCacheData): void {
  if (typeof data === 'string') {
    revokeObjectDisplayUrl(data)
    return
  }

  if (!data || typeof data !== 'object') return

  for (const value of Object.values(data)) {
    if (typeof value === 'string') {
      revokeObjectDisplayUrl(value)
    }
  }
}

export function registerProtectedFileCacheCleanup(queryClient: QueryClient): void {
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'removed') {
      revokeCachedDisplayUrls(event.query.state.data as ProtectedFileCacheData)
    }
  })
}
