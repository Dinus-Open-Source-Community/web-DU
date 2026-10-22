import { useMemo, useState } from 'react'
import type { IScheduleItem } from '@/lib/types/utils'
import type { ClassType } from '@/lib/types/course'
import {
  addDays,
  addMonths,
  convertScheduleToCalendarEvents,
  normalizeCalendarEvents,
  sortCalendarEvents,
  type MentorCalendarEvent,
} from '@/lib/func/calendar'
import { CalendarControls } from '@/components/shared/Calendar/CalendarControls'
import CalendarMainViews from './MainViews'
import { SessionDetailModal } from './SessionDetailModal'

interface CalendarViewProps {
  schedules: IScheduleItem[]
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda'
export type CalendarClassFilter = 'all' | ClassType

export default function CalendarView({ schedules }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [cursorDate, setCursorDate] = useState(new Date())
  const [classFilter, setClassFilter] = useState<CalendarClassFilter>('all')
  const [selectedSession, setSelectedSession] = useState<MentorCalendarEvent | null>(null)

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
      setCursorDate(addMonths(cursorDate, direction))
      return
    }

    if (viewMode === 'day') {
      setCursorDate(addDays(cursorDate, direction))
      return
    }

    setCursorDate(addDays(cursorDate, direction * 7))
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
