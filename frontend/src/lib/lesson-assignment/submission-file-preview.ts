function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export type SubmissionFilePreviewKind = 'image' | 'pdf' | 'video' | 'other'

export function getSubmissionFilePreviewKind(file: File): SubmissionFilePreviewKind {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.startsWith('video/')) return 'video'
  return 'other'
}

export function formatSubmissionFileMeta(file: File) {
  return {
    name: file.name,
    sizeLabel: formatFileSize(file.size),
    kind: getSubmissionFilePreviewKind(file),
  }
}

export function createSubmissionFilePreviewUrl(file: File | null) {
  if (!file) return null
  const kind = getSubmissionFilePreviewKind(file)
  if (kind === 'image' || kind === 'pdf' || kind === 'video') {
    return URL.createObjectURL(file)
  }
  return null
}

export function revokeSubmissionFilePreviewUrl(url: string | null) {
  if (url) URL.revokeObjectURL(url)
}
