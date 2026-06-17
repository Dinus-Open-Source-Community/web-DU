import { useCallback, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { groupProtectedFileReferences } from '@/lib/files/collect-image-references'
import {
  isResolvableProtectedFileReference,
  parseProtectedFileReference,
} from '@/lib/files/parse-protected-file-reference'
import { fetchProtectedFilesObjectUrlMap } from '@/services/file-proxy'

import { protectedFileKeys } from './file-keys'
import { useProtectedFilesEnabled } from './use-protected-files-enabled'

type UseProtectedFileMapOptions = {
  enabled?: boolean
}

const FILE_STALE_TIME = 5 * 60_000
const FILE_GC_TIME = 30 * 60_000

/** Resolve banyak referensi via batch per bucket. */
export function useProtectedFileMap(
  references: readonly (string | null | undefined)[],
  options: UseProtectedFileMapOptions = {},
) {
  const { enabled = true } = options
  const authEnabled = useProtectedFilesEnabled()

  const referencesKey = useMemo(
    () =>
      references
        .map((reference) => reference?.trim() ?? '')
        .filter(Boolean)
        .sort()
        .join('\u0000'),
    [references],
  )

  const bucketGroups = useMemo(
    () => groupProtectedFileReferences(referencesKey.split('\u0000')),
    [referencesKey],
  )

  const batchQueries = useQueries({
    queries: bucketGroups.map((group) => ({
      queryKey: protectedFileKeys.batch(
        group.bucket,
        group.items.map((item) => item.objectKey),
      ),
      queryFn: () =>
        fetchProtectedFilesObjectUrlMap(
          group.bucket,
          group.items.map((item) => item.objectKey),
        ),
      enabled: enabled && authEnabled && group.items.length > 0,
      staleTime: FILE_STALE_TIME,
      gcTime: FILE_GC_TIME,
    })),
  })

  const displayUrlBySource = useMemo(() => {
    const map = new Map<string, string>()

    for (const reference of referencesKey.split('\u0000')) {
      if (!reference) continue
      if (!parseProtectedFileReference(reference)) {
        map.set(reference, reference)
      }
    }

    bucketGroups.forEach((group, index) => {
      const data = batchQueries[index]?.data
      if (!data) return

      for (const item of group.items) {
        const displayUrl = data[item.objectKey]
        if (displayUrl) {
          map.set(item.source, displayUrl)
        }
      }
    })

    return map
  }, [batchQueries, bucketGroups, referencesKey])

  const getDisplayUrl = useCallback(
    (reference?: string | null) => {
      const trimmed = reference?.trim()
      if (!trimmed) return null

      const resolved = displayUrlBySource.get(trimmed)
      if (resolved) return resolved

      if (isResolvableProtectedFileReference(trimmed)) return null
      return trimmed
    },
    [displayUrlBySource],
  )

  return {
    displayUrlBySource,
    getDisplayUrl,
    isLoading: batchQueries.some((query) => query.isLoading),
    isFetching: batchQueries.some((query) => query.isFetching),
    isError: batchQueries.some((query) => query.isError),
  }
}
