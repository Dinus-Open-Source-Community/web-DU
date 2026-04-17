import { MapPin, Users } from 'lucide-react'
import { CalendarViewMode } from './types'
import { MentorCalendarEvent, isSameCalendarDay } from './calendarUtils'
import { MONTH_LABELS, WEEKDAY_LABELS } from './constants'
import { addDays, endOfDay, isDateInRange, startOfDay, startOfMonth, startOfWeek } from './dateUtils'
import { formatTime, getTypeStyles } from './eventUtils'
import { cn } from '@/lib/utils'
import { ClassTypeBadge } from '@/components/ui/badge'

interface CalendarMainViewsProps {
  viewMode: CalendarViewMode
  cursorDate: Date
  events: MentorCalendarEvent[]
}

export default function CalendarMainViews({ viewMode, cursorDate, events }: CalendarMainViewsProps) {
  const monthStart = startOfMonth(cursorDate)
  const monthGridStart = startOfWeek(monthStart)
  const monthCells = Array.from({ length: 42 }, (_, index) => addDays(monthGridStart, index))

  const weekStart = startOfWeek(cursorDate)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  const dayEvents = events.filter((event) => isSameCalendarDay(event.start, cursorDate))

  const agendaStart = startOfDay(cursorDate)
  const agendaEnd = endOfDay(addDays(agendaStart, 13))
  const agendaEvents = events.filter((event) => isDateInRange(event.start, agendaStart, agendaEnd))

  if (viewMode === 'week') {
    return (
      <div className="grid grid-cols-1  gap-3">
        {weekDays.map((weekDate) => {
          const eventsForDay = events.filter((event) => isSameCalendarDay(event.start, weekDate))
          return (
            <div key={weekDate.toISOString()} className="rounded-xl shadow-sm border border-slate-100 bg-white p-3">
              <div className="mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{WEEKDAY_LABELS[weekDate.getDay()]}</p>
                <p className="text-sm font-semibold text-slate-800">
                  {weekDate.getDate()} {MONTH_LABELS[weekDate.getMonth()]}
                </p>
              </div>

              <div className="space-y-2">
                {eventsForDay.length === 0 && <p className="text-sm text-slate-500">No session</p>}
                {eventsForDay.map((event) => (
                  <div key={event.id} className={cn('rounded-lg border px-2.5 py-2 text-[11px]', getTypeStyles(event.resource.classType))}>
                    <p className="font-semibold">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </p>
                    <p className="mt-0.5 line-clamp-2">{event.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (viewMode === 'day') {
    return (
      <div className="rounded-xl border border-slate-100 bg-white divide-y divide-slate-100">
        {dayEvents.length === 0 && <p className="p-4 text-sm text-slate-500">No sessions scheduled for this day.</p>}
        {dayEvents.map((event) => (
          <div key={event.id} className="p-4 flex items-start gap-4">
            <div className="w-24 shrink-0">
              <p className="text-sm font-semibold text-slate-800">{formatTime(event.start)}</p>
              <p className="text-xs text-slate-500">{formatTime(event.end)}</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                <ClassTypeBadge classType={event.resource.classType} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {event.resource.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  {event.resource.studentCount} students
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (viewMode === 'agenda') {
    return (
      <div className="rounded-xl border border-slate-100 bg-white divide-y divide-slate-100">
        {agendaEvents.length === 0 && <p className="p-4 text-sm text-slate-500">No sessions in the next two weeks.</p>}
        {agendaEvents.map((event) => (
          <div key={event.id} className="px-4 py-3 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{WEEKDAY_LABELS[event.start.getDay()]}</p>
              <p className="text-sm font-semibold text-slate-800">
                {event.start.getDate()} {MONTH_LABELS[event.start.getMonth()]} {event.start.getFullYear()}
              </p>
              <p className="text-xs text-slate-500">
                {formatTime(event.start)} - {formatTime(event.end)}
              </p>
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{event.title}</h4>
                <ClassTypeBadge classType={event.resource.classType} />
              </div>
              <p className="mt-1 text-xs text-slate-500 truncate">{event.resource.location}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
        {WEEKDAY_LABELS.map((weekday) => (
          <div key={weekday} className="bg-slate-50 py-2 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {weekday}
          </div>
        ))}

        {monthCells.map((cellDate) => {
          const isToday = isSameCalendarDay(cellDate, new Date())
          const isOutsideMonth = cellDate.getMonth() !== cursorDate.getMonth()
          const cellEvents = events.filter((event) => isSameCalendarDay(event.start, cellDate))

          return (
            <div key={cellDate.toISOString()} className={cn('bg-white min-h-29 p-2.5 space-y-2', isOutsideMonth && 'bg-slate-50')}>
              <div className="flex items-center justify-between">
                <span className={cn('text-xs font-semibold', isOutsideMonth ? 'text-slate-400' : 'text-slate-700')}>{cellDate.getDate()}</span>
                {isToday && <span className="text-[10px] font-semibold text-primary">Today</span>}
              </div>

              <div className="space-y-1">
                {cellEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className={cn('rounded-md border px-2 py-1 text-[11px] leading-tight', getTypeStyles(event.resource.classType))}>
                    <span className="font-semibold">{formatTime(event.start)}</span> {event.title}
                  </div>
                ))}
                {cellEvents.length > 2 && <p className="text-[11px] text-slate-500">+{cellEvents.length - 2} more</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
