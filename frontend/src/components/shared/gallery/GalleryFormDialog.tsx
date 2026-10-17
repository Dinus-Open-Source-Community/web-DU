import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { ImagePlus } from 'lucide-react'
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
import { ScrapbookCard } from '@/components/landing/GallerySection'
import { courseMasterLayout } from '@/lib/course-master/layout'
import {
  EMPTY_GALLERY_FORM,
  validateDummyGalleryForm,
  type DummyGalleryFormValues,
  type DummyGalleryItem,
  type DummyGalleryVariant,
} from '@/lib/gallery/dummy-gallery'

const VARIANT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'auto', label: 'Otomatis (mengikuti urutan)' },
  { value: '0', label: '0 — Kertas sobek' },
  { value: '1', label: '1 — Notebook' },
  { value: '2', label: '2 — Polaroid warna' },
  { value: '3', label: '3 — Patch kertas' },
  { value: '4', label: '4 — Label kraft' },
  { value: '5', label: '5 — Kartu pos' },
]

function toFormValues(item: DummyGalleryItem | null): DummyGalleryFormValues {
  if (!item) return { ...EMPTY_GALLERY_FORM }
  return {
    src: item.src,
    alt: item.alt,
    caption: item.caption,
    variant: item.variant,
  }
}

type GalleryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  item?: DummyGalleryItem | null
  onSubmit: (values: DummyGalleryFormValues) => void
}

export function GalleryFormDialog({ open, onOpenChange, mode, item, onSubmit }: GalleryFormDialogProps) {
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<DummyGalleryFormValues>(() => toFormValues(item ?? null))
  const fileRef = useRef<HTMLInputElement>(null)

  const resetForm = useCallback(() => {
    setValues(toFormValues(item ?? null))
    if (fileRef.current) fileRef.current.value = ''
  }, [item])

  useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  const handleFileChange = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setValues((current) => ({ ...current, src: String(reader.result ?? '') }))
    }
    reader.onerror = () => toast.error('Gagal membaca file gambar.')
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const error = validateDummyGalleryForm(values)
    if (error) {
      toast.error(error)
      return
    }
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-line-light p-0">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="border-b border-line-light px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-ink-900">
              {isEdit ? 'Edit gambar galeri' : 'Tambah gambar galeri'}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-ink-500">
              Data dummy tersimpan lokal di browser — akan diganti API backend nantinya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className={courseMasterLayout.fieldStack}>
              <Label className={courseMasterLayout.fieldLabel}>Pratinjau gambar</Label>
              {values.src ? (
                <img
                  src={values.src}
                  alt={values.alt || 'Pratinjau gambar galeri'}
                  className="aspect-video w-full rounded-xl border-2 border-ink-900/10 object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900/10 bg-paper-paper text-ink-400">
                  <ImagePlus className="size-6" aria-hidden />
                  <p className="text-xs font-medium">Belum ada gambar — unggah atau isi URL</p>
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-sm border-line-light"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus className="mr-2 size-4" aria-hidden />
                  Unggah file
                </Button>
                <Input
                  value={values.src.startsWith('data:') ? '' : values.src}
                  onChange={(event) => setValues((current) => ({ ...current, src: event.target.value }))}
                  placeholder="...atau tempel URL gambar"
                  className={courseMasterLayout.input}
                />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Unggah file gambar"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />
            </div>

            <div className={courseMasterLayout.fieldStack}>
              <Label htmlFor="gallery-caption" className={courseMasterLayout.fieldLabel}>
                Caption
              </Label>
              <Textarea
                id="gallery-caption"
                value={values.caption}
                onChange={(event) => setValues((current) => ({ ...current, caption: event.target.value }))}
                placeholder="Cerita singkat di bawah foto, mis. Tim di balik layar..."
                className={courseMasterLayout.textarea}
                maxLength={200}
                required
              />
            </div>

            <div className={courseMasterLayout.fieldStack}>
              <Label htmlFor="gallery-alt" className={courseMasterLayout.fieldLabel}>
                Alt text
              </Label>
              <Input
                id="gallery-alt"
                value={values.alt}
                onChange={(event) => setValues((current) => ({ ...current, alt: event.target.value }))}
                placeholder="Deskripsi isi foto untuk screen reader"
                className={courseMasterLayout.input}
                maxLength={160}
                required
              />
              <p className={courseMasterLayout.fieldHint}>Dibaca screen reader sekali, jangan duplikat caption.</p>
            </div>

            <div className={courseMasterLayout.fieldStack}>
              <Label htmlFor="gallery-variant" className={courseMasterLayout.fieldLabel}>
                Varian kartu landing
              </Label>
              <Select
                value={values.variant === null ? 'auto' : String(values.variant)}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    variant: value === 'auto' ? null : (Number(value) as DummyGalleryVariant),
                  }))
                }
              >
                <SelectTrigger id="gallery-variant" className="h-10 w-full">
                  <SelectValue placeholder="Pilih varian" />
                </SelectTrigger>
                <SelectContent>
                  {VARIANT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={courseMasterLayout.fieldStack}>
              <Label className={courseMasterLayout.fieldLabel}>Pratinjau tampilan landing</Label>
              {values.src ? (
                <div className="rounded-xl bg-paper-panel p-4">
                  <ScrapbookCard
                    img={{
                      src: values.src,
                      alt: values.alt || 'Pratinjau gambar galeri',
                      caption: values.caption || 'Caption akan tampil di sini...',
                      variant: values.variant ?? undefined,
                    }}
                    globalIdx={0}
                    aspect="aspect-[4/3]"
                  />
                  {values.variant === null ? (
                    <p className="mt-2 text-center text-xs font-medium text-ink-500">
                      Mode otomatis — kulit kartu mengikuti urutan foto di landing (ini contoh varian 0).
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs font-medium text-ink-500">
                  Pratinjau muncul setelah gambar diunggah atau URL diisi.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-line-light px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-sm border-line-light"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="rounded-sm px-5">
              {isEdit ? 'Simpan Perubahan' : 'Tambah Gambar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
