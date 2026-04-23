import { getAuthToken } from '@/lib/auth/session'
import { API_BASE_URL } from './api'

export type Envelope<T = unknown> = {
  success: boolean
  message: string
  data: T
  error: unknown
}

export type PaginatedEnvelope<K extends string, T> = Envelope<
  { meta: PaginationMeta } & Record<K, T[]>
>

export type PaginationMeta = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type PaginationParams = {
  page?: number
  per_page?: number
}

class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`)
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== '') url.searchParams.set(key, String(val))
    }
  }
  return url.toString()
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const msg =
      (body as { message?: string })?.message ??
      (body as { error?: string })?.error ??
      `Request failed (${res.status})`
    throw new ApiError(res.status, msg, body)
  }

  return body as T
}

export async function get<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers: { Accept: 'application/json', ...authHeaders() },
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}

export async function del<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...authHeaders() },
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}

export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { Accept: 'application/json', ...authHeaders() },
    body: formData,
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}

export { ApiError }
