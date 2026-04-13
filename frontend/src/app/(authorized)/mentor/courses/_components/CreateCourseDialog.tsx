'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { IMentorCourse } from '@/lib/types'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { setSessionCourseMeta, upsertExtraCourse } from '@/lib/mentorCourseStorage'
import { notifyCourseDraft, notifyError } from '@/lib/notify'

type CreateCourseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [header, setHeader] = useState('')
  const [meetingCount, setMeetingCount] = useState(8)
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  const reset = useCallback(() => {
    setTitle('')
    setHeader('')
    setMeetingCount(8)
    setImageDataUrl(undefined)
    setSubmitting(false)
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    reset()
  }, [onOpenChange, reset])

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      notifyError("Pilih file gambar (JPG, PNG, WebP, …).")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setImageDataUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const t = title.trim()
      const h = header.trim()
      if (!t || !h) {
        notifyError("Judul dan header wajib diisi.")
        return
      }
      const agreed = await confirm({
        title: "Lanjut ke editor kursus?",
        description: "Kursus akan dibuat sebagai draf. Anda bisa mengisi modul setelahnya.",
        confirmLabel: "Lanjutkan",
      })
      if (!agreed) return
      const meetings = Math.max(1, Math.floor(meetingCount) || 1)
      setSubmitting(true)
      try {
        const uid = crypto.randomUUID()
        const row: IMentorCourse = {
          uid,
          title: t,
          header: h,
          description: h,
          image: imageDataUrl,
          published: false,
          moduleCount: 0,
          meetingCount: meetings,
          studentCount: 0,
          rating: 0,
          totalReviews: 0,
          updatedAt: 'Baru',
        }
        upsertExtraCourse(row)
        setSessionCourseMeta(uid, { title: t, header: h, image: imageDataUrl, published: false, meetingCount: meetings })
        notifyCourseDraft()
        onOpenChange(false)
        reset()
        router.push(`/mentor/courses/create/${uid}`)
      } finally {
        setSubmitting(false)
      }
    },
    [confirm, title, header, meetingCount, imageDataUrl, onOpenChange, reset, router]
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" aria-label="Tutup" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Kursus baru</h2>
            <p className="mt-1 text-sm text-slate-500">Isi judul, header, dan cover. Status awal belum dipublikasikan.</p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cover</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm font-medium text-slate-600 hover:border-primary/40 hover:bg-primary/5">
                <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
                {imageDataUrl ? 'Ganti gambar' : 'Unggah gambar'}
              </label>
              {imageDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageDataUrl} alt="Pratinjau cover" className="h-24 max-w-full rounded-lg border border-slate-200 object-cover" />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cc-title" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Judul
            </label>
            <input
              id="cc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: Full Stack Web Modern"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cc-header" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Header
            </label>
            <input
              id="cc-header"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              required
              placeholder="Subjudul singkat yang tampil di kartu"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cc-meetings" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Jumlah pertemuan
            </label>
            <input
              id="cc-meetings"
              type="number"
              min={1}
              value={meetingCount}
              onChange={(e) => setMeetingCount(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-slate-500">Digunakan untuk memetakan tugas per pertemuan (minimal 1).</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" className="rounded-xl" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Lanjut ke editor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
