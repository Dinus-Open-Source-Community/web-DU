import { API_BASE_URL } from '@/services/axios'

import type { ParsedProtectedFile } from './types'

const encodeObjectPath = (objectPath: string) =>
  objectPath.split('/').map(encodeURIComponent).join('/')

function getApiOrigin() {
  return new URL(API_BASE_URL).origin
}

function isPassThroughReference(reference: string) {
  const trimmed = reference.trim()
  if (!trimmed) return true
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return true
  if (trimmed.startsWith('/pinguin') || trimmed === '/pinguin.png') return true
  return false
}

/**
 * Hanya URL yang berasal dari backend (VITE_BACKEND_URL) yang boleh di-fetch.
 * URL eksternal (pravatar, unsplash, placeholder, dll.) → null (pass-through).
 */
function extractBackendFilesPathname(reference: string, apiOrigin: string): string | null {
  const trimmed = reference.trim()

  if (trimmed.startsWith('/files/')) {
    return trimmed
  }

  if (trimmed.startsWith('files/')) {
    return `/${trimmed}`
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return null
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.origin !== apiOrigin) return null
    if (!parsed.pathname.startsWith('/files/')) return null
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return null
  }
}

function parseFilesPathname(pathname: string): ParsedProtectedFile | null {
  const segments = pathname.replace(/^\/files\//, '').split('/').filter(Boolean)
  if (segments.length < 2) return null

  const bucket = decodeURIComponent(segments[0] ?? '')
  const objectKey = segments
    .slice(1)
    .map((segment) => decodeURIComponent(segment))
    .join('/')

  if (!bucket || !objectKey) return null

  return {
    source: '',
    bucket,
    objectKey,
    requestPath: `/files/${encodeObjectPath(bucket)}/${encodeObjectPath(objectKey)}`,
  }
}

export function parseProtectedFileReference(
  fileReference: string,
): ParsedProtectedFile | null {
  const trimmedReference = fileReference.trim()
  if (!trimmedReference || isPassThroughReference(trimmedReference)) {
    return null
  }

  const apiOrigin = getApiOrigin()
  const filesPathname = extractBackendFilesPathname(trimmedReference, apiOrigin)
  if (!filesPathname) return null

  const parsed = parseFilesPathname(filesPathname)
  if (!parsed) return null

  return {
    ...parsed,
    source: trimmedReference,
  }
}

export function isResolvableProtectedFileReference(
  fileReference: string | null | undefined,
) {
  if (!fileReference?.trim()) return false
  return parseProtectedFileReference(fileReference) !== null
}
