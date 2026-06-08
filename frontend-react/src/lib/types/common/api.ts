/** Envelope response standar dari backend API. */
export interface IApiResponse<T> {
  success?: boolean
  message?: string
  data?: T | null
  error?: string | null
}

/** @deprecated Gunakan `IApiResponse` — alias untuk migrasi bertahap. */
export type IResponse<T> = IApiResponse<T>
