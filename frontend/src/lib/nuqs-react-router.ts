import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

type SetQueryOptions = {
  replace?: boolean
}

function updateSearchParam(
  searchParams: URLSearchParams,
  key: string,
  next: string | null,
  defaultValue?: string,
) {
  const draft = new URLSearchParams(searchParams)

  if (next === null || next === defaultValue) {
    draft.delete(key)
  } else {
    draft.set(key, next)
  }

  return draft
}

export function useQueryState(key: string, defaultValue?: string) {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get(key) ?? defaultValue ?? null

  const setValue = useCallback(
    (next: string | null, options?: SetQueryOptions) => {
      setSearchParams(updateSearchParam(searchParams, key, next, defaultValue), {
        replace: options?.replace ?? true,
      })
    },
    [defaultValue, key, searchParams, setSearchParams],
  )

  return [value, setValue] as const
}

export function useQueryStateEnum<T extends string>(
  key: string,
  allowedValues: readonly T[],
  defaultValue?: T,
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get(key)
  const value = allowedValues.includes(raw as T) ? (raw as T) : (defaultValue ?? null)

  const setValue = useCallback(
    (next: T | null, options?: SetQueryOptions) => {
      setSearchParams(updateSearchParam(searchParams, key, next, defaultValue), {
        replace: options?.replace ?? true,
      })
    },
    [defaultValue, key, searchParams, setSearchParams],
  )

  return [value, setValue] as const
}
