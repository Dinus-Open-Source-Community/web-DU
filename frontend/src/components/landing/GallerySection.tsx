import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import { GALLERY_IMAGES } from '@/lib/landing/gallery'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * GallerySection — papan tempel bento asimetris ("scrapbook"). Tiap BARIS grid
 * 12 kolom diisi penuh (7+5, 4+4+4, …) sehingga N foto apa pun tersusun tanpa
 * lubang. Foto 16:9, rotasi & tape selang-seling; satu jangkar besar di awal.
 *
 * Aksesibilitas: img.alt ringkas (dibaca sekali); caption cerita tampil sebagai
 * figcaption tanpa menduplikasi alt — tidak dibaca dua kali.
 */

type RowSlot = { cols: string; aspect: string; tilt: string; tape: boolean }

/** Peta kelas col-span (literal — Tailwind JIT butuh string lengkap). */
const COL_SPANS = {
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  7: 'md:col-span-7',
  12: 'md:col-span-12',
} as const

/** Baris bento: tiap sub-array = komposisi kolom yang totalnya 12 (md). */
const BENTO_ROWS: RowSlot[][] = [
  // Baris 1: jangkar besar + satu medium.
  [
    { cols: 'md:col-span-7', aspect: 'aspect-[16/10]', tilt: '-rotate-1', tape: true },
    { cols: 'md:col-span-5', aspect: 'aspect-[16/11]', tilt: 'rotate-1', tape: false },
  ],
  // Baris 2: tiga kartu sama besar.
  [
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-1', tape: true },
    { cols: 'md:col-span-4', aspect: 'aspect-square', tilt: '-rotate-1', tape: false },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-2', tape: true },
  ],
  // Baris 3: medium-lebar + dua kartu.
  [
    { cols: 'md:col-span-5', aspect: 'aspect-[16/10]', tilt: 'rotate-2', tape: true },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: '-rotate-2', tape: false },
    { cols: 'md:col-span-3', aspect: 'aspect-[4/5]', tilt: 'rotate-1', tape: true },
  ],
  // Baris 4: kebalikan baris 3.
  [
    { cols: 'md:col-span-3', aspect: 'aspect-[4/5]', tilt: '-rotate-1', tape: false },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-1', tape: true },
    { cols: 'md:col-span-5', aspect: 'aspect-[16/10]', tilt: '-rotate-1', tape: true },
  ],
]

/** Potong foto menjadi baris-baris bento; baris terakhir menyesuaikan. */
function chunkRows<T>(items: T[], rowSizes: number[]): T[][] {
  const rows: T[][] = []
  let idx = 0
  let row = 0
  while (idx < items.length) {
    const size = Math.min(rowSizes[row % rowSizes.length], items.length - idx)
    rows.push(items.slice(idx, idx + size))
    idx += size
    row += 1
  }
  return rows
}

export default function GallerySection() {
  const { gallery } = LANDING_COPY
  const photos = GALLERY_IMAGES

  // Ukuran baris mengikuti BENTO_ROWS (2,3,3,3 → rata untuk sisa).
  const rowSizes = BENTO_ROWS.map((r) => r.length)
  const rows = chunkRows(photos, rowSizes)

  return (
    <section id="galeri" className="relative overflow-hidden bg-paper-white">
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          eyebrow={gallery.eyebrow}
          title={gallery.title}
          copy={gallery.copy}
          className="mx-auto max-w-3xl"
        />

        {rows.length === 0 ? (
          <p className="text-ink-500 mt-16 text-center text-sm font-bold uppercase tracking-[0.2em]">
            Dokumentasi segera hadir.
          </p>
        ) : (
          <div className="mt-16 flex flex-col gap-6">
            {rows.map((rowPhotos, rowIdx) => {
              const slotDefs = BENTO_ROWS[rowIdx % BENTO_ROWS.length]
              return (
                <div
                  key={rowIdx}
                  className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 md:grid-cols-12 md:gap-6"
                >
                  {rowPhotos.map((img, i) => {
                    // 1 foto sisa di baris terakhir → bentang penuh sebagai penutup.
                    const slot: RowSlot =
                      rowPhotos.length === 1
                        ? { cols: COL_SPANS[12], aspect: 'aspect-[16/9]', tilt: '-rotate-1', tape: true }
                        : (slotDefs[i % slotDefs.length] ?? {
                            cols: COL_SPANS[4],
                            aspect: 'aspect-[4/3]',
                            tilt: 'rotate-1',
                            tape: false,
                          })
                    const isLastOdd = rowPhotos.length % 2 === 1 && i === rowPhotos.length - 1
                    return (
                      <Reveal
                        key={`${img.src}-${rowIdx}-${i}`}
                        delay={(i % 3) * 0.08}
                        className={cn(
                          'h-full sm:col-span-1',
                          isLastOdd && 'sm:col-span-2',
                          slot.cols,
                        )}
                      >
                        <figure
                          className={cn(
                            'group relative flex h-full flex-col rounded-[20px] border-2 border-ink-900 bg-paper-white p-2.5 shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover',
                            slot.tilt,
                          )}
                        >
                          {slot.tape ? (
                            <StickerTape
                              className={cn(
                                'absolute -top-2.5 z-10',
                                (rowIdx + i) % 2 === 0 ? 'left-6 -rotate-6' : 'right-6 rotate-6',
                              )}
                            />
                          ) : null}
                          <div className="overflow-hidden rounded-[14px] border-2 border-ink-900">
                            <img
                              src={img.src}
                              alt={img.alt}
                              loading="lazy"
                              className={cn(
                                'w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]',
                                slot.aspect,
                              )}
                            />
                          </div>
                          <figcaption className="px-2 pt-2.5 pb-1">
                            <p className="text-ink-600 text-xs leading-snug font-semibold italic">
                              {img.caption}
                            </p>
                          </figcaption>
                        </figure>
                      </Reveal>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
