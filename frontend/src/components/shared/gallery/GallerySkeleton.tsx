import { Skeleton } from '@/components/ui/skeleton'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

type GallerySkeletonProps = {
  viewMode: 'grid' | 'table'
  count?: number
}

/**
 * Placeholder daftar galeri. Dipakai saat data masih dimuat agar halaman tidak
 * jatuh ke empty state ("Belum ada foto galeri") sebelum request selesai.
 */
export function GallerySkeleton({ viewMode, count = 15 }: GallerySkeletonProps) {
  return (
    <div role="status" aria-busy>
      <span className="sr-only">Memuat foto galeri...</span>
      {viewMode === 'grid' ? (
        <GalleryGridSkeleton count={count} />
      ) : (
        <GalleryTableSkeleton count={count} />
      )}
    </div>
  )
}

function GalleryGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden
          className={cn(
            appCardClassName,
            'pointer-events-none flex flex-col overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper',
          )}
        >
          {/* Thumbnail */}
          <Skeleton className="aspect-[16/10] w-full rounded-none border-b border-ink-900/10" />

          {/* Caption + footer */}
          <div className="flex flex-1 flex-col gap-2 p-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-3/4 rounded-md" />
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-line-light pt-2">
              <Skeleton className="h-2.5 w-14 rounded-md" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-7 w-14 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function GalleryTableSkeleton({ count }: { count: number }) {
  return (
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
            {Array.from({ length: count }).map((_, index) => (
              <tr key={index} aria-hidden>
                <td className="px-5 py-3">
                  <Skeleton className="aspect-video w-20 rounded-lg" />
                </td>
                <td className="max-w-md px-5 py-3">
                  <Skeleton className="h-4 w-full max-w-sm rounded-md" />
                </td>
                <td className="px-5 py-3">
                  <Skeleton className="h-3 w-20 rounded-md" />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-9 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
