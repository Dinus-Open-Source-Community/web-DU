import type { ProtectedFileBatchItem } from './types'

export function objectUrlFromBlob(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function objectUrlFromBatchItem(item: ProtectedFileBatchItem): string {
  const binary = atob(item.data)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return objectUrlFromBlob(new Blob([bytes], { type: item.content_type }))
}
