import { objectUrlFromBatchItem, objectUrlFromBlob } from '@/lib/files/object-url-from-batch'
import { resolveBlobContentType } from '@/lib/files/infer-mime-type'
import { parseProtectedFileReference } from '@/lib/files/parse-protected-file-reference'
import { parseProtectedFileBatchRequest } from '@/lib/validator/file-proxy'
import type { ProtectedFileBatchData } from '@/lib/files/types'
import type { IResponse } from '@/lib/types/api'

import { API_ROUTES } from './api-path'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import { api } from './axios'

function readResponseContentType(headers: Record<string, string | undefined>): string | undefined {
  const raw = headers['content-type'] ?? headers['Content-Type']
  if (!raw) return undefined
  return raw.split(';')[0]?.trim() || undefined
}

export async function fetchProtectedFileBlob(requestPath: string): Promise<Blob> {
  return withApiErrorHandling(async () => {
    const response = await api.get<Blob>(requestPath, { responseType: 'blob' })
    const blob = response.data
    const pathSegments = requestPath.replace(/^\/files\//, '').split('/')
    const objectKey = pathSegments
      .slice(1)
      .map((segment) => decodeURIComponent(segment))
      .join('/')
    const contentType = resolveBlobContentType(blob, {
      headerType: readResponseContentType(response.headers as Record<string, string | undefined>),
      objectKey,
    })

    if (!blob.type || blob.type === 'application/octet-stream') {
      return new Blob([blob], { type: contentType })
    }

    return blob
  }, 'Gagal memuat file')
}

export async function fetchProtectedFilesBatch(
  bucket: string,
  objectKeys: string[],
): Promise<ProtectedFileBatchData> {
  const trimmedKeys = objectKeys.map((key) => key.trim()).filter(Boolean)
  if (trimmedKeys.length === 0) {
    return { files: [] }
  }

  const { objects: uniqueObjects } = parseProtectedFileBatchRequest(trimmedKeys)

  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<ProtectedFileBatchData>>(
      API_ROUTES.files.batchByBucket(bucket),
      { objects: uniqueObjects },
    )
    return unwrapApiResponse(response.data, 'Gagal memuat file batch')
  }, 'Gagal memuat file batch')
}

export async function fetchProtectedFileObjectUrl(fileReference: string): Promise<string> {
  const parsed = parseProtectedFileReference(fileReference)
  if (!parsed) return fileReference

  const blob = await fetchProtectedFileBlob(parsed.requestPath)
  const contentType = resolveBlobContentType(blob, {
    objectKey: parsed.objectKey,
  })

  if (!blob.type || blob.type === 'application/octet-stream') {
    return objectUrlFromBlob(new Blob([blob], { type: contentType }))
  }

  return objectUrlFromBlob(blob)
}

export async function fetchProtectedFilesObjectUrlMap(
  bucket: string,
  objectKeys: string[],
): Promise<Record<string, string>> {
  const batchData = await fetchProtectedFilesBatch(bucket, objectKeys)
  const map: Record<string, string> = {}

  for (const item of batchData.files) {
    map[item.object] = objectUrlFromBatchItem(item)
  }

  return map
}
