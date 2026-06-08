import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DynamicListField } from '@/components/shared/DynamicField'
import { RupiahInput } from '@/components/shared/InputRupiah'
import type { CourseFormOptionsViewModel } from '@/lib/course-form/course-form-options-view-model'
import { apiLevelToUi, COURSE_FORM_LEVELS, uiLevelToApi } from '@/lib/course-form/level'
import { courseDetailToFormValues } from '@/lib/course-form/mappers'
import type { CourseFormMode, CourseFormValues } from '@/lib/course-form/types'
import { EMPTY_COURSE_FORM_VALUES } from '@/lib/course-form/types'
import type { CourseLevel, ICourseDetailItem } from '@/lib/types/course'
import { getCourseFormValidationMessage } from '@/lib/validator/course-form'
import { courseFormLayout } from './course-form-layout'

type CourseFormDialogProps = CourseFormOptionsViewModel & {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: CourseFormMode
  course?: ICourseDetailItem
  submitting?: boolean
  onSubmitCreate?: (values: CourseFormValues) => Promise<void>
  onSubmitEdit?: (values: CourseFormValues) => Promise<void>
}

export function CourseFormDialog({
  open,
  onOpenChange,
  mode,
  course,
  submitting = false,
  onSubmitCreate,
  onSubmitEdit,
  categories,
  courseTypes,
  optionsLoading,
}: CourseFormDialogProps) {
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<CourseFormValues>(EMPTY_COURSE_FORM_VALUES)
  const [listDraft, setListDraft] = useState('')

  const activeCategories = useMemo(() => categories.filter((item) => item.is_active), [categories])
  const activeCourseTypes = useMemo(() => courseTypes.filter((item) => item.is_active), [courseTypes])

  const resetForm = useCallback(() => {
    setValues(EMPTY_COURSE_FORM_VALUES)
    setListDraft('')
  }, [])

  const hydrateForm = useCallback(() => {
    if (isEdit && course) {
      setValues(courseDetailToFormValues(course))
      return
    }
    resetForm()
  }, [course, isEdit, resetForm])

  useEffect(() => {
    if (!open) return
    hydrateForm()
  }, [open, hydrateForm])

  useEffect(() => {
    if (!open || isEdit) return
    setValues((current) => {
      const next = { ...current }
      if (!next.categoryUid && activeCategories[0]) {
        next.categoryUid = activeCategories[0].uid
      }
      if (!next.courseTypeUid && activeCourseTypes[0]) {
        next.courseTypeUid = activeCourseTypes[0].uid
      }
      return next
    })
  }, [open, isEdit, activeCategories, activeCourseTypes])

  useEffect(() => {
    return () => {
      if (values.coverPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(values.coverPreviewUrl)
      }
    }
  }, [values.coverPreviewUrl])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    resetForm()
  }, [onOpenChange, resetForm])

  const handleCoverChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Pilih file gambar (JPG, PNG, WebP).')
      return
    }

    setValues((current) => {
      if (current.coverPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(current.coverPreviewUrl)
      }
      return {
        ...current,
        coverFile: file,
        coverPreviewUrl: URL.createObjectURL(file),
      }
    })
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const validationError = getCourseFormValidationMessage(values)
      if (validationError) {
        toast.error(validationError)
        return
      }

      try {
        if (isEdit) {
          if (!onSubmitEdit) return
          await onSubmitEdit(values)
        } else {
          if (!onSubmitCreate) return
          await onSubmitCreate(values)
        }
        handleClose()
      } catch {
        // Error toast handled by mutation hooks.
      }
    },
    [handleClose, isEdit, onSubmitCreate, onSubmitEdit, values],
  )

  const uiLevel = apiLevelToUi(values.level)
  const metadataLoading = optionsLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={courseFormLayout.dialog}>
        <DialogHeader className={courseFormLayout.header}>
          <DialogTitle className={courseFormLayout.title}>
            {isEdit ? 'Edit detail kursus' : 'Kursus baru'}
          </DialogTitle>
          <DialogDescription className={courseFormLayout.description}>
            {isEdit
              ? 'Perbarui informasi dasar kursus. Perubahan kurikulum tetap dilakukan di tab Kurikulum.'
              : 'Isi detail kursus lengkap. Kursus disimpan sebagai draf; terbitkan nanti lewat tombol Update status.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className={courseFormLayout.body}>
            <section className="space-y-4">
              <h3 className={courseFormLayout.sectionTitle}>Informasi Dasar</h3>

              <div className="flex flex-col gap-2">
                <span className={courseFormLayout.label}>Cover</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className={courseFormLayout.uploadZone}>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleCoverChange} />
                    {values.coverPreviewUrl ? 'Ganti gambar' : 'Unggah gambar'}
                  </label>
                  {values.coverPreviewUrl ? (
                    <img
                      src={values.coverPreviewUrl}
                      width={320}
                      height={200}
                      loading="lazy"
                      alt="Pratinjau cover kursus"
                      className={courseFormLayout.coverPreview}
                    />
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="course-form-title" className={courseFormLayout.label}>
                    Judul
                  </label>
                  <input
                    id="course-form-title"
                    value={values.title}
                    onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                    required
                    placeholder="Contoh: Full Stack Web Modern"
                    className={courseFormLayout.input}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="course-form-subtitle" className={courseFormLayout.label}>
                    Subtitle
                  </label>
                  <input
                    id="course-form-subtitle"
                    value={values.subtitle}
                    onChange={(event) => setValues((current) => ({ ...current, subtitle: event.target.value }))}
                    required
                    placeholder="Subjudul singkat yang tampil di kartu kursus"
                    className={courseFormLayout.input}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="course-form-description" className={courseFormLayout.label}>
                    Deskripsi
                  </label>
                  <textarea
                    id="course-form-description"
                    value={values.description}
                    onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                    required
                    rows={4}
                    placeholder="Deskripsikan kursus untuk halaman detail."
                    className={courseFormLayout.textarea}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="course-form-category" className={courseFormLayout.label}>
                    Kategori
                  </label>
                  <Select
                    value={values.categoryUid}
                    onValueChange={(categoryUid) => setValues((current) => ({ ...current, categoryUid }))}
                    disabled={metadataLoading || activeCategories.length === 0}
                  >
                    <SelectTrigger id="course-form-category" className="w-full rounded-xl" aria-label="Kategori">
                      <SelectValue
                        placeholder={
                          metadataLoading
                            ? 'Memuat kategori...'
                            : activeCategories.length === 0
                              ? 'Kategori belum tersedia'
                              : 'Pilih kategori'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {activeCategories.map((category) => (
                          <SelectItem key={category.uid} value={category.uid}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="course-form-type" className={courseFormLayout.label}>
                    Tipe Kursus
                  </label>
                  <Select
                    value={values.courseTypeUid}
                    onValueChange={(courseTypeUid) => setValues((current) => ({ ...current, courseTypeUid }))}
                    disabled={metadataLoading || activeCourseTypes.length === 0}
                  >
                    <SelectTrigger id="course-form-type" className="w-full rounded-xl" aria-label="Tipe kursus">
                      <SelectValue
                        placeholder={
                          metadataLoading
                            ? 'Memuat tipe kursus...'
                            : activeCourseTypes.length === 0
                              ? 'Tipe belum tersedia'
                              : 'Pilih tipe kursus'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {activeCourseTypes.map((courseType) => (
                          <SelectItem key={courseType.uid} value={courseType.uid}>
                            {courseType.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="course-form-level" className={courseFormLayout.label}>
                    Level
                  </label>
                  <Select
                    value={uiLevel}
                    onValueChange={(level) =>
                      setValues((current) => ({
                        ...current,
                        level: uiLevelToApi(level as CourseLevel),
                      }))
                    }
                  >
                    <SelectTrigger id="course-form-level" className="w-full rounded-xl" aria-label="Level">
                      <SelectValue placeholder="Pilih level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {COURSE_FORM_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="course-form-slot" className={courseFormLayout.label}>
                    Slot (opsional)
                  </label>
                  <input
                    id="course-form-slot"
                    type="number"
                    min={0}
                    value={values.slot}
                    onChange={(event) => {
                      const raw = event.target.value
                      setValues((current) => ({
                        ...current,
                        slot: raw === '' ? '' : Number(raw),
                      }))
                    }}
                    placeholder="0 = tanpa batas"
                    className={courseFormLayout.input}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className={courseFormLayout.sectionTitle}>Harga</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="course-form-price" className={courseFormLayout.label}>
                    Harga
                  </label>
                  <RupiahInput
                    id="course-form-price"
                    value={values.price}
                    onChange={(price) => setValues((current) => ({ ...current, price }))}
                    placeholder="Contoh: 150000"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="course-form-strike" className={courseFormLayout.label}>
                    Harga Coret (opsional)
                  </label>
                  <RupiahInput
                    id="course-form-strike"
                    value={values.strikePrice}
                    onChange={(strikePrice) => setValues((current) => ({ ...current, strikePrice }))}
                    placeholder="Harga sebelum diskon"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className={courseFormLayout.sectionTitle}>Kurikulum</h3>
              <DynamicListField
                label="Yang Akan Dipelajari"
                items={values.whatYouLearn}
                onChange={(whatYouLearn) => setValues((current) => ({ ...current, whatYouLearn }))}
                placeholder="Contoh: Memahami arsitektur REST API"
                draft={listDraft}
                setDraft={setListDraft}
              />
            </section>
          </div>

          <DialogFooter className={courseFormLayout.footer}>
            <Button
              type="button"
              variant="outline"
              className={courseFormLayout.actionButton}
              onClick={handleClose}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" className={courseFormLayout.actionButton} disabled={submitting || metadataLoading}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Menyimpan...
                </>
              ) : isEdit ? (
                'Simpan perubahan'
              ) : (
                'Buat kursus'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
