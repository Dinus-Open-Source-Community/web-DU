'use client'

import { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  submitLabel?: string
}

export function SearchForm({ value, onChange, onSubmit, placeholder = 'Cari...', submitLabel = 'Cari' }: SearchFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-3 md:max-w-3xl">
      <div className="flex w-full items-center gap-3">
        <div className="relative flex w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pr-4 pl-11 text-slate-900  outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button type="submit" className="h-11 rounded-xl w-[20%] bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/95">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
