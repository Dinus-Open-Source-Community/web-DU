'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AssignmentAttachmentUpload,
  MAX_FILES,
  type AssignmentAttachmentItem,
} from '@/components/assignments/AssignmentAttachmentUpload'
import { DeadlineUrgencyBadges } from '@/components/assignments/DeadlineUrgencyBadges'
import { SubmissionContentView } from '@/components/assignments/SubmissionContentView'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { CARD_PANEL_CLASS } from '@/components/ui/card'
import { TiptapRichTextEditor } from '@/components/rich-text/TiptapRichTextEditor'
import { cn } from '@/lib/utils'
import { getDeadlineUrgency } from '@/lib/mentorAssignmentsData'
import {
  formatAssignmentDeadlineRelative,
  getAssignmentSubmitState,
  listStudentAssignmentFeed,
  submitStudentAssignment,
  STUDENT_DEMO_AVATAR,
  STUDENT_DEMO_NAME,
  STUDENT_DEMO_UID,
} from '@/lib/studentAssignmentsData'
import type { SubmissionContentBlock } from '@/lib/types'

type Props = { assignmentUid: string }

function buildSubmissionBlocks(html: string, attachments: AssignmentAttachmentItem[]): SubmissionContentBlock[] {
  const blocks: SubmissionContentBlock[] = []
  const stripped = html.replace(/<[^>]+>/g, '').trim()
  if (stripped) blocks.push({ type: 'html', html })
  for (const att of attachments) {
    if (att.mime.startsWith('image/')) {
      blocks.push({ type: 'image', url: att.dataUrl, alt: att.fileName })
    } else {
      blocks.push({ type: 'file', fileName: att.fileName, url: att.dataUrl, mime: att.mime })
    }
  }
  return blocks
}

const panel = cn(CARD_PANEL_CLASS, 'p-5 sm:p-6')

export function StudentAssignmentDetailClient({ assignmentUid }: Props) {
  const router = useRouter()
  const [now, setNow] = useState(() => new Date())
  const [answerHtml, setAnswerHtml] = useState('<p></p>')
  const [editorKey, setEditorKey] = useState(0)
  const [attachments, setAttachments] = useState<AssignmentAttachmentItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    setNow(new Date())
  }, [])

  useEffect(() => {
    window.addEventListener('focus', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('focus', load)
      window.removeEventListener('storage', load)
    }
  }, [load])

  const row = useMemo(() => {
    return listStudentAssignmentFeed(STUDENT_DEMO_UID, now).find((r) => r.assignment.uid === assignmentUid) ?? null
  }, [assignmentUid, now])

  const a = row?.assignment
  const courseTitle = row?.courseTitle ?? ''

  const submitState = useMemo(() => {
    if (!assignmentUid) return { allowed: false as const, message: '' }
    return getAssignmentSubmitState(STUDENT_DEMO_UID, assignmentUid, now)
  }, [assignmentUid, now])

  const handleAddAttachment = useCallback((item: AssignmentAttachmentItem) => {
    setAttachments((prev) => {
      if (prev.length >= MAX_FILES) {
        toast.error(`Maksimal ${MAX_FILES} berkas.`)
        return prev
      }
      return [...prev, item]
    })
  }, [])

  const handleSubmit = () => {
    if (!a) return
    const stripped = answerHtml.replace(/<[^>]+>/g, '').trim()
    if (!stripped && attachments.length === 0) {
      toast.error('Isi jawaban atau lampirkan minimal satu berkas.')
      return
    }
    const contentBlocks = buildSubmissionBlocks(answerHtml, attachments)
    if (contentBlocks.length === 0) {
      toast.error('Isi jawaban atau lampirkan minimal satu berkas.')
      return
    }
    setSubmitting(true)
    try {
      const result = submitStudentAssignment({
        assignmentUid: a.uid,
        studentUid: STUDENT_DEMO_UID,
        studentName: STUDENT_DEMO_NAME,
        studentAvatar: STUDENT_DEMO_AVATAR,
        contentBlocks,
      })
      if (result.ok) {
        toast.success('Tugas terkirim. Menunggu review mentor.')
        setAnswerHtml('<p></p>')
        setAttachments([])
        setEditorKey((k) => k + 1)
        load()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!row || !a) {
    return (
      <p className="px-5 py-10 text-center text-sm text-slate-500 md:px-8">
        Memuat data tugas… Jika ini berlanjut, kembali ke daftar tugas.
      </p>
    )
  }

  const latest = row.latestSubmission
  const deadlineUrgency = getDeadlineUrgency(a, now)
  const deadlineRelative = formatAssignmentDeadlineRelative(a.deadlineAt, now, deadlineUrgency)
  const deadlineAbsolute = format(new Date(a.deadlineAt), 'd MMM yyyy · HH:mm', { locale: id })

  return (
    <main className="w-full px-5 py-6 md:px-8 md:py-8">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="mb-6 h-9 rounded-lg border-slate-200 text-sm font-medium text-slate-600 shadow-none hover:bg-slate-50">
        <Link href="/student/assignments" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar tugas
        </Link>
      </Button>

      <div className="flex max-w-none flex-col gap-5 md:gap-6">
        <div>
          <PageHeader title={a.title} subtitle={courseTitle} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tenggat</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{deadlineRelative}</p>
              <p className="mt-0.5 text-xs tabular-nums text-slate-500">{deadlineAbsolute}</p>
            </div>
            <DeadlineUrgencyBadges urgency={deadlineUrgency} />
          </div>
        </div>

        <section className={panel}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Instruksi</p>
          <div
            className="tiptap-editor-root tiptap-preview mt-3 text-[15px] leading-relaxed text-slate-800"
            dangerouslySetInnerHTML={{ __html: a.description || '<p class="text-slate-500">Tidak ada deskripsi.</p>' }}
          />
          {a.instructionAttachments && a.instructionAttachments.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {a.instructionAttachments.map((f, i) => (
                <li key={`${f.fileName}-${i}`}>
                  <a
                    href={f.url}
                    download={f.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary underline-offset-2 hover:underline">
                    Lampiran: {f.fileName}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {latest && (
          <section className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Kiriman terakhir (percobaan {latest.attemptNumber})
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {format(new Date(latest.submittedAt), 'd MMM yyyy · HH:mm', { locale: id })}
            </p>
            <div className="mt-4">
              <SubmissionContentView blocks={latest.contentBlocks} />
            </div>
            {latest.reviewStatus === 'graded' && latest.rating != null && (
              <p className="mt-4 text-sm font-medium text-slate-800">Nilai: {latest.rating}</p>
            )}
            {(latest.reviewStatus === 'graded' || latest.reviewStatus === 'returned') && latest.mentorComment && (
              <div className="mt-3 rounded-lg border border-slate-200/90 bg-white p-3 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Komentar mentor: </span>
                {latest.mentorComment}
              </div>
            )}
          </section>
        )}

        {submitState.allowed ? (
          <>
            <section className={panel}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Jawaban Anda</p>
              <div className="mt-3">
                <TiptapRichTextEditor
                  key={editorKey}
                  initialContent={answerHtml}
                  onChange={setAnswerHtml}
                  placeholder="Tulis jawaban di sini. Anda dapat menyisipkan gambar atau tautan dari toolbar."
                  variant="compact"
                />
              </div>
            </section>

            <section className={panel}>
              <AssignmentAttachmentUpload
                items={attachments}
                onAdd={handleAddAttachment}
                onRemove={(id) => setAttachments((prev) => prev.filter((x) => x.id !== id))}
                disabled={submitting}
              />
            </section>

            <div className="flex justify-end">
              <Button type="button" onClick={handleSubmit} disabled={submitting} className="min-w-[140px] shadow-none">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Mengirim…
                  </>
                ) : (
                  'Kirim tugas'
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 px-4 py-3.5 text-sm leading-relaxed text-amber-950">
            {submitState.message}
          </div>
        )}
      </div>
    </main>
  )
}
