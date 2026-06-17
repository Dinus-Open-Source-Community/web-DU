import { isAxiosError, type AxiosError } from 'axios'
import type { IResponse } from '@/lib/types/api'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<IResponse<never>>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function isNotFoundApiError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 404
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
    throw new Error(getApiErrorMessage(error, fallbackMessage), { cause: error })
  }
}

export type { AxiosError }
