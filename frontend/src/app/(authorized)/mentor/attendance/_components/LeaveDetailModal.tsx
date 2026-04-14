'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatIsoDateLabel } from './attendanceShared'

export function LeaveDetailModal({
  open,
  onOpenChange,
  studentName,
  isoDate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  isoDate: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted || !open) return null
  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentor-leave-detail-title"
      onClick={() => onOpenChange(false)}>
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="mentor-leave-detail-title" className="text-lg font-semibold tracking-tight text-slate-900">
              Detail izin
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">Sesi {formatIsoDateLabel(isoDate)}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-700">
          <p>
            <span className="font-medium text-slate-800">Siswa: </span>
            {studentName}
          </p>
          <p>
            <span className="font-medium text-slate-800">Keterangan: </span>
            Pengajuan izin mengikuti kebijakan kursus. Lampiran dapat berupa surat atau dokumen pendukung.
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" size="sm" className="shadow-none" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
