import type { Dispatch, SetStateAction } from 'react'

import { UnderlineTabList } from '@/components/shared/UnderlineTabList'
import { CalendarDateNav } from '@/components/shared/Calendar/CalendarDateNav'
import type { CalendarClassFilter, CalendarViewMode } from '@/components/shared/Calendar/View'
import { VIEW_OPTIONS } from '@/lib/func/calendar'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

const CLASS_FILTER_OPTIONS: { value: CalendarClassFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
]

type CalendarControlsProps = {
  classFilter: CalendarClassFilter
  setClassFilter: Dispatch<SetStateAction<CalendarClassFilter>>
  viewMode: CalendarViewMode
  setViewMode: Dispatch<SetStateAction<CalendarViewMode>>
  cursorDate: Date
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onPickDate: (date: Date) => void
}

function ControlSectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-ink-400">{children}</p>
  )
}

export function CalendarControls({
  classFilter,
  setClassFilter,
  viewMode,
  setViewMode,
  cursorDate,
  onPrevious,
  onNext,
  onToday,
  onPickDate,
}: CalendarControlsProps) {
  return (
    <div className={cn(appCardClassName, 'overflow-hidden p-0 shadow-none')}>
      <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-line-light">
        <div className="px-4 pb-4 pt-4 lg:pb-5">
          <ControlSectionLabel>Tipe kelas</ControlSectionLabel>
          <UnderlineTabList
            value={classFilter}
            options={CLASS_FILTER_OPTIONS}
            onChange={setClassFilter}
            ariaLabel="Filter tipe kelas"
          />
        </div>
        <div className="border-t border-line-light px-4 pb-4 pt-4 lg:border-t-0 lg:pb-5 lg:pt-4">
          <ControlSectionLabel>Tampilan</ControlSectionLabel>
          <UnderlineTabList
            value={viewMode}
            options={VIEW_OPTIONS}
            onChange={setViewMode}
            ariaLabel="Tampilan kalender"
          />
        </div>
      </div>

      <div className="border-t-2 border-ink-900/10 bg-paper-paper/40 px-4 py-4">
        <CalendarDateNav
          cursorDate={cursorDate}
          viewMode={viewMode}
          onPrevious={onPrevious}
          onNext={onNext}
          onToday={onToday}
          onPickDate={onPickDate}
        />
      </div>
    </div>
  )
}
