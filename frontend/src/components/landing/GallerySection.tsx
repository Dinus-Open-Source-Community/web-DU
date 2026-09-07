import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import { GALLERY_IMAGES, type GalleryImage } from '@/lib/landing/gallery'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * GallerySection — papan tempel bento ala scrapbook sungguhan. Tiga "kulit"
 * kartu berputar (Polaroid → Jahitan → Lipatan → …) agar tidak monoton:
 *  1. Polaroid — foto + area putih tebal di bawah, tape di tepi atas foto.
 *  2. Jahitan  — kertas dengan border jahitan (dashed) + binder clip di atas.
 *  3. Lipatan  — pojok terlipat (hard-stop dua warna) + coretan kecil.
 * Struktur baris bento & ukuran (aspect) dipertahankan; hanya kulit kartu yang
 * berganti mengikuti indeks foto global.
 *
 * Aksesibilitas: img.alt ringkas (dibaca sekali); caption tampil sebagai
 * figcaption tanpa menduplikasi alt.
 */

type RowSlot = { cols: string; aspect: string; tilt: string }

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
  [
    { cols: 'md:col-span-7', aspect: 'aspect-[16/10]', tilt: '-rotate-1' },
    { cols: 'md:col-span-5', aspect: 'aspect-[16/11]', tilt: 'rotate-1' },
  ],
  [
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-1' },
    { cols: 'md:col-span-4', aspect: 'aspect-square', tilt: '-rotate-1' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-2' },
  ],
  [
    { cols: 'md:col-span-5', aspect: 'aspect-[16/10]', tilt: 'rotate-2' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: '-rotate-2' },
    { cols: 'md:col-span-3', aspect: 'aspect-[4/5]', tilt: 'rotate-1' },
  ],
  [
    { cols: 'md:col-span-3', aspect: 'aspect-[4/5]', tilt: '-rotate-1' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-1' },
    { cols: 'md:col-span-5', aspect: 'aspect-[16/10]', tilt: '-rotate-1' },
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

/* ============================== 3 varian kulit ============================== */

type PhotoProps = {
  img: GalleryImage
  aspect: string
}

function Photo({ img, aspect }: PhotoProps) {
  return (
    <img
      src={img.src}
      alt={img.alt}
      loading="lazy"
      className={cn(
        'w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]',
        aspect,
      )}
    />
  )
}

/** 1 — POLAROID: foto + area putih tebal bawah utk caption "tulisan tangan". */
function PolaroidCard({ img, aspect }: PhotoProps) {
  return (
    <figure className="group relative flex h-full flex-col rounded-[3px] border border-ink-900/40 bg-paper-white p-2.5 pb-5 shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
      {/* Tape kecil di tepi atas foto */}
      <StickerTape className="absolute top-5 left-1/2 z-10 -translate-x-1/2 -rotate-3" />
      <div className="overflow-hidden border border-ink-900/30 bg-paper-panel">
        <Photo img={img} aspect={aspect} />
      </div>
      {/* Area putih bawah — seperti tulisan tangan di polaroid */}
      <figcaption className="flex flex-1 items-end px-1 pt-4">
        <p className="font-display text-ink-800 w-full text-center text-sm leading-snug font-semibold">
          {img.caption}
        </p>
      </figcaption>
    </figure>
  )
}

/** 2 — JAHITAN: border dashed halus + binder clip di tepi atas. */
function StitchedCard({ img, aspect }: PhotoProps) {
  return (
    <figure className="group relative flex h-full flex-col rounded-[6px] border border-ink-900/30 bg-paper-white p-3 shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
      {/* Jahitan: garis dashed mengikuti tepi dalam */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-1.5 rounded-[3px] border border-dashed border-ink-900/40"
      />
      {/* Binder clip di tepi atas */}
      <div aria-hidden className="absolute -top-1 left-1/2 z-10 -translate-x-1/2">
        <div className="mx-auto h-2.5 w-6 rounded-t-sm border-2 border-b-0 border-ink-900/70 bg-paper-panel" />
        <div className="mx-auto h-0.5 w-7 bg-ink-900/50" />
      </div>
      <div className="overflow-hidden border border-ink-900/20 bg-paper-panel">
        <Photo img={img} aspect={aspect} />
      </div>
      <figcaption className="px-1 pt-2.5 pb-0.5">
        <p className="text-ink-600 text-[11px] leading-snug font-bold tracking-wide uppercase">
          {img.caption}
        </p>
      </figcaption>
    </figure>
  )
}

/** 3 — LIPATAN: pojok terlipat (hard-stop) + lingkaran coret kecil. */
function FoldedCard({ img, aspect }: PhotoProps) {
  return (
    <figure className="group relative flex h-full flex-col rounded-[4px] bg-paper-white shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
      {/* Pojok terlipat kanan-atas: segitiga kertas lebih gelap (hard-stop) */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[4px]"
        style={{
          background:
            'linear-gradient(135deg, #DDE1E6 0 20px, #EDEFF2 20px 22px, transparent 22px)',
        }}
      />
      {/* Coretan doodle kecil */}
      <div
        aria-hidden
        className="absolute top-2 left-2 size-7 rounded-full border-2 border-brand-ink/40"
      />
      <div className="relative overflow-hidden bg-paper-panel">
        <Photo img={img} aspect={aspect} />
      </div>
      <figcaption className="relative px-3 pt-2 pb-3">
        <p className="text-ink-600 text-xs leading-snug font-semibold italic">{img.caption}</p>
      </figcaption>
    </figure>
  )
}

/** Pilih kulit kartu berdasarkan indeks foto global (putar 3 varian). */
function ScrapbookCard({ img, globalIdx, aspect }: { img: GalleryImage; globalIdx: number; aspect: string }) {
  const variant = globalIdx % 3
  if (variant === 0) return <PolaroidCard img={img} aspect={aspect} />
  if (variant === 1) return <StitchedCard img={img} aspect={aspect} />
  return <FoldedCard img={img} aspect={aspect} />
}

/* ============================== Section ============================== */

export default function GallerySection() {
  const { gallery } = LANDING_COPY
  const photos = GALLERY_IMAGES
  const rowSizes = BENTO_ROWS.map((r) => r.length)
  const rows = chunkRows(photos, rowSizes)

  // Offsets baris: indeks global foto pertama tiap baris (varian & rotasi
  // konsisten lintas baris). Dihitung dengan loop murni (tanpa side-effect).
  const rowStartIdx: number[] = []
  {
    let acc = 0
    for (const row of rows) {
      rowStartIdx.push(acc)
      acc += row.length
    }
  }

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
          <div className="mt-16 flex flex-col gap-8 md:gap-10">
            {rows.map((rowPhotos, rowIdx) => {
              const slotDefs = BENTO_ROWS[rowIdx % BENTO_ROWS.length]
              return (
                <div
                  key={rowIdx}
                  className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 md:grid-cols-12 md:gap-7"
                >
                  {rowPhotos.map((img, i) => {
                    const gIdx = rowStartIdx[rowIdx] + i
                    const slot: RowSlot =
                      rowPhotos.length === 1
                        ? { cols: COL_SPANS[12], aspect: 'aspect-[16/9]', tilt: '-rotate-1' }
                        : (slotDefs[i % slotDefs.length] ?? {
                            cols: COL_SPANS[4],
                            aspect: 'aspect-[4/3]',
                            tilt: 'rotate-1',
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
                        {/* Rotasi di luar (kulit) — scrapbook miring halus */}
                        <div className={cn('h-full', slot.tilt)}>
                          <ScrapbookCard img={img} globalIdx={gIdx} aspect={slot.aspect} />
                        </div>
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
