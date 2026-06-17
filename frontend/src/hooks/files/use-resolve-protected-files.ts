import { useCallback, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { groupProtectedFileReferences } from '@/lib/files/collect-image-references'
import {
  isResolvableProtectedFileReference,
  parseProtectedFileReference,
} from '@/lib/files/parse-protected-file-reference'
import {
  fetchProtectedFileObjectUrl,
  fetchProtectedFilesObjectUrlMap,
} from '@/services/file-proxy'

import { protectedFileKeys } from './file-keys'
import { useProtectedFilesEnabled } from './use-protected-files-enabled'

type UseResolveProtectedFilesOptions = {
  enabled?: boolean
  singleReferences?: readonly (string | null | undefined)[]
}

const FILE_STALE_TIME = 5 * 60_000
const FILE_GC_TIME = 30 * 60_000

function normalizeReferences(references: readonly (string | null | undefined)[]) {
  return references
    .map((reference) => reference?.trim() ?? '')
    .filter(Boolean)
    .sort()
    .join('\u0000')
}

/**
 * Resolver terpadu: `singleReferences` → GET, sisanya → POST batch per bucket.
 */
export function useResolveProtectedFiles(
  references: readonly (string | null | undefined)[],
  options: UseResolveProtectedFilesOptions = {},
) {
  const authEnabled = useProtectedFilesEnabled()
  const { enabled = true, singleReferences = [] } = options

  const referencesKey = useMemo(() => normalizeReferences(references), [references])
  const singleReferencesKey = useMemo(
    () => normalizeReferences(singleReferences),
    [singleReferences],
  )

  const singleRefs = useMemo(
    () => singleReferencesKey.split('\u0000').filter(Boolean),
    [singleReferencesKey],
  )

  const batchRefs = useMemo(() => {
    const singleSet = new Set(singleRefs)
    return referencesKey
      .split('\u0000')
      .filter((reference) => reference && !singleSet.has(reference))
  }, [referencesKey, singleRefs])

  const canFetch = enabled && authEnabled

  const singleQueries = useQueries({
    queries: singleRefs.map((reference) => {
      const parsed = parseProtectedFileReference(reference)
      return {
        queryKey: parsed
          ? protectedFileKeys.single(parsed.bucket, parsed.objectKey)
          : protectedFileKeys.all,
        queryFn: () => fetchProtectedFileObjectUrl(reference),
        enabled: canFetch && Boolean(parsed),
        staleTime: FILE_STALE_TIME,
        gcTime: FILE_GC_TIME,
      }
    }),
  })

  const bucketGroups = useMemo(
    () => groupProtectedFileReferences(batchRefs),
    [batchRefs],
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
      enabled: canFetch && group.items.length > 0,
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

    singleRefs.forEach((reference, index) => {
      const dataUrl = singleQueries[index]?.data
      if (dataUrl) map.set(reference, dataUrl)
    })

    bucketGroups.forEach((group, index) => {
      const data = batchQueries[index]?.data
      if (!data) return

      for (const item of group.items) {
        const displayUrl = data[item.objectKey]
        if (displayUrl) map.set(item.source, displayUrl)
      }
    })

    return map
  }, [batchQueries, bucketGroups, referencesKey, singleQueries, singleRefs])

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
    isLoading:
      singleQueries.some((query) => query.isLoading) ||
      batchQueries.some((query) => query.isLoading),
    isFetching:
      singleQueries.some((query) => query.isFetching) ||
      batchQueries.some((query) => query.isFetching),
    isError:
      singleQueries.some((query) => query.isError) ||
      batchQueries.some((query) => query.isError),
  }
}
