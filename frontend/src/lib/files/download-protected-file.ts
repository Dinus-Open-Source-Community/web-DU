import { fetchProtectedFileBlob } from '@/services/file-proxy'

import { parseProtectedFileReference } from './parse-protected-file-reference'

function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

export async function downloadProtectedFile(fileReference: string, filename: string) {
  const parsed = parseProtectedFileReference(fileReference)
  const requestPath = parsed?.requestPath ?? fileReference
  const blob = await fetchProtectedFileBlob(requestPath)
  triggerBlobDownload(blob, filename)
}
