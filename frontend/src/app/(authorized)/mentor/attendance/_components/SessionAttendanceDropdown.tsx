'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { MentorSessionAttendanceStatus } from '@/lib/types'
import { SessionStatusIcon } from './AttendanceSessionIcons'
import { sessionLabel } from './attendanceShared'

export function SessionAttendanceDropdown({
  value,
  onChange,
  fullWidth,
}: {
  value: MentorSessionAttendanceStatus
  onChange: (v: MentorSessionAttendanceStatus) => void
  fullWidth?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('h-8 gap-1.5 border-slate-200 px-2 shadow-none', fullWidth && 'w-full justify-between')}
          title="Absensi sesi"
          aria-label="Pilih status absensi sesi">
          {fullWidth ? (
            <>
              <span className="inline-flex min-w-0 items-center gap-2">
                <SessionStatusIcon status={value} />
                <span className="truncate text-xs font-medium text-slate-700">{sessionLabel(value)}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            </>
          ) : (
            <>
              <SessionStatusIcon status={value} />
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        {(['belum', 'hadir', 'izin', 'alpha'] as const).map((v) => (
          <DropdownMenuItem key={v} className="gap-2 text-sm" onClick={() => onChange(v)}>
            <SessionStatusIcon status={v} />
            {sessionLabel(v)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
