'use client'

import { useState } from 'react'
import { IScheduleItem } from '@/lib/types'
import { List, Grid3x3 } from 'lucide-react'
import ScheduleList from './ScheduleList'
import ScheduleGrid from './ScheduleGrid'
import { cn } from '@/lib/utils'

interface ScheduleSectionProps {
  schedules: IScheduleItem[]
}

export default function ScheduleSection({ schedules }: ScheduleSectionProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  return (
    <div>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
          <span className="text-primary">📅</span>
          Class Schedule
        </h2>

        {/* View Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={cn('p-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-white shadow-xs text-primary' : 'text-slate-500 hover:text-slate-700')}
            title="List view">
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn('p-2 rounded-md transition-colors', viewMode === 'grid' ? 'bg-white shadow-xs text-primary' : 'text-slate-500 hover:text-slate-700')}
            title="Grid view">
            <Grid3x3 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? <ScheduleList items={schedules} /> : <ScheduleGrid items={schedules} />}
    </div>
  )
}
