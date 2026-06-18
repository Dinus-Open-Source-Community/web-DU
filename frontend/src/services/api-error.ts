import { isAxiosError, type AxiosError } from 'axios'
import type { IResponse } from '@/lib/types/api'

export type AppErrorSource = AxiosError<IResponse<never>> | Error

export function coerceAppError(error: AppErrorSource | null | undefined): AppErrorSource | null {
  if (!error) return null
  if (isAxiosError(error) || error instanceof Error) return error
  return null
}

export function resolveAppErrorSource(error: Error | null | undefined): AppErrorSource | null {
  if (!error) return null

  const cause = error.cause
  if (isAxiosError(cause) || cause instanceof Error) {
    return cause
  }

  if (isAxiosError(error) || error instanceof Error) {
    return error
  }

  return null
}

export function isForbiddenFromError(error: Error | null | undefined): boolean {
  const source = resolveAppErrorSource(error)
  return source ? isForbiddenApiError(source) : false
}

export function getApiErrorMessage(error: AppErrorSource, fallback: string): string {
  if (isAxiosError<IResponse<never>>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    )
  }

  return error.message || fallback
}

export function isNotFoundApiError(error: AppErrorSource): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 404
  }
  return false
}

export function isForbiddenApiError(error: AppErrorSource): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 403
  }
  return false
}

export function unwrapApiResponse<T>(response: IResponse<T>, fallbackMessage: string): T {
  if (response.success === false) {
    throw new Error(response.message || response.error || fallbackMessage)
  }

  if (response.data == null) {
    throw new Error(response.message || response.error || fallbackMessage)
  }

  return response.data
}

export async function withApiErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const source = isAxiosError(error) || error instanceof Error ? error : null
    const message = source ? getApiErrorMessage(source, fallbackMessage) : fallbackMessage
    throw new Error(message, { cause: error })
  }
}

export type { AxiosError }
