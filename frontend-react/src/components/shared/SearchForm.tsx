'use client'

import { Search } from 'lucide-react'
import type { SyntheticEvent } from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

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

const inputBase =
  'w-full rounded-xl border border-slate-200 bg-white py-3.5 pr-4 pl-11 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary'

export function SearchForm({ value, onChange, onSubmit, placeholder = 'Cari...', submitLabel = 'Cari', className, inputClassName, submitButtonClassName }: SearchFormProps) {
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex w-full flex-col gap-3 md:max-w-3xl md:flex-row md:items-center', className)}>
      <div className="relative flex w-full flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="h-5 w-5 text-slate-400" aria-hidden />
        </div>
        <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={cn(inputBase, inputClassName)} />
      </div>
      <Button type="submit" className={cn('h-11 shrink-0 rounded-xl px-6 text-sm font-semibold md:w-auto md:min-w-[120px]', submitButtonClassName)}>
        {submitLabel}
      </Button>
    </form>
  )
}
