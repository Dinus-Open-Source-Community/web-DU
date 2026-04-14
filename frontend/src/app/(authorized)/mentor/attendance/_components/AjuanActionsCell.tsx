'use client'

import { Check, Clock, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MentorAttendanceApprovalMode } from '@/lib/types'

type AjuanActionsCellProps = {
  approvalMode: MentorAttendanceApprovalMode
  pending: 'hadir' | 'izin' | null
  onApprove: () => void
  onReject: () => void
  /** `table` = icon-only compact; `card` = outlined larger buttons */
  layout: 'table' | 'card'
}

export function AjuanActionsCell({
  approvalMode,
  pending,
  onApprove,
  onReject,
  layout,
}: AjuanActionsCellProps) {
  const isTable = layout === 'table'

  return (
    <div className={cn(isTable ? 'flex flex-col items-start gap-2' : 'space-y-2')}>
      {pending ? (
        <Badge variant="attendanceAjuanPending" className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {pending === 'hadir' ? 'Hadir' : 'Izin'}
        </Badge>
      ) : isTable ? (
        <span className="text-xs text-slate-400">—</span>
      ) : (
        <p className="text-xs text-slate-400">—</p>
      )}

      {approvalMode === 'review' && pending ? (
        <div className={isTable ? 'flex items-center gap-1' : 'mt-2 flex items-center gap-2'}>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={
              isTable
                ? 'h-8 w-8 border-emerald-200 text-emerald-700 shadow-none hover:bg-emerald-50'
                : 'h-9 w-9 border-emerald-200 text-emerald-700 shadow-none hover:bg-emerald-50'
            }
            title="Terima ajuan"
            aria-label="Terima ajuan"
            onClick={onApprove}>
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={isTable ? 'h-8 w-8 text-rose-600 hover:bg-rose-50' : 'h-9 w-9 text-rose-600 hover:bg-rose-50'}
            title="Tolak ajuan"
            aria-label="Tolak ajuan"
            onClick={onReject}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
