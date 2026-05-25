'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import type { CourseLevel } from '@/lib/types'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { toast } from 'sonner'
import Image from 'next/image'
import { useCourseCategoriesQuery } from '@/hooks/api/use-category-queries'
import { useCourseTypesQuery } from '@/hooks/api/use-course-type-queries'
import { useCreateCourse } from '@/hooks/api/use-course-queries'

type CreateCourseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleBasePath?: '/mentor' | '/admin'
}

const LEVELS: CourseLevel[] = ['Pemula', 'Menengah', 'Lanjutan']
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary'
const labelClass = 'text-xs font-semibold uppercase tracking-wide text-slate-500'

function formatRupiahDisplay(value: number): string {
  if (value === 0) return 'Rp 0'
  return 'Rp ' + value.toLocaleString('id-ID')
}

function parseRupiahInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

function RupiahInput({ id, value, onChange, disabled, placeholder }: { id: string; value: number | ''; onChange: (v: number | '') => void; disabled?: boolean; placeholder?: string }) {
  const [focused, setFocused] = useState(false)
  const [rawText, setRawText] = useState(() => (typeof value === 'number' && value > 0 ? value.toString() : ''))

  const displayValue = (() => {
    if (disabled) return ''
    if (focused) return rawText
    if (value === '' || value === 0) return ''
    return formatRupiahDisplay(value)
  })()

  return (
    <div className="relative">
      {!focused && !disabled && value !== '' && value > 0 && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => {
          const parsed = parseRupiahInput(e.target.value)
          setRawText(parsed > 0 ? parsed.toString() : '')
          onChange(parsed > 0 ? parsed : '')
        }}
        onFocus={() => {
          setFocused(true)
          setRawText(typeof value === 'number' && value > 0 ? value.toString() : '')
        }}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder={placeholder}
        className={`${inputClass} ${disabled ? 'bg-slate-50 text-slate-400' : ''}`}
      />
    </div>
  )
}

function DynamicListField({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...items, v])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-1.5 text-sm text-slate-700">
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="shrink-0 rounded p-0.5 text-slate-400 hover:text-red-500">
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className={inputClass}
        />
        <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-xl border-slate-300 px-3 text-xs" onClick={add}>
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function CreateCourseDialog({ open, onOpenChange, roleBasePath = '/mentor' }: CreateCourseDialogProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const createCourse = useCreateCourse()
  const { data: categoryResponse, isLoading: categoryLoading } = useCourseCategoriesQuery()
  const { data: courseTypeResponse, isLoading: courseTypeLoading } = useCourseTypesQuery()

  const [title, setTitle] = useState('')
  const [header, setHeader] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>(undefined)
  const [categoryUid, setCategoryUid] = useState('')
  const [courseTypeUid, setCourseTypeUid] = useState('')
  const [level, setLevel] = useState<CourseLevel>('Pemula')

  const [price, setPrice] = useState<number | ''>('')
  const [strikePrice, setStrikePrice] = useState<number | ''>('')

  const [whatYouLearn, setWhatYouLearn] = useState<string[]>([])

  const [submitting, setSubmitting] = useState(false)

  const categories = useMemo(() => categoryResponse?.course_categories ?? [], [categoryResponse])
  const courseTypes = useMemo(() => courseTypeResponse?.course_types ?? [], [courseTypeResponse])

  const activeCategories = useMemo(() => categories.filter((item) => item.is_active), [categories])
  const activeCourseTypes = useMemo(() => courseTypes.filter((item) => item.is_active), [courseTypes])

  useEffect(() => {
    if (!categoryUid && activeCategories.length > 0) {
      setCategoryUid(activeCategories[0].uid)
    }
  }, [activeCategories, categoryUid])

  useEffect(() => {
    if (!courseTypeUid && activeCourseTypes.length > 0) {
      setCourseTypeUid(activeCourseTypes[0].uid)
    }
  }, [activeCourseTypes, courseTypeUid])

  useEffect(() => {
    return () => {
      if (coverPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl)
      }
    }
  }, [coverPreviewUrl])

  const reset = useCallback(() => {
    setTitle('')
    setHeader('')
    setCoverFile(null)
    setCoverPreviewUrl(undefined)
    setCategoryUid('')
    setCourseTypeUid('')
    setLevel('Pemula')
    setPrice('')
    setStrikePrice('')
    setWhatYouLearn([])
    setDescription('')
    setSubmitting(false)
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    reset()
  }, [onOpenChange, reset])

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Pilih file gambar (JPG, PNG, WebP, …).')
      return
    }
    setCoverFile(file)
    setCoverPreviewUrl((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }
      return URL.createObjectURL(file)
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const t = title.trim()
      const h = header.trim()
      const d = description.trim()
      if (!t || !h || !d) {
        toast.error('Judul, header, dan deskripsi wajib diisi.')
        return
      }
      if (!categoryUid) {
        toast.error('Kategori wajib dipilih.')
        return
      }
      if (!courseTypeUid) {
        toast.error('Tipe kursus wajib dipilih.')
        return
      }
      if (price === '' || price < 0) {
        toast.error('Harga wajib diisi.')
        return
      }

      const agreed = await confirm({
        title: 'Lanjut ke editor kursus?',
        description: 'Kursus akan dibuat sebagai draf. Anda bisa mengisi modul setelahnya.',
        confirmLabel: 'Lanjutkan',
      })
      if (!agreed) return

      const defaultMeetings = 8
      setSubmitting(true)
      try {
        const formData = new FormData()
        if (coverFile) {
          formData.append('cover', coverFile)
        }
        formData.append('title', t)
        formData.append('subtitle', h)
        formData.append('description', d)
        formData.append(
          'slug',
          t
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
        )
        formData.append('category_uid', categoryUid)
        formData.append('course_type_uid', courseTypeUid)
        formData.append('level', level.toUpperCase())
        formData.append('price', String(typeof price === 'number' ? price : 0))
        if (typeof strikePrice === 'number' && strikePrice > 0) {
          formData.append('price_strike', String(strikePrice))
        }
        formData.append('what_you_learn', JSON.stringify(whatYouLearn))
        formData.append('slot', String(defaultMeetings))
        formData.append('is_premium', String((typeof price === 'number' ? price : 0) > 0))
        formData.append('is_published', 'false')

        const response = await createCourse.mutateAsync(formData)
        const uid = (response.data as { uid?: string } | undefined)?.uid
        if (!uid) {
          throw new Error('Backend tidak mengembalikan uid kursus')
        }

        toast.success('Kursus dibuat. Lanjut ke editor.')
        onOpenChange(false)
        reset()
        router.push(`${roleBasePath}/courses/${uid}/edit`)
      } finally {
        setSubmitting(false)
      }
    },
    [confirm, title, header, categoryUid, courseTypeUid, price, strikePrice, coverFile, level, whatYouLearn, onOpenChange, reset, router, description, createCourse, roleBasePath],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border-slate-200">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900">Kursus baru</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">Isi detail kursus lengkap. Status awal draf — Anda bisa edit modul setelahnya.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="max-h-[65vh] overflow-y-auto px-6 py-5 space-y-6">
            {/* ── Section 1: Informasi Dasar ── */}
            <section className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Informasi Dasar</h3>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Cover</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 transition hover:border-primary/40 hover:bg-primary/5">
                    <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
                    {coverPreviewUrl ? 'Ganti gambar' : 'Unggah gambar'}
                  </label>
                  {coverPreviewUrl && (
                    <Image src={coverPreviewUrl} width={320} height={200} loading="lazy" alt="Pratinjau cover" className="h-20 max-w-full rounded-lg border border-slate-200 object-cover" />
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="cc-title" className={labelClass}>
                    Judul
                  </label>
                  <input id="cc-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Contoh: Full Stack Web Modern" className={inputClass} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="cc-header" className={labelClass}>
                    Header / Subtitle
                  </label>
                  <input id="cc-header" value={header} onChange={(e) => setHeader(e.target.value)} required placeholder="Subjudul singkat yang tampil di kartu" className={inputClass} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="cc-description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="cc-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Deskripsikan kursus untuk halaman detail."
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="cc-category" className={labelClass}>
                    Kategori
                  </label>
                  <select id="cc-category" value={categoryUid} onChange={(e) => setCategoryUid(e.target.value)} required className={inputClass} disabled={categoryLoading && categories.length === 0}>
                    <option value="" disabled>
                      {categoryLoading && categories.length === 0 ? 'Memuat kategori...' : 'Pilih kategori'}
                    </option>
                    {activeCategories.map((c) => (
                      <option key={c.uid} value={c.uid}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {!categoryLoading && categories.length === 0 && <p className="text-xs text-slate-500">Kategori belum tersedia di backend.</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="cc-type" className={labelClass}>
                    Tipe Kursus
                  </label>
                  <select
                    id="cc-type"
                    value={courseTypeUid}
                    onChange={(e) => setCourseTypeUid(e.target.value)}
                    className={inputClass}
                    disabled={courseTypeLoading && courseTypes.length === 0}
                    required>
                    <option value="" disabled>
                      {courseTypeLoading && courseTypes.length === 0 ? 'Memuat tipe kursus...' : 'Pilih tipe kursus'}
                    </option>
                    {activeCourseTypes.map((item) => (
                      <option key={item.uid} value={item.uid}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="cc-level" className={labelClass}>
                    Level
                  </label>
                  <select id="cc-level" value={level} onChange={(e) => setLevel(e.target.value as CourseLevel)} className={inputClass}>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ── Section 2: Harga ── */}
            <section className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Harga</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="cc-price" className={labelClass}>
                    Harga
                  </label>
                  <RupiahInput id="cc-price" value={price} onChange={setPrice} placeholder="Contoh: 150000" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="cc-strike" className={labelClass}>
                    Harga Coret (Opsional)
                  </label>
                  <RupiahInput id="cc-strike" value={strikePrice} onChange={setStrikePrice} placeholder="Harga sebelum diskon" />
                </div>
              </div>
            </section>

            {/* ── Section 3: Kurikulum ── */}
            <section className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Kurikulum</h3>

              <DynamicListField label="Yang Akan Dipelajari" items={whatYouLearn} onChange={setWhatYouLearn} placeholder="Contoh: Memahami arsitektur REST API" />
            </section>
          </div>

          <DialogFooter className="border-t border-slate-100 px-6 py-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" className="rounded-xl" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Lanjut ke editor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
