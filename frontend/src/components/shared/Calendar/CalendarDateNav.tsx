import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { id } from 'react-day-picker/locale'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { CalendarViewMode } from '@/components/shared/Calendar/View'
import { buildRangeLabel, CALENDAR_VIEW_HINT } from '@/lib/func/calendar'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

type CalendarDateNavProps = {
  cursorDate: Date
  viewMode: CalendarViewMode
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onPickDate: (date: Date) => void
}

export function CalendarDateNav({
  cursorDate,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  onPickDate,
}: CalendarDateNavProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const rangeLabel = buildRangeLabel(cursorDate, viewMode)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onPrevious}
            aria-label="Periode sebelumnya"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onNext}
            aria-label="Periode berikutnya"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>

        <div className="min-w-0 border-l-2 border-ink-900/10 pl-3">
          <p className="truncate font-headline text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
            {rangeLabel}
          </p>
          <p className="text-xs font-medium text-ink-500">{CALENDAR_VIEW_HINT[viewMode]}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onToday}>
          Hari ini
        </Button>

        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <CalendarDays className="size-4 opacity-80" aria-hidden />
              Pilih tanggal
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn(appCardClassName, 'w-auto p-0 shadow-paper')} align="end">
            <Calendar
              mode="single"
              locale={id}
              selected={cursorDate}
              onSelect={(date) => {
                if (!date) return
                onPickDate(date)
                setPickerOpen(false)
              }}
              defaultMonth={cursorDate}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
