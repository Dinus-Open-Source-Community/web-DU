import { Check } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type LessonThemeDialogProps = {
  open: boolean
  value: LessonThemeMode
  onOpenChange: (open: boolean) => void
  onChange: (theme: LessonThemeMode) => void
}

const themeOptions: Array<{
  value: LessonThemeMode
  title: string
  description: string
  recommended?: boolean
}> = [
  {
    value: 'dark',
    title: 'Dark mode',
    description: 'Disarankan untuk membaca materi lebih lama dan mengurangi silau layar.',
    recommended: true,
  },
  {
    value: 'light',
    title: 'Light mode',
    description: 'Cocok untuk ruangan terang atau saat Anda butuh kontras halaman putih.',
  },
]

export function LessonThemeDialog({ open, value, onOpenChange, onChange }: LessonThemeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-slate-200 bg-white p-0 text-slate-950" showCloseButton={false}>
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-slate-950">Pilih mode membaca</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-slate-600">Anda bisa mengubah pilihan ini kapan saja lewat tombol setting di kanan atas.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 px-6 py-5">
          {themeOptions.map((option) => {
            const isSelected = value === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  'flex w-full items-start gap-4 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/30',
                  isSelected ? 'border-primary bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                )}>
                <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300')}>
                  {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{option.title}</span>
                    {option.recommended ? <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">Recommended</span> : null}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{option.description}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            Mulai membaca
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
