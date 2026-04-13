import { Dispatch, SetStateAction } from 'react'
import { cn } from '@/lib/utils'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { VIEW_OPTIONS } from './constants'
import { CalendarClassFilter, CalendarViewMode } from './types'

interface CalendarToolbarProps {
  viewMode: CalendarViewMode
  setViewMode: Dispatch<SetStateAction<CalendarViewMode>>
  classFilter: CalendarClassFilter
  setClassFilter: Dispatch<SetStateAction<CalendarClassFilter>>
  rangeLabel: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function CalendarToolbar({ viewMode, setViewMode, classFilter, setClassFilter, rangeLabel, onPrev, onNext, onToday }: CalendarToolbarProps) {
  return (
    <header className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold font-headline text-slate-900">
              <CalendarDays size={20} className="text-primary" />
              Teaching Calendar
            </h2>
            <p className="mt-1 text-sm text-slate-500">Live event board with automatic refresh every 20 seconds.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-1 flex items-center gap-1">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setViewMode(option.value)}
                  className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold', viewMode === option.value ? 'bg-primary/10 text-primary' : 'text-slate-500')}>
                  {option.label}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-1 flex items-center gap-1">
              <button type="button" onClick={onPrev} className="rounded-lg px-2 py-1.5 text-slate-500">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={onToday} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700">
                Today
              </button>
              <button type="button" onClick={onNext} className="rounded-lg px-2 py-1.5 text-slate-500">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">{rangeLabel}</p>
          <div className="rounded-full border border-slate-200 p-1 inline-flex items-center gap-1 w-fit">
            {(['all', 'online', 'offline'] as CalendarClassFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setClassFilter(filter)}
                className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize', classFilter === filter ? 'bg-primary/10 text-primary' : 'text-slate-500')}>
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
