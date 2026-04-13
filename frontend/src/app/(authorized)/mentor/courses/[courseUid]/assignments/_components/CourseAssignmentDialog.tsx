'use client'

import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { IMentorCourse, IMentorCourseAssignment, MentorAssignmentLifecycleStatus } from '@/lib/types'
import { getCourseMeetingCount } from '@/lib/mentorCourseStorage'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { createMentorAssignment, type MentorAssignmentInput, updateMentorAssignment } from '@/lib/mentorAssignmentsData'
import { notifyCreated, notifyError, notifyUpdated } from '@/lib/notify'

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function datetimeLocalToIso(value: string): string | null {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

type CourseAssignmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: IMentorCourse
  courseUid: string
  mode: 'create' | 'edit'
  editing: IMentorCourseAssignment | null
  onSaved: () => void
}

const defaultInput = (): MentorAssignmentInput => ({
  meetingNumber: 1,
  title: '',
  description: '',
  deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'draft' as MentorAssignmentLifecycleStatus,
  autoCloseAfterDeadline: true,
  allowResubmit: true,
  maxAttempts: undefined,
})

export function CourseAssignmentDialog({
  open,
  onOpenChange,
  course,
  courseUid,
  mode,
  editing,
  onSaved,
}: CourseAssignmentDialogProps) {
  const confirm = useConfirm()
  const maxMeetings = getCourseMeetingCount(course)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meetingNumber, setMeetingNumber] = useState(1)
  const [deadlineLocal, setDeadlineLocal] = useState('')
  const [status, setStatus] = useState<MentorAssignmentLifecycleStatus>('draft')
  const [autoCloseAfterDeadline, setAutoCloseAfterDeadline] = useState(true)
  const [allowResubmit, setAllowResubmit] = useState(true)
  const [maxAttempts, setMaxAttempts] = useState<string>('')
  const resetCreate = useCallback(() => {
    const d = defaultInput()
    setTitle(d.title)
    setDescription(d.description)
    setMeetingNumber(1)
    setDeadlineLocal(isoToDatetimeLocalValue(d.deadlineAt))
    setStatus(d.status)
    setAutoCloseAfterDeadline(d.autoCloseAfterDeadline)
    setAllowResubmit(d.allowResubmit)
    setMaxAttempts('')
  }, [maxMeetings])

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && editing) {
      setTitle(editing.title)
      setDescription(editing.description)
      setMeetingNumber(Math.min(Math.max(1, editing.meetingNumber), maxMeetings))
      setDeadlineLocal(isoToDatetimeLocalValue(editing.deadlineAt))
      setStatus(editing.status)
      setAutoCloseAfterDeadline(editing.autoCloseAfterDeadline)
      setAllowResubmit(editing.allowResubmit)
      setMaxAttempts(editing.maxAttempts != null ? String(editing.maxAttempts) : '')
    } else {
      resetCreate()
    }
  }, [open, mode, editing, maxMeetings, resetCreate])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const t = title.trim()
      if (!t) {
        notifyError("Judul wajib diisi.")
        return
      }
      const iso = datetimeLocalToIso(deadlineLocal)
      if (!iso) {
        notifyError("Tenggat wajib diisi dengan valid.")
        return
      }
      const agreed = await confirm({
        title: mode === "create" ? "Buat tugas ini?" : "Simpan perubahan tugas?",
        description:
          mode === "create"
            ? "Tugas baru akan ditambahkan ke kursus ini."
            : "Perubahan akan diterapkan pada tugas yang sedang diedit.",
        confirmLabel: mode === "create" ? "Buat" : "Simpan",
      })
      if (!agreed) return

      const mn = Math.min(Math.max(1, meetingNumber), maxMeetings)
      let maxA: number | undefined
      if (maxAttempts.trim()) {
        const n = parseInt(maxAttempts, 10)
        if (!Number.isNaN(n) && n >= 1) maxA = n
      }
      const input: MentorAssignmentInput = {
        meetingNumber: mn,
        title: t,
        description: description.trim(),
        deadlineAt: iso,
        status,
        autoCloseAfterDeadline,
        allowResubmit,
        maxAttempts: allowResubmit ? maxA : undefined,
      }

      if (mode === "create") {
        createMentorAssignment(courseUid, input)
        notifyCreated("Tugas dibuat.")
      } else if (editing) {
        const updated = updateMentorAssignment(editing.uid, input)
        if (!updated) {
          notifyError("Tidak dapat memperbarui tugas ini.")
          return
        }
        notifyUpdated("Tugas diperbarui.")
      } else {
        return
      }
      onSaved()
      handleClose()
    },
    [
      confirm,
      title,
      description,
      deadlineLocal,
      meetingNumber,
      maxMeetings,
      status,
      autoCloseAfterDeadline,
      allowResubmit,
      maxAttempts,
      mode,
      editing,
      courseUid,
      onSaved,
      handleClose,
    ]
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" aria-label="Tutup" onClick={handleClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{mode === 'create' ? 'Tugas baru' : 'Edit tugas'}</h2>
            <p className="mt-1 text-sm text-slate-500">{course.title}</p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="asg-meeting" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pertemuan
            </label>
            <select
              id="asg-meeting"
              value={meetingNumber}
              onChange={(e) => setMeetingNumber(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              {Array.from({ length: maxMeetings }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Pertemuan {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="asg-title" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Judul
            </label>
            <input
              id="asg-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="asg-desc" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Deskripsi
            </label>
            <textarea
              id="asg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="asg-deadline" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tenggat (wajib)
            </label>
            <input
              id="asg-deadline"
              type="datetime-local"
              value={deadlineLocal}
              onChange={(e) => setDeadlineLocal(e.target.value)}
              required
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="asg-status" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              id="asg-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MentorAssignmentLifecycleStatus)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
              <option value="closed">Ditutup</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={autoCloseAfterDeadline}
              onChange={(e) => setAutoCloseAfterDeadline(e.target.checked)}
            />
            Tutup otomatis setelah tenggat
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={allowResubmit} onChange={(e) => setAllowResubmit(e.target.checked)} />
            Izinkan resubmit
          </label>

          {allowResubmit && (
            <div className="flex flex-col gap-2">
              <label htmlFor="asg-max" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Maks. attempt (opsional)
              </label>
              <input
                id="asg-max"
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                placeholder="Kosong = tidak dibatasi"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" className="rounded-xl shadow-none" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" className="rounded-xl">
              {mode === 'create' ? 'Simpan' : 'Perbarui'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
