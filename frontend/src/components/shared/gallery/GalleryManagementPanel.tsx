import { useState } from 'react'
import {
  Camera,
  Eye,
  Filter,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/Header'
import { TablePaginationFooter } from '@/components/shared/TablePaginationFooter'
import { GalleryFormDialog } from '@/components/shared/gallery/GalleryFormDialog'
import { NothingGalleryLottieIllustration } from '@/components/playful/NothingGalleryLottieIllustration'
import { ScrapbookCard } from '@/components/landing/GallerySection'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  appCardClassName,
  appShellGridOverlayClassName,
  appToolbarPrimaryButtonClassName,
} from '@/lib/design/app-shell-tokens'
import {
  useDummyGallery,
  type DummyGalleryFormValues,
  type DummyGalleryItem,
} from '@/lib/gallery/dummy-gallery'
import { cn } from '@/lib/utils'

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; item: DummyGalleryItem }

type DeleteState = { uid: string; caption: string } | null

export function GalleryManagementPanel() {
  const [search, setSearch] = useState('')
  const [variantFilter, setVariantFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  const { items, meta, create, update, remove } = useDummyGallery({
    page,
    perPage: pageSize,
    search,
    variant: variantFilter,
  })

  const [dialogState, setDialogState] = useState<DialogState>({ mode: 'closed' })
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null)
  const [previewItem, setPreviewItem] = useState<DummyGalleryItem | null>(null)

  const filtered = items
  const totalPages = meta?.total_pages ?? 1
  const paginatedItems = items

  const closeDialog = () => setDialogState({ mode: 'closed' })

  const previewIndex = previewItem ? items.findIndex((item) => item.uid === previewItem.uid) : -1

  const handleSubmit = async (values: DummyGalleryFormValues) => {
    if (dialogState.mode === 'edit') {
      await update(dialogState.item.uid, values)
    } else {
      await create(values)
    }
    closeDialog()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Manajemen Galeri"
          subtitle="Kelola foto dokumentasi kegiatan DOSCOM untuk ditampilkan pada halaman beranda dan galeri publik."
          className="mb-0 min-w-0 flex-1 space-y-1.5"
        />
        <div className="flex shrink-0 items-center gap-2 self-start">
          <Button
            type="button"
            className={cn(appToolbarPrimaryButtonClassName, 'h-11 rounded-lg shadow-button')}
            onClick={() => setDialogState({ mode: 'create' })}
          >
            <Plus className="mr-2 size-4 stroke-[2.5]" aria-hidden />
            Tambah Foto
          </Button>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Toggle */}
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-ink-900/10 bg-paper-white p-4 shadow-paper sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[240px] flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              id="gallery-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Cari caption foto..."
              className="h-10 rounded-xl border-ink-900/10 bg-paper-paper pl-10 text-sm shadow-none focus-visible:border-brand-blue focus-visible:ring-brand-blue/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-ink-400" aria-hidden />
            <Select
              value={variantFilter}
              onValueChange={(val) => {
                setVariantFilter(val)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-10 w-[180px] rounded-xl border-ink-900/10 bg-paper-paper text-xs font-bold text-ink-800">
                <SelectValue placeholder="Semua Varian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Varian</SelectItem>
                <SelectItem value="auto">Mode Otomatis (Auto)</SelectItem>
                <SelectItem value="0">0 — Kertas Sobek</SelectItem>
                <SelectItem value="1">1 — Notebook</SelectItem>
                <SelectItem value="2">2 — Polaroid</SelectItem>
                <SelectItem value="3">3 — Patch Kertas</SelectItem>
                <SelectItem value="4">4 — Label Kraft</SelectItem>
                <SelectItem value="5">5 — Kartu Pos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View toggle */}
        <div className="inline-flex self-start rounded-lg border border-ink-900/10 bg-paper-paper p-1 sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all',
              viewMode === 'grid'
                ? 'bg-paper-white text-ink-900 shadow-xs'
                : 'text-ink-500 hover:text-ink-900',
            )}
            title="Tampilan Grid Kartu"
          >
            <LayoutGrid className="size-3.5" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all',
              viewMode === 'table'
                ? 'bg-paper-white text-ink-900 shadow-xs'
                : 'text-ink-500 hover:text-ink-900',
            )}
            title="Tampilan Daftar Tabel"
          >
            <List className="size-3.5" />
            Tabel
          </button>
        </div>
      </div>

      {/* Content Area */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper px-6">
          <NothingGalleryLottieIllustration className="mb-4" />
          <h3 className="mb-2 text-xl font-bold text-ink-900">
            {items.length === 0 ? 'Belum ada foto galeri' : 'Tidak ada foto yang cocok'}
          </h3>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-ink-500">
            {items.length === 0
              ? 'Tambahkan dokumentasi kegiatan pertama untuk ditampilkan di website.'
              : 'Coba ubah kata kunci pencarian atau reset filter untuk menemukan foto.'}
          </p>
          {items.length === 0 ? (
            <Button
              type="button"
              className={cn('mt-6', appToolbarPrimaryButtonClassName)}
              onClick={() => setDialogState({ mode: 'create' })}
            >
              <Plus className="mr-2 size-4" aria-hidden />
              Tambah Foto Pertama
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="mt-6 h-11 shrink-0 gap-2 rounded-xl border-2 border-ink-900/10 bg-paper-white px-5 font-semibold text-ink-800 shadow-none hover:bg-paper-paper"
              onClick={() => {
                setSearch('')
                setVariantFilter('all')
                setPage(1)
              }}
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset Pencarian & Filter
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-3.5">
          {/* Compact Responsive Grid */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedItems.map((item) => {
              return (
                <article
                  key={item.uid}
                  className={cn(
                    appCardClassName,
                    'group flex flex-col overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper transition-transform duration-200 hover:-translate-y-0.5',
                  )}
                >
                  {/* Thumbnail Cover */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-ink-900/10 bg-paper-panel">
                    <img
                      src={item.src}
                      alt={item.caption}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded border border-ink-900/10 bg-paper-white/90 px-1.5 py-0.5 text-[11px] font-bold text-ink-800 shadow-xs backdrop-blur-xs transition hover:bg-paper-white hover:text-brand-ink"
                    >
                      <Eye className="size-3" />
                      Pratinjau
                    </button>
                  </div>

                  {/* Info & Caption */}
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div className="space-y-0.5">
                      <p className="line-clamp-2 text-xs font-bold text-ink-900" title={item.caption}>
                        {item.caption}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-line-light pt-2 text-[10px] text-ink-400">
                      <span>
                        {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-md border border-ink-900/10 px-2 text-[11px] font-bold text-ink-700 shadow-none hover:bg-paper-paper hover:text-ink-900"
                          onClick={() => setDialogState({ mode: 'edit', item })}
                        >
                          <Pencil className="mr-1 size-3" aria-hidden />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-md border border-ink-900/10 px-1.5 text-[11px] font-bold text-rose-600 shadow-none hover:border-rose-300 hover:bg-rose-50"
                          onClick={() => setDeleteTarget({ uid: item.uid, caption: item.caption })}
                        >
                          <Trash2 className="size-3" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-ink-900/10 bg-paper-white shadow-paper">
            <TablePaginationFooter
              page={page}
              totalPages={totalPages}
              total={meta?.total ?? items.length}
              totalLabel="foto dokumentasi"
              pageSize={pageSize}
              pageSizeOptions={[10, 15, 25, 50]}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setPage(1)
              }}
            />
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border-2 border-ink-900/10 bg-paper-white shadow-paper">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line-light bg-paper-paper text-xs font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Foto
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Caption Cerita
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Pembaruan
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-light">
                {paginatedItems.map((item) => {
                  return (
                    <tr key={item.uid} className="transition-colors hover:bg-paper-paper/50">
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="group relative block aspect-video w-20 overflow-hidden rounded-lg border border-ink-900/10 bg-paper-panel"
                        >
                          <img
                            src={item.src}
                            alt={item.caption}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                          />
                        </button>
                      </td>
                      <td className="max-w-md px-5 py-3 font-semibold text-ink-900">
                        <p className="line-clamp-2">{item.caption}</p>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-xs text-ink-500">
                        {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-2 border-ink-900/10 px-2.5 text-xs font-bold text-ink-700 hover:bg-paper-paper"
                            onClick={() => setPreviewItem(item)}
                          >
                            <Eye className="mr-1 size-3.5" />
                            Pratinjau
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-2 border-ink-900/10 px-2.5 text-xs font-bold text-ink-700 hover:bg-paper-paper"
                            onClick={() => setDialogState({ mode: 'edit', item })}
                          >
                            <Pencil className="mr-1 size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-2 border-ink-900/10 px-2.5 text-xs font-bold text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                            onClick={() => setDeleteTarget({ uid: item.uid, caption: item.caption })}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <TablePaginationFooter
            page={page}
            totalPages={totalPages}
            total={meta?.total ?? items.length}
            totalLabel="foto dokumentasi"
            pageSize={pageSize}
            pageSizeOptions={[10, 15, 25, 50]}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setPage(1)
            }}
          />
        </div>
      )}

      {/* Dialog Form Tambah / Edit */}
      <GalleryFormDialog
        open={dialogState.mode !== 'closed'}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        mode={dialogState.mode === 'edit' ? 'edit' : 'create'}
        item={dialogState.mode === 'edit' ? dialogState.item : null}
        onSubmit={handleSubmit}
      />

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus foto dokumentasi?"
        description={
          deleteTarget
            ? `Foto "${deleteTarget.caption}" akan dihapus dari galeri dan tidak akan ditampilkan lagi di website.`
            : undefined
        }
        confirmLabel="Hapus Foto"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteTarget) return
          const uid = deleteTarget.uid
          setDeleteTarget(null)
          try {
            await remove(uid)
            toast.success('Foto dokumentasi berhasil dihapus.')
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gagal menghapus foto dokumentasi.'
            toast.error(msg)
          }
        }}
      />

      {/* Modal Pratinjau Tampilan Scrapbook Asli (Ukuran Besar) */}
      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-3xl sm:max-w-4xl gap-0 overflow-hidden rounded-2xl border-2 border-ink-900/10 p-0 shadow-paper">
          <DialogHeader className="border-b border-line-light bg-paper-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Camera className="size-4 text-brand-ink" />
              <DialogTitle className="line-clamp-1 text-base font-bold text-ink-900">
                Pratinjau Kartu Scrapbook (Tampilan Website)
              </DialogTitle>
            </div>
          </DialogHeader>
          {previewItem ? (
            <div className="relative max-h-[80vh] overflow-y-auto bg-paper-offwhite p-6 sm:p-10">
              <div aria-hidden className={appShellGridOverlayClassName} />
              <div className="relative z-[1] mx-auto w-full max-w-2xl">
                <ScrapbookCard
                  img={{
                    src: previewItem.src,
                    alt: previewItem.caption,
                    caption: previewItem.caption,
                    variant: previewItem.variant ?? undefined,
                  }}
                  globalIdx={previewIndex < 0 ? 0 : previewIndex}
                  aspect="aspect-[16/10]"
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
