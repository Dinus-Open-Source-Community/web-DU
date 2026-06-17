import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { isPassThroughDisplayUrl } from '@/lib/files/display-url'
import { parseProtectedFileReference } from '@/lib/files/parse-protected-file-reference'
import { fetchProtectedFileObjectUrl } from '@/services/file-proxy'

import { protectedFileKeys } from './file-keys'
import { useProtectedFilesEnabled } from './use-protected-files-enabled'

type UseProtectedFileOptions = {
  enabled?: boolean
}

const FILE_STALE_TIME = 5 * 60_000
const FILE_GC_TIME = 30 * 60_000

/** Satu gambar — `GET /files/{bucket}/{object}`. */
export function useProtectedFile(
  fileReference: string | null | undefined,
  options: UseProtectedFileOptions = {},
) {
  const { enabled = true } = options
  const authEnabled = useProtectedFilesEnabled()
  const trimmedReference = fileReference?.trim() ?? ''
  const isPassThrough = isPassThroughDisplayUrl(trimmedReference)
  const parsed = useMemo(
    () =>
      trimmedReference && !isPassThrough
        ? parseProtectedFileReference(trimmedReference)
        : null,
    [isPassThrough, trimmedReference],
  )

  const query = useQuery({
    queryKey: parsed
      ? protectedFileKeys.single(parsed.bucket, parsed.objectKey)
      : protectedFileKeys.all,
    queryFn: () => fetchProtectedFileObjectUrl(trimmedReference),
    enabled: enabled && authEnabled && Boolean(parsed) && !isPassThrough,
    staleTime: FILE_STALE_TIME,
    gcTime: FILE_GC_TIME,
  })

  const displayUrl = useMemo(() => {
    if (!trimmedReference) return null
    if (isPassThrough || !parsed) return trimmedReference
    return query.data ?? null
  }, [isPassThrough, parsed, query.data, trimmedReference])

  return {
    displayUrl,
    isLoading: Boolean(parsed) && query.isLoading,
    isFetching: Boolean(parsed) && query.isFetching,
    isError: Boolean(parsed) && query.isError,
    error: query.error,
  }
}
