import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { sanitizeInstructionAttachmentsForPayload } from '@/lib/course-edit/instruction-attachments'
import { createDefaultHomeworkRules } from '@/lib/course-edit/homework-rules'
import type { LessonAssignmentUpsertPayload } from '@/lib/course-edit/homework-rules'
import { Message } from '@/lib/Message'
import { parseLessonContent, toRichTextEnvelope } from '@/lib/rich-text'
import type { ICourseDetailLessonRef } from '@/lib/types/features/course-detail-assignments'
import type { LessonAssignmentStatus, LessonDetailAssignment } from '@/lib/types/lesson'

export type AssignmentFormDialogMode = 'create' | 'edit'

type AssignmentFormValues = {
  lessonUid: string
  title: string
  taskType: 'text' | 'quiz'
  description: string
  deadlineAt: string
  status: LessonAssignmentStatus
  allowFile: boolean
  allowPlainText: boolean
  allowRichText: boolean
  autoClose: boolean
  allowResubmit: boolean
  maxResubmitCount: string
}

type AssignmentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: AssignmentFormDialogMode
  lessonOptions: ICourseDetailLessonRef[]
  /** Lesson yang sudah memiliki tugas — hanya untuk mode create. */
  existingLessonUids?: ReadonlySet<string>
  editingLessonUid?: string | null
  editingAssignment?: LessonDetailAssignment | null
  loadingAssignment?: boolean
  submitting?: boolean
  onSubmit: (input: {
    lessonUid: string
    payload: LessonAssignmentUpsertPayload
  }) => Promise<void>
}

function toDatetimeLocalValue(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function htmlToPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function plainToHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`)
  return paragraphs.join('') || '<p></p>'
}

function emptyValues(lessonUid = ''): AssignmentFormValues {
  const rules = createDefaultHomeworkRules('text')
  return {
    lessonUid,
    title: '',
    taskType: 'text',
    description: '',
    deadlineAt: toDatetimeLocalValue(rules.deadlineAt),
    status: 'DRAFT',
    allowFile: rules.allowFileSubmission,
    allowPlainText: rules.allowPlainTextSubmission,
    allowRichText: rules.allowRichTextSubmission,
    autoClose: rules.autoCloseAfterDeadline,
    allowResubmit: rules.allowResubmit,
    maxResubmitCount: '',
  }
}

function valuesFromAssignment(
  assignment: LessonDetailAssignment,
  lessonUid: string,
): AssignmentFormValues {
  const descriptionHtml =
    assignment.task_description != null
      ? parseLessonContent(assignment.task_description).contentHtml
      : ''

  return {
    lessonUid,
    title: assignment.title,
    taskType: assignment.task_type,
    description: htmlToPlain(descriptionHtml),
    deadlineAt: toDatetimeLocalValue(assignment.deadline_at),
    status: assignment.status,
    allowFile: assignment.allow_file_submission,
    allowPlainText: assignment.allow_plain_text_submission,
    allowRichText: assignment.allow_rich_text_submission,
    autoClose: assignment.auto_close_after_deadline,
    allowResubmit: assignment.allow_resubmit,
    maxResubmitCount:
      assignment.allow_resubmit && assignment.max_resubmit_count != null
        ? String(assignment.max_resubmit_count)
        : '',
  }
}

function validate(
  values: AssignmentFormValues,
  mode: AssignmentFormDialogMode,
): string | null {
  if (mode === 'create' && !values.lessonUid) return 'Pilih lesson terlebih dahulu.'
  if (!values.title.trim()) return Message.assignment.titleRequired
  if (!values.deadlineAt) return Message.assignment.deadlineRequired
  if (Number.isNaN(new Date(values.deadlineAt).getTime())) {
    return Message.assignment.deadlineInvalid
  }

  if (values.taskType === 'text') {
    if (!values.description.trim()) return Message.assignment.textDescriptionRequired
    if (!values.allowFile && !values.allowPlainText && !values.allowRichText) {
      return Message.assignment.submitTypeRequired
    }
  }

  if (values.allowResubmit) {
    const max = Number(values.maxResubmitCount)
    if (!Number.isInteger(max) || max < 1) return Message.assignment.resubmitCountRequired
  }

  return null
}

export function AssignmentFormDialog({
  open,
  onOpenChange,
  mode,
  lessonOptions,
  existingLessonUids,
  editingLessonUid,
  editingAssignment,
  loadingAssignment = false,
  submitting = false,
  onSubmit,
}: AssignmentFormDialogProps) {
  const [values, setValues] = useState<AssignmentFormValues>(() => emptyValues())

  useEffect(() => {
    if (!open) return
    if (mode !== 'edit') {
      setValues(emptyValues())
      return
    }
    if (editingAssignment && editingLessonUid) {
      setValues(valuesFromAssignment(editingAssignment, editingLessonUid))
    } else {
      setValues(emptyValues(editingLessonUid ?? ''))
    }
  }, [open, mode, editingAssignment, editingLessonUid])

  const isEdit = mode === 'edit'

  const availableCreateOptions = useMemo(() => {
    if (!existingLessonUids) return lessonOptions
    return lessonOptions.filter((option) => !existingLessonUids.has(option.uid))
  }, [lessonOptions, existingLessonUids])

  const patch = useCallback((partial: Partial<AssignmentFormValues>) => {
    setValues((current) => ({ ...current, ...partial }))
  }, [setValues])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validate(values, mode)
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (values.taskType === 'quiz' && !isEdit) {
      toast.error(
        'Kuis dibuat melalui Editor Kurikulum. Form ini dipakai untuk tugas teks.',
      )
      return
    }

    const deadlineIso = new Date(values.deadlineAt).toISOString()

    const payload: LessonAssignmentUpsertPayload = {
      title: values.title.trim(),
      task_type: values.taskType,
      task_description:
        values.taskType === 'text' ? toRichTextEnvelope(plainToHtml(values.description)) : null,
      quiz: values.taskType === 'quiz' ? (editingAssignment?.quiz_payload ?? null) : null,
      allow_file_submission: values.taskType === 'quiz' ? false : values.allowFile,
      allow_plain_text_submission: values.taskType === 'quiz' ? false : values.allowPlainText,
      allow_rich_text_submission: values.taskType === 'quiz' ? false : values.allowRichText,
      require_file_description: false,
      instruction_attachments:
        values.taskType === 'quiz'
          ? sanitizeInstructionAttachmentsForPayload(
              editingAssignment?.instruction_attachments ?? [],
            )
          : [],
      deadline_at: deadlineIso,
      status: values.status,
      auto_close_after_deadline: values.autoClose,
      allow_resubmit: values.allowResubmit,
      max_resubmit_count: values.allowResubmit ? Number(values.maxResubmitCount) : null,
    }

    await onSubmit({ lessonUid: values.lessonUid || editingLessonUid || '', payload })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl border-line-light p-0">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="border-b border-line-light px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-ink-900">
              {isEdit ? 'Edit Tugas' : 'Buat Tugas'}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-ink-500">
              {isEdit
                ? 'Ubah pengaturan tugas pada lesson ini.'
                : 'Buat tugas teks untuk satu lesson. Kuis dibuat lewat Editor Kurikulum.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            {mode === 'create' ? (
              <div className="space-y-1.5">
                <Label htmlFor="assignment-lesson">Lesson</Label>
                <Select
                  value={values.lessonUid}
                  onValueChange={(value) => patch({ lessonUid: value })}
                  disabled={submitting}
                >
                  <SelectTrigger id="assignment-lesson" className="w-full">
                    <SelectValue placeholder="Pilih lesson..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCreateOptions.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        Semua lesson sudah memiliki tugas
                      </SelectItem>
                    ) : (
                      availableCreateOptions.map((option) => (
                        <SelectItem key={option.uid} value={option.uid}>
                          {option.moduleTitle} — {option.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-ink-500">
                  Hanya lesson yang belum memiliki tugas yang ditampilkan.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Lesson</Label>
                <p className="rounded-md border border-line-light bg-paper-offwhite px-3 py-2 text-sm text-ink-700">
                  {loadingAssignment
                    ? 'Memuat tugas...'
                    : lessonOptions.find((option) => option.uid === editingLessonUid)?.title ??
                      editingLessonUid ??
                      '—'}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="assignment-title">Judul tugas</Label>
              <Input
                id="assignment-title"
                value={values.title}
                onChange={(event) => patch({ title: event.target.value })}
                placeholder="Contoh: Tugas Praktik HTTP"
                maxLength={255}
                disabled={submitting || loadingAssignment}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Jenis tugas</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={values.taskType === 'text' ? 'default' : 'outline'}
                  disabled={submitting || isEdit}
                  onClick={() => patch({ taskType: 'text' })}
                >
                  Teks
                </Button>
                <Button
                  type="button"
                  variant={values.taskType === 'quiz' ? 'default' : 'outline'}
                  disabled={submitting || isEdit}
                  onClick={() => patch({ taskType: 'quiz' })}
                >
                  Kuis
                </Button>
              </div>
              <p className="text-xs text-ink-500">
                {isEdit
                  ? 'Jenis tugas tidak bisa diubah. Konten kuis diedit lewat Editor Kurikulum.'
                  : 'Saat ini form standalone membuat tugas teks.'}
              </p>
            </div>

            {values.taskType === 'text' ? (
              <div className="space-y-1.5">
                <Label htmlFor="assignment-description">Deskripsi / instruksi</Label>
                <Textarea
                  id="assignment-description"
                  value={values.description}
                  onChange={(event) => patch({ description: event.target.value })}
                  placeholder="Jelaskan apa yang harus dikerjakan siswa..."
                  rows={5}
                  disabled={submitting || loadingAssignment}
                />
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="assignment-deadline">Batas waktu</Label>
                <Input
                  id="assignment-deadline"
                  type="datetime-local"
                  value={values.deadlineAt}
                  onChange={(event) => patch({ deadlineAt: event.target.value })}
                  disabled={submitting || loadingAssignment}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={values.status}
                  onValueChange={(value) => patch({ status: value as LessonAssignmentStatus })}
                  disabled={submitting || loadingAssignment}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="TERBIT">Terbit</SelectItem>
                    <SelectItem value="DITUTUP">Ditutup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {values.taskType === 'text' ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-ink-900">Metode pengumpulan</p>
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <Checkbox
                    checked={values.allowPlainText}
                    onCheckedChange={(checked) => patch({ allowPlainText: checked === true })}
                    disabled={submitting || loadingAssignment}
                  />
                  Teks biasa
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <Checkbox
                    checked={values.allowRichText}
                    onCheckedChange={(checked) => patch({ allowRichText: checked === true })}
                    disabled={submitting || loadingAssignment}
                  />
                  Teks berformat
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <Checkbox
                    checked={values.allowFile}
                    onCheckedChange={(checked) => patch({ allowFile: checked === true })}
                    disabled={submitting || loadingAssignment}
                  />
                  Unggah file
                </label>
              </div>
            ) : null}

            <div className="space-y-3 border-t border-line-light pt-4">
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <Checkbox
                  checked={values.autoClose}
                  onCheckedChange={(checked) => patch({ autoClose: checked === true })}
                  disabled={submitting || loadingAssignment}
                />
                Tutup otomatis melewati batas waktu
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <Checkbox
                  checked={values.allowResubmit}
                  onCheckedChange={(checked) => {
                    const next = checked === true
                    patch({
                      allowResubmit: next,
                      maxResubmitCount:
                        next && !values.maxResubmitCount ? '1' : values.maxResubmitCount,
                    })
                  }}
                  disabled={submitting || loadingAssignment}
                />
                Izinkan pengumpulan ulang
              </label>
              {values.allowResubmit ? (
                <div className="space-y-1.5 pl-6">
                  <Label htmlFor="assignment-max-resubmit">
                    Jumlah pengumpulan ulang (min. 1)
                  </Label>
                  <Input
                    id="assignment-max-resubmit"
                    type="number"
                    min={1}
                    max={99}
                    value={values.maxResubmitCount}
                    onChange={(event) => patch({ maxResubmitCount: event.target.value })}
                    disabled={submitting || loadingAssignment}
                    className="max-w-28"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="border-t border-line-light px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting || loadingAssignment}
            >
              Batal
            </Button>
            <Button type="submit" className="px-5" disabled={submitting || loadingAssignment}>
              {submitting || loadingAssignment ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Menyimpan...
                </>
              ) : isEdit ? (
                'Simpan Perubahan'
              ) : (
                'Buat Tugas'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


