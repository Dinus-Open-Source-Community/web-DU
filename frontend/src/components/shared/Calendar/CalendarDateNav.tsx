import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CalendarViewMode } from '@/components/shared/Calendar/View'
import { buildRangeLabel, CALENDAR_VIEW_HINT } from '@/lib/func/calendar'

type CalendarDateNavProps = {
  cursorDate: Date
  viewMode: CalendarViewMode
  onPrevious: () => void
  onNext: () => void
}

export function CalendarDateNav({
  cursorDate,
  viewMode,
  onPrevious,
  onNext,
}: CalendarDateNavProps) {
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
    </div>
  )
}
