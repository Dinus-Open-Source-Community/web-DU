'use client'

import { useCallback, useEffect, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { IMentorCourse, IMentorCourseAssignment, MentorAssignmentLifecycleStatus, MentorAssignmentTaskType, IQuiz } from '@/lib/types'
import { getCourseMeetingCount } from '@/lib/mentorCourseStorage'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { createMentorAssignment, type MentorAssignmentInput, updateMentorAssignment } from '@/lib/mentorAssignmentsData'
import { notifyCreated, notifyError, notifyUpdated } from '@/lib/notify'
import { TiptapRichTextEditor } from '@/components/rich-text/TiptapRichTextEditor'
import { toPreviewHtmlFragment } from '@/lib/htmlEscape'
import { LessonQuizEditor } from '../../edit/_components/LessonQuizEditor'
import { Checkbox } from '@/components/ui/checkbox'

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
  variant?: 'modal' | 'inline'
  course: IMentorCourse
  courseUid: string
  mode: 'create' | 'edit'
  editing: IMentorCourseAssignment | null
  onSaved: () => void
  defaultMeetingNumber?: number
  defaultTitle?: string
  defaultTaskType?: MentorAssignmentTaskType
  defaultTaskDescription?: string
  defaultTaskQuiz?: IQuiz
}

type Attachment = { fileName: string; url: string; mime?: string }

const defaultInput = (): MentorAssignmentInput => ({
  meetingNumber: 1,
  title: '',
  taskType: 'text',
  description: '<p></p>',
  quiz: undefined,
  deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'draft' as MentorAssignmentLifecycleStatus,
  autoCloseAfterDeadline: true,
  allowResubmit: true,
  maxAttempts: undefined,
  submissionConfig: {
    allowFile: true,
    allowPlainText: false,
    allowRichText: true,
    requireFileDescription: false,
  },
  instructionAttachments: [],
})

function normalizeDescriptionForEditor(raw: string): string {
  const t = raw.trim()
  if (!t) return '<p></p>'
  if (t.startsWith('<')) return raw
  return toPreviewHtmlFragment(raw)
}

export function CourseAssignmentDialog({
  open,
  onOpenChange,
  variant = 'modal',
  course,
  courseUid,
  mode,
  editing,
  onSaved,
  defaultMeetingNumber,
  defaultTitle,
  defaultTaskType,
  defaultTaskDescription,
  defaultTaskQuiz,
}: CourseAssignmentDialogProps) {
  const confirm = useConfirm()
  const maxMeetings = getCourseMeetingCount(course)
  const [title, setTitle] = useState('')
  const [taskType, setTaskType] = useState<MentorAssignmentTaskType>('text')
  const [description, setDescription] = useState('<p></p>')
  const [quiz, setQuiz] = useState<IQuiz>({ questions: [], passingScore: 70 })
  const [instructionAttachments, setInstructionAttachments] = useState<Attachment[]>([])
  const [meetingNumber, setMeetingNumber] = useState(1)
  const [deadlineLocal, setDeadlineLocal] = useState('')
  const [status, setStatus] = useState<MentorAssignmentLifecycleStatus>('draft')
  const [autoCloseAfterDeadline, setAutoCloseAfterDeadline] = useState(true)
  const [allowResubmit, setAllowResubmit] = useState(true)
  const [maxAttempts, setMaxAttempts] = useState<string>('')
  const [allowFileSubmit, setAllowFileSubmit] = useState(true)
  const [allowPlainTextSubmit, setAllowPlainTextSubmit] = useState(false)
  const [allowRichTextSubmit, setAllowRichTextSubmit] = useState(true)
  const [requireFileDescription, setRequireFileDescription] = useState(false)
  const [editorResetKey, setEditorResetKey] = useState(0)

  const resetCreate = useCallback(() => {
    const d = defaultInput()
    const normalizedMeeting = Math.min(Math.max(1, defaultMeetingNumber ?? d.meetingNumber), maxMeetings)
    setTitle(defaultTitle ?? d.title)
    setTaskType(defaultTaskType ?? d.taskType ?? 'text')
    setDescription(defaultTaskDescription ? normalizeDescriptionForEditor(defaultTaskDescription) : (d.description ?? '<p></p>'))
    setQuiz(defaultTaskQuiz ?? d.quiz ?? { questions: [], passingScore: 70 })
    setInstructionAttachments(d.instructionAttachments ?? [])
    setMeetingNumber(normalizedMeeting)
    setDeadlineLocal(isoToDatetimeLocalValue(d.deadlineAt))
    setStatus(d.status)
    setAutoCloseAfterDeadline(d.autoCloseAfterDeadline)
    setAllowResubmit(d.allowResubmit)
    setMaxAttempts('')
    setAllowFileSubmit(d.submissionConfig?.allowFile ?? true)
    setAllowPlainTextSubmit(d.submissionConfig?.allowPlainText ?? false)
    setAllowRichTextSubmit(d.submissionConfig?.allowRichText ?? true)
    setRequireFileDescription(d.submissionConfig?.requireFileDescription ?? false)
    setEditorResetKey((k) => k + 1)
  }, [defaultMeetingNumber, defaultTaskDescription, defaultTaskQuiz, defaultTaskType, defaultTitle, maxMeetings])

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && editing) {
      setTitle(editing.title)
      setTaskType(editing.taskType ?? 'text')
      setDescription(normalizeDescriptionForEditor(editing.description))
      setQuiz(editing.quiz ?? { questions: [], passingScore: 70 })
      setInstructionAttachments(editing.instructionAttachments ? [...editing.instructionAttachments] : [])
      setMeetingNumber(Math.min(Math.max(1, editing.meetingNumber), maxMeetings))
      setDeadlineLocal(isoToDatetimeLocalValue(editing.deadlineAt))
      setStatus(editing.status)
      setAutoCloseAfterDeadline(editing.autoCloseAfterDeadline)
      setAllowResubmit(editing.allowResubmit)
      setMaxAttempts(editing.maxAttempts != null ? String(editing.maxAttempts) : '')
      setAllowFileSubmit(editing.submissionConfig?.allowFile ?? true)
      setAllowPlainTextSubmit(editing.submissionConfig?.allowPlainText ?? false)
      setAllowRichTextSubmit(editing.submissionConfig?.allowRichText ?? true)
      setRequireFileDescription(editing.submissionConfig?.requireFileDescription ?? false)
      setEditorResetKey((k) => k + 1)
    } else {
      resetCreate()
    }
  }, [open, mode, editing, maxMeetings, resetCreate])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const onPickInstructionFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : ''
        if (!url) return
        setInstructionAttachments((prev) => [...prev, { fileName: file.name, url, mime: file.type || undefined }])
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setInstructionAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const t = title.trim()
      if (!t) {
        notifyError('Judul wajib diisi.')
        return
      }
      const iso = datetimeLocalToIso(deadlineLocal)
      if (!iso) {
        notifyError('Tenggat wajib diisi dengan valid.')
        return
      }
      const agreed = await confirm({
        title: mode === 'create' ? 'Buat tugas ini?' : 'Simpan perubahan tugas?',
        description: mode === 'create' ? 'Tugas baru akan ditambahkan ke kursus ini.' : 'Perubahan akan diterapkan pada tugas yang sedang diedit.',
        confirmLabel: mode === 'create' ? 'Buat' : 'Simpan',
      })
      if (!agreed) return

      const mn = Math.min(Math.max(1, meetingNumber), maxMeetings)
      if (!allowFileSubmit && !allowPlainTextSubmit && !allowRichTextSubmit) {
        notifyError('Aktifkan minimal satu tipe submit untuk student.')
        return
      }
      let maxA: number | undefined
      if (maxAttempts.trim()) {
        const n = parseInt(maxAttempts, 10)
        if (!Number.isNaN(n) && n >= 1) maxA = n
      }
      const input: MentorAssignmentInput = {
        meetingNumber: mn,
        title: t,
        taskType,
        description: (taskType === 'text' ? description : '<p></p>').trim() || '<p></p>',
        quiz: taskType === 'quiz' ? quiz : undefined,
        deadlineAt: iso,
        status,
        autoCloseAfterDeadline,
        allowResubmit,
        maxAttempts: allowResubmit ? maxA : undefined,
        submissionConfig: {
          allowFile: allowFileSubmit,
          allowPlainText: allowPlainTextSubmit,
          allowRichText: allowRichTextSubmit,
          requireFileDescription,
        },
        instructionAttachments: instructionAttachments.length ? instructionAttachments : undefined,
      }

      if (mode === 'create') {
        createMentorAssignment(courseUid, input)
        notifyCreated('Tugas dibuat.')
      } else if (editing) {
        const updated = updateMentorAssignment(editing.uid, input)
        if (!updated) {
          notifyError('Tidak dapat memperbarui tugas ini.')
          return
        }
        notifyUpdated('Tugas diperbarui.')
      } else {
        return
      }
      onSaved()

      if (variant === 'inline' && mode === 'create') {
        resetCreate()
        return
      }

      handleClose()
    },
    [
      confirm,
      title,
      taskType,
      description,
      quiz,
      instructionAttachments,
      deadlineLocal,
      meetingNumber,
      maxMeetings,
      status,
      autoCloseAfterDeadline,
      allowResubmit,
      maxAttempts,
      allowFileSubmit,
      allowPlainTextSubmit,
      allowRichTextSubmit,
      requireFileDescription,
      mode,
      editing,
      courseUid,
      onSaved,
      variant,
      resetCreate,
      handleClose,
    ],
  )

  if (!open) return null

  return (
    <div className={variant === 'modal' ? 'fixed inset-0 z-55 flex items-center justify-center p-4' : 'w-full'}>
      {variant === 'modal' && <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" aria-label="Tutup" onClick={handleClose} />}
      <div
        className={
          variant === 'modal'
            ? 'relative z-10 max-h-[92vh] w-full max-w-[min(96rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6'
            : 'w-full rounded-xl border border-slate-200 bg-white p-4 md:p-5'
        }>
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{variant === 'inline' ? 'Konfigurasi tugas lesson' : mode === 'create' ? 'Tugas baru' : 'Edit tugas'}</h2>
            <p className="mt-1 text-sm text-slate-500">{course.title}</p>
          </div>
          {variant === 'modal' && (
            <button type="button" onClick={handleClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {variant === 'modal' && (
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
          )}

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
            <label htmlFor="asg-task-type" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipe tugas
            </label>
            <select
              id="asg-task-type"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as MentorAssignmentTaskType)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option value="text">Text (WYSIWYG)</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          {taskType === 'text' ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deskripsi</span>
              <TiptapRichTextEditor
                key={editorResetKey}
                variant="compact"
                initialContent={description}
                onChange={setDescription}
                placeholder="Instruksi tugas untuk peserta: format teks, tautan, atau sisipkan media."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Form quiz</span>
              <LessonQuizEditor quiz={quiz} onChange={setQuiz} />
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opsi submit student</p>
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <Checkbox checked={allowFileSubmit} onCheckedChange={(checked) => setAllowFileSubmit(checked === true)} />
                File
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <Checkbox checked={allowPlainTextSubmit} onCheckedChange={(checked) => setAllowPlainTextSubmit(checked === true)} />
                Text biasa
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <Checkbox checked={allowRichTextSubmit} onCheckedChange={(checked) => setAllowRichTextSubmit(checked === true)} />
                Text editor (WYSIWYG)
              </label>
              {allowFileSubmit && (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <Checkbox checked={requireFileDescription} onCheckedChange={(checked) => setRequireFileDescription(checked === true)} />
                  Wajib isi deskripsi file saat upload
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lampiran instruksi (opsional)</span>
            <p className="text-xs text-slate-500">File terpisah dari deskripsi — berguna untuk PDF, ZIP, atau contoh kode.</p>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary">
              <Paperclip className="h-4 w-4" aria-hidden />
              <span>Pilih file</span>
              <input type="file" className="sr-only" multiple onChange={onPickInstructionFiles} />
            </label>
            {instructionAttachments.length > 0 && (
              <ul className="mt-1 space-y-1.5">
                {instructionAttachments.map((f, i) => (
                  <li key={`${f.fileName}-${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700">
                    <span className="truncate">{f.fileName}</span>
                    <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 px-2 shadow-none" onClick={() => removeAttachment(i)}>
                      Hapus
                    </Button>
                  </li>
                ))}
              </ul>
            )}
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
            <input type="checkbox" checked={autoCloseAfterDeadline} onChange={(e) => setAutoCloseAfterDeadline(e.target.checked)} />
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
            {variant === 'modal' && (
              <Button type="button" variant="outline" className="rounded-xl shadow-none" onClick={handleClose}>
                Batal
              </Button>
            )}
            <Button type="submit" className="rounded-xl shadow-none">
              {mode === 'create' ? 'Simpan' : 'Perbarui'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
