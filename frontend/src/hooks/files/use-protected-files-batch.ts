import { useQuery } from '@tanstack/react-query'

import { fetchProtectedFilesObjectUrlMap } from '@/services/file-proxy'

import { protectedFileKeys } from './file-keys'
import { useProtectedFilesEnabled } from './use-protected-files-enabled'

type UseProtectedFilesBatchOptions = {
  enabled?: boolean
}

const FILE_STALE_TIME = 5 * 60_000
const FILE_GC_TIME = 30 * 60_000

/** Banyak gambar satu bucket — `POST /files/{bucket}/batch`. */
export function useProtectedFilesBatch(
  bucket: string,
  objectKeys: string[],
  options: UseProtectedFilesBatchOptions = {},
) {
  const { enabled = true } = options
  const authEnabled = useProtectedFilesEnabled()
  const normalizedKeys = [...new Set(objectKeys.map((key) => key.trim()).filter(Boolean))].sort()

  return useQuery({
    queryKey: protectedFileKeys.batch(bucket, normalizedKeys),
    queryFn: () => fetchProtectedFilesObjectUrlMap(bucket, normalizedKeys),
    enabled: enabled && authEnabled && Boolean(bucket) && normalizedKeys.length > 0,
    staleTime: FILE_STALE_TIME,
    gcTime: FILE_GC_TIME,
  })
}
