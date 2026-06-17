import { FileText, Search, X } from 'lucide-react'

import type { NavbarSearchItem } from '@/providers/navbar-search-provider'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type LessonSearchDialogProps = {
  open: boolean
  query: string
  items: NavbarSearchItem[]
  inputRef: React.RefObject<HTMLInputElement | null>
  theme: LessonThemeMode
  onQueryChange: (query: string) => void
  onClose: () => void
}

export function LessonSearchDialog({ open, query, items, inputRef, theme, onQueryChange, onClose }: LessonSearchDialogProps) {
  const isDark = theme === 'dark'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 px-4 pt-[13vh]" onMouseDown={onClose}>
      <div className={cn('mx-auto w-full max-w-2xl overflow-hidden border shadow-2xl', isDark ? 'border-zinc-700 bg-zinc-900' : 'border-slate-200 bg-white')} onMouseDown={(event) => event.stopPropagation()}>
        <div className={cn('flex items-center gap-3 border-b px-4 py-3', isDark ? 'border-zinc-800' : 'border-slate-200')}>
          <Search className={cn('h-5 w-5', isDark ? 'text-zinc-500' : 'text-slate-400')} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                items[0]?.onSelect?.()
              }
              if (event.key === 'Escape') onClose()
            }}
            placeholder="Cari modul/konten"
            className={cn('h-11 flex-1 bg-transparent text-sm font-medium outline-none', isDark ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-slate-950 placeholder:text-slate-400')}
          />
          <button
            type="button"
            onClick={onClose}
            className={cn('flex h-9 w-9 items-center justify-center rounded-lg transition', isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-950')}
            aria-label="Tutup pencarian">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {items.length > 0 ? (
            items.map((item) => {
              const Icon = item.icon ?? FileText

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.onSelect?.()}
                  className={cn('flex w-full items-center gap-3 px-3 py-3 text-left transition focus:outline-none', isDark ? 'hover:bg-zinc-800 focus:bg-zinc-800' : 'hover:bg-slate-50 focus:bg-slate-50')}>
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-primary', isDark ? 'border-zinc-700 bg-zinc-950' : 'border-slate-200 bg-slate-50')}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-sm font-semibold', isDark ? 'text-zinc-100' : 'text-slate-950')}>{item.label}</span>
                    <span className={cn('block truncate text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>{item.description}</span>
                  </span>
                </button>
              )
            })
          ) : (
            <div className={cn('px-3 py-10 text-center text-sm', isDark ? 'text-zinc-500' : 'text-slate-500')}>Tidak ada modul atau konten yang cocok.</div>
          )}
        </div>
      </div>
    </div>
  )
}
