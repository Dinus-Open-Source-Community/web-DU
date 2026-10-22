import { MapPin, Users, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClassTypeBadge } from '@/components/ui/badge'
import { mentorCalendarLayout } from '@/lib/layout/mentor-calendar-layout'
import type { CalendarViewMode } from './View'
import {
  addDays,
  endOfDay,
  formatTime,
  isDateInRange,
  isSameCalendarDay,
  MONTH_LABELS,
  startOfDay,
  startOfMonth,
  startOfWeek,
  WEEKDAY_LABELS,
  type MentorCalendarEvent,
} from '@/lib/func/calendar'

interface CalendarMainViewsProps {
  viewMode: CalendarViewMode
  cursorDate: Date
  events: MentorCalendarEvent[]
  onSelectDate: (date: Date) => void
  onViewModeChange?: (mode: CalendarViewMode) => void
  onSelectSession: (event: MentorCalendarEvent) => void
}

export default function CalendarMainViews({
  viewMode,
  cursorDate,
  events,
  onSelectDate,
  onViewModeChange,
  onSelectSession,
}: CalendarMainViewsProps) {
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
      <div className="grid grid-cols-1 gap-3">
        {weekDays.map((weekDate) => {
          const eventsForDay = events.filter((event) => isSameCalendarDay(event.start, weekDate))
          const isSelected = isSameCalendarDay(weekDate, cursorDate)
          const isToday = isSameCalendarDay(weekDate, new Date())

          return (
            <div
              key={weekDate.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDate(weekDate)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDate(weekDate)
                }
              }}
              aria-label={`${weekDate.getDate()} ${MONTH_LABELS[weekDate.getMonth()]}${isSelected ? ', dipilih' : ''}${isToday ? ', hari ini' : ''}`}
              aria-pressed={isSelected}
              className={cn(
                mentorCalendarLayout.dayPanel,
                'cursor-pointer text-left transition-all duration-150 outline-none',
                'hover:border-primary/40',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                isSelected && 'ring-2 ring-primary ring-inset bg-primary/[0.03]'
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
                    {WEEKDAY_LABELS[weekDate.getDay()]}
                  </p>
                  <p className="text-sm font-semibold text-ink-800">
                    {weekDate.getDate()} {MONTH_LABELS[weekDate.getMonth()]}
                  </p>
                </div>
                {isToday && (
                  <span className="text-[10px] font-semibold text-brand-blue">Hari ini</span>
                )}
              </div>

              <div className="space-y-2.5">
                {eventsForDay.length === 0 && <p className="text-sm text-ink-500">Tidak ada sesi</p>}
                {eventsForDay.map((event) => (
                  <button
                    type="button"
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSession(event)
                    }}
                    className={cn(
                      'group/chip flex w-full flex-col gap-1.5 rounded-lg border border-line-light bg-paper-white p-3 text-left transition-all duration-150 cursor-pointer shadow-xs',
                      'hover:border-ink-900/20 hover:shadow-paper hover:-translate-y-0.5 active:translate-y-0',
                      event.resource.classType === 'online'
                        ? 'border-l-4 border-l-brand-blue'
                        : 'border-l-4 border-l-amber-500'
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-mono font-bold tracking-tight text-ink-700">
                        {formatTime(event.start)} – {formatTime(event.end)} WIB
                      </span>
                      <ClassTypeBadge classType={event.resource.classType} />
                    </div>

                    <p className="font-headline text-sm font-bold text-ink-900 transition-colors group-hover/chip:text-brand-ink">
                      {event.title}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-ink-500">
                      <span className="flex items-center gap-1">
                        <Users className="size-3 text-ink-400" />
                        <span>{event.resource.studentCount} siswa</span>
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        {event.resource.classType === 'online' ? (
                          <Video className="size-3 text-brand-blue" />
                        ) : (
                          <MapPin className="size-3 text-amber-600" />
                        )}
                        <span className="truncate">{event.resource.location}</span>
                      </span>
                    </div>
                  </button>
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
      <div className={cn(mentorCalendarLayout.monthGrid, 'divide-y divide-line-light')}>
        {dayEvents.length === 0 && (
          <p className="p-4 text-sm text-ink-500">Tidak ada sesi terjadwal pada hari ini.</p>
        )}
        {dayEvents.map((event) => (
          <div
            key={event.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectSession(event)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectSession(event)
              }
            }}
            className={cn(
              'group/day-item flex items-start gap-4 p-4 cursor-pointer transition-colors outline-none hover:bg-paper-paper/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
              event.resource.classType === 'online'
                ? 'border-l-4 border-l-brand-blue'
                : 'border-l-4 border-l-amber-500'
            )}
          >
            <div className="w-24 shrink-0">
              <p className="text-sm font-semibold font-mono text-ink-800">{formatTime(event.start)}</p>
              <p className="text-xs font-mono text-ink-500">{formatTime(event.end)}</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-ink-900 group-hover/day-item:text-brand-ink transition-colors">
                  {event.title}
                </h4>
                <ClassTypeBadge classType={event.resource.classType} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {event.resource.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  {event.resource.studentCount} siswa
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
      <div className={cn(mentorCalendarLayout.monthGrid, 'divide-y divide-line-light')}>
        {agendaEvents.length === 0 && (
          <p className="p-4 text-sm text-ink-500">Tidak ada sesi dalam dua minggu ke depan.</p>
        )}
        {agendaEvents.map((event) => {
          const isSelected = isSameCalendarDay(event.start, cursorDate)

          return (
            <div
              key={event.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectSession(event)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectSession(event)
                }
              }}
              className={cn(
                'grid grid-cols-1 items-center gap-3 px-4 py-3 cursor-pointer transition-colors outline-none md:grid-cols-[180px_1fr]',
                'hover:bg-primary/[0.04]',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                isSelected && 'bg-primary/[0.05]',
                event.resource.classType === 'online'
                  ? 'border-l-4 border-l-brand-blue'
                  : 'border-l-4 border-l-amber-500'
              )}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  {WEEKDAY_LABELS[event.start.getDay()]}
                </p>
                <p className="text-sm font-semibold text-ink-800">
                  {event.start.getDate()} {MONTH_LABELS[event.start.getMonth()]}{' '}
                  {event.start.getFullYear()}
                </p>
                <p className="text-xs font-mono text-ink-500">
                  {formatTime(event.start)} - {formatTime(event.end)}
                </p>
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="truncate text-sm font-bold text-ink-900">{event.title}</h4>
                  <ClassTypeBadge classType={event.resource.classType} />
                </div>
                <p className="mt-1 truncate text-xs text-ink-500">{event.resource.location}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className={cn(mentorCalendarLayout.monthGrid, 'grid grid-cols-7 gap-px bg-paper-paper p-0')}>
        {WEEKDAY_LABELS.map((weekday) => (
          <div
            key={weekday}
            className="bg-paper-paper py-2.5 text-center text-[11px] font-semibold uppercase tracking-widest text-ink-500"
          >
            {weekday}
          </div>
        ))}

        {monthCells.map((cellDate) => {
          const isToday = isSameCalendarDay(cellDate, new Date())
          const isSelected = isSameCalendarDay(cellDate, cursorDate)
          const isOutsideMonth = cellDate.getMonth() !== cursorDate.getMonth()
          const cellEvents = events.filter((event) => isSameCalendarDay(event.start, cellDate))

          return (
            <div
              key={cellDate.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDate(cellDate)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDate(cellDate)
                }
              }}
              aria-label={`${cellDate.getDate()} ${MONTH_LABELS[cellDate.getMonth()]} ${cellDate.getFullYear()}${isSelected ? ', dipilih' : ''}${isToday ? ', hari ini' : ''}${cellEvents.length > 0 ? `, ${cellEvents.length} sesi` : ''}`}
              aria-pressed={isSelected}
              className={cn(
                'group relative min-h-36 sm:min-h-40 space-y-2 p-3 text-left cursor-pointer transition-colors duration-150 outline-none select-none',
                isOutsideMonth ? 'bg-paper-paper/50 text-ink-400' : 'bg-paper-white text-ink-800',
                'hover:bg-primary/[0.04]',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset focus-visible:z-10',
                isSelected && 'bg-primary/[0.06] ring-2 ring-primary ring-inset z-10'
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isSelected
                      ? 'bg-primary font-bold text-white shadow-xs'
                      : isToday
                        ? 'bg-brand-blue/15 font-bold text-brand-blue'
                        : isOutsideMonth
                          ? 'text-ink-400 group-hover:text-ink-700'
                          : 'text-ink-700 group-hover:text-ink-900'
                  )}
                >
                  {cellDate.getDate()}
                </span>
                {isToday && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold',
                      isSelected ? 'text-primary' : 'text-brand-blue'
                    )}
                  >
                    Hari ini
                  </span>
                )}
              </div>

              {/* Editorial Session Chips */}
              <div className="space-y-1.5">
                {cellEvents.slice(0, 2).map((event) => (
                  <button
                    type="button"
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSession(event)
                    }}
                    aria-label={`Lihat detail sesi: ${event.title}`}
                    className={cn(
                      'group/chip flex w-full flex-col gap-1 rounded-md border border-line-light bg-paper-white p-2 text-left transition-all duration-150 cursor-pointer shadow-xs',
                      'hover:border-ink-900/20 hover:shadow-paper hover:-translate-y-0.5 active:translate-y-0',
                      event.resource.classType === 'online'
                        ? 'border-l-[3px] border-l-brand-blue'
                        : 'border-l-[3px] border-l-amber-500'
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-mono font-bold tracking-tight text-ink-700">
                        {formatTime(event.start)} – {formatTime(event.end)}
                      </span>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider',
                          event.resource.classType === 'online'
                            ? 'bg-brand-soft/50 text-brand-ink'
                            : 'bg-amber-100/70 text-amber-900'
                        )}
                      >
                        {event.resource.classType}
                      </span>
                    </div>

                    <p className="truncate font-headline text-xs font-bold text-ink-900 transition-colors group-hover/chip:text-brand-ink">
                      {event.title}
                    </p>

                    <div className="flex items-center justify-between gap-1 text-[10px] text-ink-500">
                      <span className="flex items-center gap-1 truncate">
                        <Users className="size-2.5 shrink-0 text-ink-400" />
                        <span>{event.resource.studentCount} siswa</span>
                      </span>
                      <span className="truncate text-ink-400 text-[9.5px]">
                        {event.resource.classType === 'online' ? 'Online' : (event.resource.location || 'TBA')}
                      </span>
                    </div>
                  </button>
                ))}

                {cellEvents.length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectDate(cellDate)
                      onViewModeChange?.('day')
                    }}
                    className="w-full text-center py-1 text-[10.5px] font-semibold text-brand-ink bg-brand-soft/30 hover:bg-brand-soft/60 rounded border border-brand-blue/20 transition-colors cursor-pointer"
                  >
                    +{cellEvents.length - 2} sesi lainnya
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
