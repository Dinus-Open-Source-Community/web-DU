const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
}

export function inferMimeTypeFromObjectKey(objectKey: string): string | undefined {
  const dotIndex = objectKey.lastIndexOf('.')
  if (dotIndex === -1) return undefined

  const extension = objectKey.slice(dotIndex).toLowerCase()
  return MIME_BY_EXTENSION[extension]
}

export function resolveBlobContentType(
  blob: Blob,
  options: { headerType?: string; objectKey?: string } = {},
): string {
  const fromHeader = options.headerType?.trim()
  if (fromHeader) return fromHeader

  const fromObjectKey = options.objectKey
    ? inferMimeTypeFromObjectKey(options.objectKey)
    : undefined
  if (fromObjectKey) return fromObjectKey

  const fromBlob = blob.type?.trim()
  if (fromBlob && fromBlob !== 'application/octet-stream') return fromBlob

  return 'application/octet-stream'
}
