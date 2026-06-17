/** Parsed reference ke object terproteksi via proxy backend. */
export type ParsedProtectedFile = {
  source: string
  bucket: string
  objectKey: string
  requestPath: string
}

export type ProtectedFileBatchItem = {
  object: string
  content_type: string
  data: string
  filename?: string
}

export type ProtectedFileBatchData = {
  files: ProtectedFileBatchItem[]
}
