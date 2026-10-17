import { useMemo, useState } from 'react'
import { Eye, Images, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/Header'
import { GalleryFormDialog } from '@/components/shared/gallery/GalleryFormDialog'
import { ScrapbookCard } from '@/components/landing/GallerySection'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { appCardClassName, appToolbarPrimaryButtonClassName } from '@/lib/design/app-shell-tokens'
import {
  useDummyGallery,
  type DummyGalleryFormValues,
  type DummyGalleryItem,
} from '@/lib/gallery/dummy-gallery'
import { gridCardsClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'

type DialogState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; item: DummyGalleryItem }
type DeleteState = { uid: string; caption: string } | null

function variantLabel(item: DummyGalleryItem, index: number): string {
  const variant = item.variant ?? index % 6
  return `Varian ${variant}`
}

export function GalleryManagementPanel() {
  const { items, create, update, remove, resetToSeed } = useDummyGallery()
  const [search, setSearch] = useState('')
  const [dialogState, setDialogState] = useState<DialogState>({ mode: 'closed' })
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null)
  const [previewItem, setPreviewItem] = useState<DummyGalleryItem | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter(
      (item) =>
        item.caption.toLowerCase().includes(query) || item.alt.toLowerCase().includes(query),
    )
  }, [items, search])

  const closeDialog = () => setDialogState({ mode: 'closed' })

  const previewIndex = previewItem ? items.findIndex((item) => item.uid === previewItem.uid) : -1

  const handleSubmit = (values: DummyGalleryFormValues) => {
    if (dialogState.mode === 'edit') {
      update(dialogState.item.uid, values)
    } else {
      create(values)
    }
    closeDialog()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <PageHeader
          title="Galeri"
          subtitle={`Kelola gambar galeri landing — ${items.length} gambar. Data dummy tersimpan lokal, backend belum tersedia.`}
          className="mb-0 min-w-0 flex-1 space-y-2"
        />
        <div className="flex shrink-0 items-center gap-2 self-start">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-sm border-2 border-ink-900/10 px-4 text-sm font-semibold shadow-none"
            onClick={resetToSeed}
            title="Kembalikan ke data awal"
          >
            <RotateCcw className="mr-2 size-4" aria-hidden />
            Reset
          </Button>
          <Button
            type="button"
            className={cn(appToolbarPrimaryButtonClassName)}
            onClick={() => setDialogState({ mode: 'create' })}
          >
            <Plus className="mr-2 size-4" aria-hidden />
            Tambah gambar
          </Button>
        </div>
      </div>

      <div className="w-full space-y-1.5 lg:max-w-sm">
        <Label htmlFor="gallery-search" className="sr-only">
          Cari gambar
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="gallery-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari caption atau alt text..."
            className="h-10 border-ink-900/10 bg-paper-white pl-9 shadow-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Images className="size-5" aria-hidden />}
          title={items.length === 0 ? 'Belum ada gambar galeri' : 'Tidak ada gambar yang cocok'}
          description={
            items.length === 0
              ? 'Tambah gambar pertama untuk mengisi galeri landing.'
              : 'Coba kata kunci lain atau reset pencarian.'
          }
          action={
            items.length === 0 ? (
              <Button
                type="button"
                className={appToolbarPrimaryButtonClassName}
                onClick={() => setDialogState({ mode: 'create' })}
              >
                <Plus className="mr-2 size-4" aria-hidden />
                Tambah gambar
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={gridCardsClassName}>
          {filtered.map((item, index) => (
            <article key={item.uid} className={cn(appCardClassName, 'flex flex-col overflow-hidden')}>
              <button
                type="button"
                onClick={() => setPreviewItem(item)}
                className="block w-full cursor-zoom-in"
                title="Lihat pratinjau"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              </button>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full border border-ink-900/10 bg-paper-paper px-2.5 py-1 text-[11px] font-semibold text-ink-600">
                    {variantLabel(item, index)}
                  </span>
                  <span className="text-[11px] font-medium text-ink-400">
                    {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm font-semibold text-ink-900">{item.caption}</p>
                <p className="line-clamp-1 text-xs font-medium text-ink-500">Alt: {item.alt}</p>
                <div className="mt-auto flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-sm border-2 border-ink-900/10 px-3 text-xs font-semibold text-ink-700 shadow-none"
                    onClick={() => setPreviewItem(item)}
                  >
                    <Eye className="mr-1.5 size-3.5" aria-hidden />
                    Pratinjau
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-sm border-2 border-ink-900/10 px-3 text-xs font-semibold text-ink-700 shadow-none"
                    onClick={() => setDialogState({ mode: 'edit', item })}
                  >
                    <Pencil className="mr-1.5 size-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-sm border-2 border-ink-900/10 px-3 text-xs font-semibold text-rose-600 shadow-none hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setDeleteTarget({ uid: item.uid, caption: item.caption })}
                  >
                    <Trash2 className="mr-1.5 size-3.5" aria-hidden />
                    Hapus
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <GalleryFormDialog
        open={dialogState.mode !== 'closed'}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        mode={dialogState.mode === 'edit' ? 'edit' : 'create'}
        item={dialogState.mode === 'edit' ? dialogState.item : null}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus gambar?"
        description={deleteTarget ? `"${deleteTarget.caption}" akan dihapus dari galeri (dummy lokal).` : undefined}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) remove(deleteTarget.uid)
          setDeleteTarget(null)
        }}
      />

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-2xl gap-0 rounded-2xl border-line-light p-0">
          <DialogHeader className="border-b border-line-light px-6 py-4">
            <DialogTitle className="line-clamp-1 text-base font-semibold text-ink-900">
              Pratinjau tampilan landing
            </DialogTitle>
          </DialogHeader>
          {previewItem ? (
            <div className="rounded-b-2xl bg-paper-panel p-4 sm:p-6">
              <div className="mx-auto w-full max-w-md">
                <ScrapbookCard
                  img={{
                    src: previewItem.src,
                    alt: previewItem.alt,
                    caption: previewItem.caption,
                    variant: previewItem.variant ?? undefined,
                  }}
                  globalIdx={previewIndex < 0 ? 0 : previewIndex}
                  aspect="aspect-[16/10]"
                />
              </div>
              <p className="mt-3 text-xs font-medium text-ink-500">Alt: {previewItem.alt}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
