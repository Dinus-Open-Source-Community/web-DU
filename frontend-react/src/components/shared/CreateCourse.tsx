import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { CourseLevel } from '../../lib/types/course'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import type { CategoryListResponse, CourseTypeListResponse } from '../../lib/types/api'
import { DynamicListField } from './DynamicField'
import { ConfirmDialog } from './ConfirmDialog'
import { RupiahInput } from './InputRupiah'
import { CreateSlug } from '../../lib/func/func'

type CreateCourseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleBasePath?: '/mentor' | '/admin'
}

const LEVELS: CourseLevel[] = ['Pemula', 'Menengah', 'Lanjutan']

export function CreateCourseDialog({ open, onOpenChange, roleBasePath = '/mentor' }: CreateCourseDialogProps) {
  // const confirm = useConfirm()
  const navigate = useNavigate()
  // const createCourse = useCreateCourse()

  // dummy response untuk category dan course type
  const categoryResponse: CategoryListResponse = useMemo(
    () => ({
      course_categories: [
        { uid: 'cat-1', name: 'Programming', description: '', is_active: true, courses: [], created_at: '', updated_at: '' },
        { uid: 'cat-2', name: 'Design', description: '', is_active: true, courses: [], created_at: '', updated_at: '' },
      ],
      meta: { current_page: 1, per_page: 10, total: 0, total_pages: 0 },
    }),
    [],
  )
  const courseTypeResponse: CourseTypeListResponse = useMemo(
    () => ({
      course_types: [
        { uid: 'type-1', name: 'Online', description: '', is_active: true, courses: [], created_at: '', updated_at: '' },
        { uid: 'type-2', name: 'Offline', description: '', is_active: true, courses: [], created_at: '', updated_at: '' },
      ],
      meta: { current_page: 1, per_page: 10, total: 0, total_pages: 0 },
    }),
    [],
  )

  // state form
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
  const [isDraft, isSetDraft] = useState('')
  const [isAgree, setIsAgree] = useState(false)

  // mapping response ke options select
  const categories = useMemo(() => categoryResponse?.course_categories ?? [], [categoryResponse])
  const courseTypes = useMemo(() => courseTypeResponse?.course_types ?? [], [courseTypeResponse])

  // filtering aktif category dan type
  const activeCategories = useMemo(() => categories.filter((item) => item.is_active), [categories])
  const activeCourseTypes = useMemo(() => courseTypes.filter((item) => item.is_active), [courseTypes])

  // set default category dan type saat data sudah ada
  useEffect(() => {
    if (!categoryUid && activeCategories.length > 0) {
      setCategoryUid(activeCategories[0].uid)
    }
  }, [activeCategories, categoryUid])

  // otomatis set tipe kursus ke default pertama saat tipe kursus aktif berubah, kecuali sudah ada yang dipilih
  useEffect(() => {
    if (!courseTypeUid && activeCourseTypes.length > 0) {
      setCourseTypeUid(activeCourseTypes[0].uid)
    }
  }, [activeCourseTypes, courseTypeUid])

  // cleanup URL object untuk preview cover saat component unmount atau saat cover diganti
  useEffect(() => {
    return () => {
      if (coverPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl)
      }
    }
  }, [coverPreviewUrl])

  // fungsi reset form ke nilai awal
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

  // fungsi untuk menutup dialog dan reset form
  const handleClose = useCallback(() => {
    onOpenChange(false)
    reset()
  }, [onOpenChange, reset])

  // fungsi untuk handle perubahan file cover dan membuat preview URL
  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Pilih file gambar (JPG, PNG, WebP).')
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

  // fungsi untuk submit form, membuat kursus baru, dan navigasi ke editor
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmedTitle = title.trim()
      const trimmedHeader = header.trim()
      const trimmedDescription = description.trim()
      if (!trimmedTitle || !trimmedHeader || !trimmedDescription) {
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

      setIsAgree(true)
      const defaultMeetings = 8
      setSubmitting(true)
      try {
        const formData = new FormData()
        if (coverFile) {
          formData.append('cover', coverFile)
        }
        formData.append('title', trimmedTitle)
        formData.append('subtitle', trimmedHeader)
        formData.append('description', trimmedDescription)
        formData.append('slug', CreateSlug(trimmedTitle))
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

        // const response = await createCourse.mutateAsync(formData)
        // const uid = (response.data as { uid?: string } | undefined)?.uid
        // if (!uid) {
        //   throw new Error('Backend tidak mengembalikan uid kursus')
        // }

        // dummy uid untuk navigasi
        const uid = 'dummy-uid'

        toast.success('Kursus dibuat. Lanjut ke editor.')
        onOpenChange(false)
        reset()
        navigate(`${roleBasePath}/courses/${uid}/edit`)
      } finally {
        setSubmitting(false)
      }
    },
    [title, header, categoryUid, courseTypeUid, price, strikePrice, coverFile, level, whatYouLearn, onOpenChange, reset, navigate, description, roleBasePath],
  )

  return (
    <>
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
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cover</label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 transition hover:border-primary/40 hover:bg-primary/5">
                      <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
                      {coverPreviewUrl ? 'Ganti gambar' : 'Unggah gambar'}
                    </label>
                    {coverPreviewUrl && (
                      <img src={coverPreviewUrl} width={320} height={200} loading="lazy" alt="Pratinjau cover" className="h-20 max-w-full rounded-lg border border-slate-200 object-cover" />
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label htmlFor="cc-title" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Judul
                    </label>
                    <input
                      id="cc-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Contoh: Full Stack Web Modern"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label htmlFor="cc-header" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Header / Subtitle
                    </label>
                    <input
                      id="cc-header"
                      value={header}
                      onChange={(e) => setHeader(e.target.value)}
                      required
                      placeholder="Subjudul singkat yang tampil di kartu"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label htmlFor="cc-description" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </label>
                    <textarea
                      id="cc-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      placeholder="Deskripsikan kursus untuk halaman detail."
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary resize-y`}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="cc-category" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Kategori
                    </label>
                    <Select value={categoryUid} onValueChange={setCategoryUid} disabled={categories.length === 0}>
                      <SelectTrigger id="cc-category" className="w-full" aria-label="Kategori">
                        <SelectValue placeholder={categories.length === 0 ? 'Memuat kategori...' : 'Pilih kategori'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {activeCategories.map((c: { uid: string; name: string }) => (
                            <SelectItem key={c.uid} value={c.uid}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {categories.length === 0 && <p className="text-xs text-slate-500">Kategori belum tersedia di backend.</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="cc-type" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tipe Kursus
                    </label>
                    <Select value={courseTypeUid} onValueChange={setCourseTypeUid} disabled={courseTypes.length === 0}>
                      <SelectTrigger id="cc-type" className="w-full" aria-label="Tipe Kursus">
                        <SelectValue placeholder={courseTypes.length === 0 ? 'Memuat tipe kursus...' : 'Pilih tipe kursus'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {activeCourseTypes.map((item) => (
                            <SelectItem key={item.uid} value={item.uid}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="cc-level" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Level
                    </label>
                    <Select value={level} onValueChange={(value) => setLevel(value as CourseLevel)}>
                      <SelectTrigger id="cc-level" className="w-full" aria-label="Level">
                        <SelectValue placeholder="Pilih level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* ── Section 2: Harga ── */}
              <section className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Harga</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cc-price" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Harga
                    </label>
                    <RupiahInput id="cc-price" value={price} onChange={setPrice} placeholder="Contoh: 150000" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cc-strike" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Harga Coret (Opsional)
                    </label>
                    <RupiahInput id="cc-strike" value={strikePrice} onChange={setStrikePrice} placeholder="Harga sebelum diskon" />
                  </div>
                </div>
              </section>

              {/* ── Section 3: Kurikulum ── */}
              <section className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Kurikulum</h3>

                <DynamicListField
                  label="Yang Akan Dipelajari"
                  items={whatYouLearn}
                  onChange={setWhatYouLearn}
                  placeholder="Contoh: Memahami arsitektur REST API"
                  draft={isDraft}
                  setDraft={isSetDraft}
                />
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
      {isAgree && (
        <ConfirmDialog
          open={isAgree}
          onOpenChange={setIsAgree}
          title="Konfirmasi"
          description="Apakah Anda yakin ingin melanjutkan?"
          confirmLabel="Lanjutkan"
          cancelLabel="Batal"
          onConfirm={() => setIsAgree(false)}
          onCancel={() => setIsAgree(false)}
        />
      )}
    </>
  )
}
