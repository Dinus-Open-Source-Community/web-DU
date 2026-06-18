import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { IScheduleItem } from '@/lib/types/utils'
import type { ClassType } from '@/lib/types/course'
import { addDays, addMonths, convertScheduleToCalendarEvents, groupUpcomingEvents, MONTH_LABELS, normalizeCalendarEvents, sortCalendarEvents, VIEW_OPTIONS } from '@/lib/func/calendar'
import CalendarToolbar from './Toolbar'
import CalendarMainViews from './MainViews'
import UpcomingSessionsAside from '../UpcomingSession'

interface CalendarViewProps {
  schedules: IScheduleItem[]
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda'
export type CalendarClassFilter = 'all' | ClassType

export default function CalendarView({ schedules }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [cursorDate, setCursorDate] = useState(new Date())
  const [classFilter, setClassFilter] = useState<CalendarClassFilter>('all')

  const events = useMemo(() => {
    return normalizeCalendarEvents(convertScheduleToCalendarEvents(schedules, 'backend'))
  }, [schedules])

  const filteredEvents = useMemo(() => {
    const source = classFilter === 'all' ? events : events.filter((event) => event.resource.classType === classFilter)
    return sortCalendarEvents(source)
  }, [classFilter, events])

  const upcomingGroups = useMemo(() => {
    return groupUpcomingEvents(filteredEvents)
  }, [filteredEvents])

  const moveCursor = (direction: 1 | -1) => {
    if (viewMode === 'month') {
      setCursorDate(addMonths(cursorDate, direction))
      return
    }

    if (viewMode === 'day') {
      setCursorDate(addDays(cursorDate, direction))
      return
    }

    setCursorDate(addDays(cursorDate, direction * 7))
  }

  const onToday = () => setCursorDate(new Date())

  // Dropdown options generation
  const daysInMonth = new Date(cursorDate.getFullYear(), cursorDate.getMonth() + 1, 0).getDate()
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i)

  return (
    <section className="space-y-6">
      <CalendarToolbar classFilter={classFilter} setClassFilter={setClassFilter} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Calendar Controls (Unified Navigation & View Options) - Moved here to be in the same section as the calendar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm">
            {/* Date Selection Dropdowns and Navigation */}
            <div className="flex flex-wrap items-center gap-3 pl-1">
              <div className="flex items-center gap-0.5 rounded-lg bg-slate-50 border border-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => moveCursor(-1)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all active:scale-95"
                  aria-label="Previous">
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={onToday}
                  className="rounded-md px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all active:scale-95">
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => moveCursor(1)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all active:scale-95"
                  aria-label="Next">
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

              {/* Interactive Day/Month/Year Selects */}
              <div className="flex items-center gap-1.5">
                <div className="relative group">
                  <select
                    value={cursorDate.getDate()}
                    onChange={(e) => {
                      const d = new Date(cursorDate)
                      d.setDate(Number(e.target.value))
                      setCursorDate(d)
                    }}
                    className="appearance-none bg-white/50 hover:bg-white border border-slate-200/60 rounded-lg pl-2.5 pr-7 py-1.5 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer shadow-xs min-w-[56px]">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 pointer-events-none transition-colors" />
                </div>

                <div className="relative group">
                  <select
                    value={cursorDate.getMonth()}
                    onChange={(e) => {
                      const d = new Date(cursorDate)
                      d.setMonth(Number(e.target.value))
                      setCursorDate(d)
                    }}
                    className="appearance-none bg-white/50 hover:bg-white border border-slate-200/60 rounded-lg pl-2.5 pr-7 py-1.5 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer shadow-xs min-w-[70px]">
                    {MONTH_LABELS.map((m, i) => (
                      <option key={m} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 pointer-events-none transition-colors" />
                </div>

                <div className="relative group">
                  <select
                    value={cursorDate.getFullYear()}
                    onChange={(e) => {
                      const d = new Date(cursorDate)
                      d.setFullYear(Number(e.target.value))
                      setCursorDate(d)
                    }}
                    className="appearance-none bg-white/50 hover:bg-white border border-slate-200/60 rounded-lg pl-2.5 pr-7 py-1.5 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer shadow-xs min-w-[76px]">
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 pointer-events-none transition-colors" />
                </div>
              </div>
            </div>

            {/* View Selection (Month/Week/Day/Agenda) as Tabs */}
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-0.5 flex items-center gap-1 mr-0.5">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setViewMode(option.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200',
                    viewMode === option.value ? 'bg-white text-primary shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50',
                  )}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <CalendarMainViews viewMode={viewMode} cursorDate={cursorDate} events={filteredEvents} />
        </div>

        <UpcomingSessionsAside groups={upcomingGroups} />
      </div>
    </section>
  )
}
