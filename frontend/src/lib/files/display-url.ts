export function isPassThroughDisplayUrl(reference: string): boolean {
  const trimmed = reference.trim()
  if (!trimmed) return true
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return true
  if (trimmed.startsWith('/') && !trimmed.startsWith('/files/')) return true
  return false
}

export function isObjectDisplayUrl(url: string): boolean {
  return url.startsWith('blob:')
}

export function revokeObjectDisplayUrl(url: string | null | undefined): void {
  if (url && isObjectDisplayUrl(url)) {
    URL.revokeObjectURL(url)
  }
}
