import type { AxiosError } from 'axios'
import type { IResponse } from '@/lib/types/api'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<IResponse<unknown>>
  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.message ||
    fallback
  )
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
