import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { ImagePlus, Sparkles, UploadCloud } from 'lucide-react'
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
import { cn } from '@/lib/utils'

const VARIANT_OPTIONS: Array<{ value: string; label: string; badgeCls: string }> = [
  { value: 'auto', label: 'Otomatis (mengikuti pola bento)', badgeCls: 'bg-paper-panel text-ink-700' },
  { value: '0', label: '0 — Kertas Sobek (Torn Paper)', badgeCls: 'bg-paper-white text-ink-800' },
  { value: '1', label: '1 — Buku Tulis Bergaris (Notebook)', badgeCls: 'bg-note-sky text-ink-900' },
  { value: '2', label: '2 — Polaroid Berwarna (Polaroid)', badgeCls: 'bg-note-yellow text-ink-900' },
  { value: '3', label: '3 — Patch Kertas Pastel (Paper Patch)', badgeCls: 'bg-note-mint text-ink-900' },
  { value: '4', label: '4 — Label Kraft Cokelat (Kraft Tag)', badgeCls: 'bg-note-peach text-ink-900' },
  { value: '5', label: '5 — Kartu Pos Klasik (Vintage Postcard)', badgeCls: 'bg-note-lavender text-ink-900' },
]

function toFormValues(item: DummyGalleryItem | null): DummyGalleryFormValues {
  if (!item) return { ...EMPTY_GALLERY_FORM }
  return {
    src: item.src,
    file: null,
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
  onSubmit: (values: DummyGalleryFormValues) => Promise<void> | void
}

export function GalleryFormDialog({ open, onOpenChange, mode, item, onSubmit }: GalleryFormDialogProps) {
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<DummyGalleryFormValues>(() => toFormValues(item ?? null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const resetForm = useCallback(() => {
    setValues(toFormValues(item ?? null))
    setIsSubmitting(false)
    if (fileRef.current) fileRef.current.value = ''
  }, [item])

  useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  const handleFileChange = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa format gambar.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran berkas foto melebihi batas maksimal 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setValues((current) => ({
        ...current,
        file,
        src: String(reader.result ?? ''),
      }))
      toast.success('Gambar berhasil dimuat.')
    }
    reader.onerror = () => toast.error('Gagal membaca file gambar.')
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const error = validateDummyGalleryForm(values)
    if (error) {
      toast.error(error)
      return
    }
    try {
      setIsSubmitting(true)
      await onSubmit(values)
      toast.success(isEdit ? 'Dokumentasi galeri diperbarui!' : 'Foto dokumentasi ditambahkan!')
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan foto dokumentasi galeri.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-xl overflow-hidden rounded-2xl border-2 border-ink-900/10 p-0 shadow-paper">
        <form onSubmit={handleSubmit} className="flex max-h-[92dvh] flex-col">
          <DialogHeader className="shrink-0 border-b border-line-light bg-paper-white px-6 py-5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg border border-ink-900/10 bg-brand-soft text-brand-ink">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <DialogTitle className="text-lg font-bold text-ink-900">
                {isEdit ? 'Edit Foto Dokumentasi' : 'Tambah Foto Dokumentasi Galeri'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed text-ink-500">
              Unggah foto dokumentasi kegiatan komunitas DOSCOM untuk ditampilkan di galeri website.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Unggah File Gambar */}
            <div className={courseMasterLayout.fieldStack}>
              <Label className={courseMasterLayout.fieldLabel}>Unggah File Foto</Label>

              {values.src ? (
                <div className="relative overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-paper p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={values.src}
                      alt={values.caption || 'Pratinjau foto terpilih'}
                      className="size-16 shrink-0 rounded-lg border border-ink-900/10 object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-xs font-bold text-ink-800">
                        Foto telah dipilih
                      </p>
                      <p className="text-[11px] text-ink-500">
                        Klik tombol di bawah untuk mengganti dengan file lain.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-md border border-ink-900/10 text-xs font-semibold hover:bg-paper-white"
                        onClick={() => fileRef.current?.click()}
                      >
                        <ImagePlus className="mr-1.5 size-3.5" aria-hidden />
                        Ganti Foto
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900/15 bg-paper-paper px-4 py-5 text-center transition hover:border-ink-900/30 hover:bg-paper-white"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
                    <UploadCloud className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink-800">
                      Klik untuk memilih berkas foto dari perangkat
                    </p>
                    <p className="text-[11px] text-ink-500">
                      Mendukung format PNG, JPG, JPEG, WebP (maks. 5MB)
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Pilih berkas foto"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />
            </div>

            {/* Caption */}
            <div className={courseMasterLayout.fieldStack}>
              <div className="flex items-center justify-between">
                <Label htmlFor="gallery-caption" className={courseMasterLayout.fieldLabel}>
                  Caption Cerita
                </Label>
                <span className="text-[11px] font-medium text-ink-400">
                  {values.caption.length}/200
                </span>
              </div>
              <Textarea
                id="gallery-caption"
                value={values.caption}
                onChange={(event) => setValues((current) => ({ ...current, caption: event.target.value }))}
                placeholder="Cerita singkat di bawah foto, mis. Kelas UI/UX: dari coretan kertas sampai wireframe yang klikable."
                className={courseMasterLayout.textarea}
                maxLength={200}
                required
              />
              <p className={courseMasterLayout.fieldHint}>
                Tampil di bawah foto dalam gaya tulisan tangan/marker scrapbook.
              </p>
            </div>

            {/* Varian Kulit Kartu */}
            <div className={courseMasterLayout.fieldStack}>
              <Label htmlFor="gallery-variant" className={courseMasterLayout.fieldLabel}>
                Gaya Desain Kartu (Scrapbook Variant)
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
                <SelectTrigger id="gallery-variant" className="h-10 w-full rounded-xl border-ink-900/10 bg-paper-white font-medium">
                  <SelectValue placeholder="Pilih varian gaya" />
                </SelectTrigger>
                <SelectContent>
                  {VARIANT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-bold', option.badgeCls)}>
                          {option.value === 'auto' ? 'AUTO' : `V${option.value}`}
                        </span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Live Card Preview */}
            <div className={courseMasterLayout.fieldStack}>
              <Label className={courseMasterLayout.fieldLabel}>Pratinjau Live Kartu Scrapbook</Label>
              {values.src ? (
                <div className="overflow-hidden rounded-xl border border-ink-900/10 bg-paper-paper p-4">
                  <div className="mx-auto max-w-sm">
                    <ScrapbookCard
                      img={{
                        src: values.src,
                        alt: values.caption || 'Pratinjau foto galeri',
                        caption: values.caption || 'Caption cerita akan tampil di sini...',
                        variant: values.variant ?? undefined,
                      }}
                      globalIdx={0}
                      aspect="aspect-[4/3]"
                    />
                  </div>
                  <p className="mt-2 text-center text-[11px] font-medium text-ink-500">
                    {values.variant === null
                      ? 'Mode Otomatis: kulit kartu menyesuaikan posisi baris bento secara dinamis.'
                      : `Menggunakan varian kartu nomor ${values.variant}.`}
                  </p>
                </div>
              ) : (
                <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900/10 bg-paper-paper text-ink-400">
                  <ImagePlus className="size-6 text-ink-300" aria-hidden />
                  <p className="text-xs font-semibold">Unggah gambar di atas untuk melihat pratinjau</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-line-light bg-paper-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="rounded-lg border-2 border-ink-900/10 font-bold text-ink-700 shadow-none hover:bg-paper-paper"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-blue font-bold text-ink-900 shadow-button transition hover:bg-brand-hover"
            >
              {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambahkan ke Galeri'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
