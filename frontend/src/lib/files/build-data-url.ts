import type { ProtectedFileBatchItem } from './types'

export function buildDataUrlFromBatchItem(item: ProtectedFileBatchItem) {
  return `data:${item.content_type};base64,${item.data}`
}
