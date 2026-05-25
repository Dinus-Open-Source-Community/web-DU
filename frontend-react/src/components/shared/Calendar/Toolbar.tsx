import { CalendarDays, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dispatch, SetStateAction } from 'react'
import type { CalendarClassFilter } from './View'

interface CalendarToolbarProps {
  classFilter: CalendarClassFilter
  setClassFilter: Dispatch<SetStateAction<CalendarClassFilter>>
}

export default function CalendarToolbar({ classFilter, setClassFilter }: CalendarToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold font-headline text-slate-900">
          <CalendarDays size={20} className="text-primary" />
          Teaching Calendar
        </h2>
        <p className="mt-1 text-sm text-slate-500">Manage your teaching schedule and view upcoming sessions.</p>
      </div>

      {/* Filter Sessions - Redesigned for better UX clarity */}
      <div className="flex flex-col gap-2 md:items-end">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-1">
          <Filter size={12} className="text-slate-400" />
          Filter Class Type
        </label>
        <div className="rounded-xl border border-slate-200 bg-white p-1 flex items-center gap-1 shadow-sm w-fit">
          {(['all', 'online', 'offline'] as CalendarClassFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setClassFilter(filter)}
              className={cn(
                'rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-200',
                classFilter === filter ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              )}>
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
