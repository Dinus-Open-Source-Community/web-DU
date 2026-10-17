import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import 'react-day-picker/style.css'

type ReviewSubmissionDateRangeProps = {
  htmlForId?: string
  value: DateRange | undefined
  onChange: (next: DateRange | undefined) => void
  className?: string
}

export function ReviewSubmissionDateRange({ htmlForId, value, onChange, className }: ReviewSubmissionDateRangeProps) {
  const label = useMemo(() => {
    if (!value?.from) return 'Rentang tanggal kirim'
    if (!value.to) return `${format(value.from, 'd MMM yyyy', { locale: id })} — …`
    if (value.from.getTime() === value.to.getTime()) {
      return format(value.from, 'd MMM yyyy', { locale: id })
    }
    return `${format(value.from, 'd MMM yyyy', { locale: id })} — ${format(value.to, 'd MMM yyyy', { locale: id })}`
  }, [value])

  return (
    <div className={cn('flex min-w-[200px] flex-col gap-1.5', className)}>
      <label htmlFor={htmlForId} className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        Tanggal kirim
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            id={htmlForId}
            type="button"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-auto min-h-10 w-full justify-start gap-2 rounded-sm border-line-light bg-paper-white px-3 py-2.5 text-left text-sm font-normal text-ink-900 shadow-none hover:bg-paper-paper',
              !value?.from && 'text-ink-500',
            )}>
            <CalendarDays className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] border-line-light p-3 shadow-sm" align="start">
          <DayPicker mode="range" selected={value} onSelect={onChange} numberOfMonths={2} className="rdp-root" />
          <div className="mt-3 flex justify-end border-t border-line-light pt-3">
            <Button type="button" variant="ghost" size="sm" className="text-ink-600" onClick={() => onChange(undefined)}>
              Hapus filter tanggal
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
