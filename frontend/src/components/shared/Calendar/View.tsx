import { useEffect, useMemo, useState } from 'react'
import type { IScheduleItem } from '@/lib/types/utils'
import type { ClassType } from '@/lib/types/course'
import {
  addDays,
  addMonths,
  convertScheduleToCalendarEvents,
  normalizeCalendarEvents,
  sortCalendarEvents,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type MentorCalendarEvent,
} from '@/lib/func/calendar'
import { CalendarControls } from '@/components/shared/Calendar/CalendarControls'
import CalendarMainViews from './MainViews'
import { SessionDetailModal } from './SessionDetailModal'

interface CalendarViewProps {
  schedules: IScheduleItem[]
  onVisibleRangeChange?: (from: string, to: string) => void
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda'
export type CalendarClassFilter = 'all' | ClassType

export default function CalendarView({ schedules, onVisibleRangeChange }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [cursorDate, setCursorDate] = useState(new Date())
  const [classFilter, setClassFilter] = useState<CalendarClassFilter>('all')
  const [selectedSession, setSelectedSession] = useState<MentorCalendarEvent | null>(null)

  useEffect(() => {
    if (!onVisibleRangeChange) return

    let rangeStart: Date
    let rangeEnd: Date

    if (viewMode === 'month') {
      const monthStart = startOfMonth(cursorDate)
      rangeStart = startOfWeek(monthStart)
      rangeEnd = addDays(rangeStart, 41)
    } else if (viewMode === 'week') {
      rangeStart = startOfWeek(cursorDate)
      rangeEnd = addDays(rangeStart, 6)
    } else if (viewMode === 'day') {
      rangeStart = startOfDay(cursorDate)
      rangeEnd = rangeStart
    } else {
      rangeStart = startOfDay(cursorDate)
      rangeEnd = addDays(rangeStart, 13)
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    onVisibleRangeChange(formatDate(rangeStart), formatDate(rangeEnd))
  }, [cursorDate, onVisibleRangeChange, viewMode])

  const events = useMemo(() => {
    return normalizeCalendarEvents(convertScheduleToCalendarEvents(schedules, 'backend'))
  }, [schedules])

  const filteredEvents = useMemo(() => {
    const source =
      classFilter === 'all'
        ? events
        : events.filter((event) => event.resource.classType === classFilter)
    return sortCalendarEvents(source)
  }, [classFilter, events])

  const moveCursor = (direction: 1 | -1) => {
    if (viewMode === 'month') {
      setCursorDate((current) => addMonths(current, direction))
      return
    }

    if (viewMode === 'day') {
      setCursorDate((current) => addDays(current, direction))
      return
    }

    setCursorDate((current) => addDays(current, direction * 7))
  }

  return (
    <section className="flex flex-col gap-4">
      <CalendarControls
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        cursorDate={cursorDate}
        onPrevious={() => moveCursor(-1)}
        onNext={() => moveCursor(1)}
      />

      <div className="w-full">
        <CalendarMainViews
          viewMode={viewMode}
          cursorDate={cursorDate}
          events={filteredEvents}
          onSelectDate={setCursorDate}
          onViewModeChange={setViewMode}
          onSelectSession={setSelectedSession}
        />
      </div>

      <SessionDetailModal
        session={selectedSession}
        open={Boolean(selectedSession)}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null)
        }}
      />
    </section>
  )
}
