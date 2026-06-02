'use client'

import { useEffect, useId } from 'react'
import { useNavbarSearch } from '../../providers/navbar-search-provider'

interface SearchFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  submitLabel?: string
  className?: string
  inputClassName?: string
  submitButtonClassName?: string
}

export function SearchForm({ onChange, onSubmit, placeholder = 'Cari...' }: SearchFormProps) {
  const id = useId()
  const { registerLocalSearch } = useNavbarSearch()

  useEffect(() => {
    return registerLocalSearch({
      id,
      placeholder,
      onSearch: (query) => {
        onChange(query)
        window.setTimeout(onSubmit, 0)
      },
    })
  }, [id, onChange, onSubmit, placeholder, registerLocalSearch])

  return null
}
