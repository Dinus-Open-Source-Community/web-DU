import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { GALLERY_IMAGES, type GalleryImage } from '@/lib/landing/gallery'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * GallerySection — papan tempel bento ala scrapbook sungguhan. Enam "kulit"
 * kartu berputar (index % 6) agar tidak monoton:
 *  0 KertasSobek    — potongan kertas majalah/kraft, tepi miring (clip-path).
 *  1 NotebookPolos  — halaman buku tulis: garis horizontal + lubang jilid.
 *  2 PolaroidWarna  — polaroid dgn washi tape warna pastel + caption font-hand.
 *  3 PatchKertas    — kertas pastel solid, sudut terpotong, foto "dipaste".
 *  4 LabelKraft     — label kraft + tali/benang + caption spidol.
 *  5 KartuPos       — kartu pos krem: bingkai ganda + perangko + stempel.
 * Struktur baris bento & ukuran (aspect) dipertahankan; hanya kulit kartu yang
 * berputar mengikuti indeks foto global.
 *
 * Aksesibilitas: img.alt ringkas (dibaca sekali); caption tampil sebagai
 * figcaption tanpa menduplikasi alt.
 */

type RowSlot = { cols: string; aspect: string; tilt: string; mobileAspect?: string }

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
    { cols: 'md:col-span-7', aspect: 'aspect-[16/10]', tilt: '-rotate-1', mobileAspect: 'aspect-square' },
    { cols: 'md:col-span-5', aspect: 'aspect-[16/11]', tilt: 'rotate-1', mobileAspect: 'aspect-square' },
  ],
  [
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-1', mobileAspect: 'aspect-square' },
    { cols: 'md:col-span-4', aspect: 'aspect-square', tilt: '-rotate-1', mobileAspect: 'aspect-square' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-2', mobileAspect: 'aspect-square' },
  ],
  [
    { cols: 'md:col-span-5', aspect: 'aspect-[16/10]', tilt: 'rotate-2', mobileAspect: 'aspect-square' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: '-rotate-2', mobileAspect: 'aspect-square' },
    { cols: 'md:col-span-3', aspect: 'aspect-[4/5]', tilt: 'rotate-1', mobileAspect: 'aspect-square' },
  ],
  [
    { cols: 'md:col-span-3', aspect: 'aspect-[4/5]', tilt: '-rotate-1', mobileAspect: 'aspect-square' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-1', mobileAspect: 'aspect-square' },
    { cols: 'md:col-span-5', aspect: 'aspect-[16/10]', tilt: '-rotate-1', mobileAspect: 'aspect-[4/3]' },
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

/* ============================== 6 varian kulit ============================== */

type PhotoProps = {
  img: GalleryImage
  aspect: string
  /** Aspect lebih landai untuk layar < md (mobile hemat tinggi). */
  mobileAspect?: string
}

function Photo({ img, aspect, mobileAspect }: PhotoProps) {
  const aspectCls = mobileAspect ? cn(mobileAspect, `md:${aspect}`) : aspect
  return (
    <img
      src={img.src}
      alt={img.alt}
      loading="lazy"
      decoding="async"
      // width/height intrinsik + aspect container mencegah layout-shift
      className={cn(
        'w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]',
        aspectCls,
      )}
    />
  )
}

/** 0 — KERTAS SOBEK: potongan kertas dgn tepi miring/sobek (clip-path). */
function TornPaperCard({ img, aspect, mobileAspect }: PhotoProps) {
  return (
    <figure className="group relative flex h-full flex-col transition-transform duration-300 ease-out hover:-translate-y-1.5">
      <div
        className="flex h-full flex-col bg-paper-white p-3"
        style={{
          clipPath:
            'polygon(0 4%, 96% 0, 100% 18%, 99% 84%, 94% 100%, 3% 97%, 0 82%)',
          filter: 'drop-shadow(0 10px 14px rgba(5,9,20,0.16))',
        }}
      >
        <div className="overflow-hidden border border-ink-900/25 bg-paper-panel">
          <Photo img={img} aspect={aspect} mobileAspect={mobileAspect} />
        </div>
        <figcaption className="px-1 pt-2.5 pb-1">
          <p className="font-marker text-ink-700 text-sm leading-snug -rotate-1">
            {img.caption}
          </p>
        </figcaption>
      </div>
    </figure>
  )
}

/** 1 — NOTEBOOK POLOS: halaman buku tulis (garis + margin merah + lubang jilid). */
function NotebookCard({ img, aspect, mobileAspect }: PhotoProps) {
  return (
    <figure className="group relative flex h-full flex-col overflow-hidden rounded-[4px] border border-ink-900/20 bg-[#FDFBF3] shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
      {/* Garis horizontal halaman */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent 0 26px, rgba(5,9,20,0.09) 26px 27px)',
        }}
      />
      {/* Margin merah muda kiri (khas buku tulis) */}
      <div aria-hidden className="absolute inset-y-0 left-4 w-px bg-note-pink/60" />
      {/* Lubang jilid kiri */}
      <div aria-hidden className="absolute top-1/2 left-1.5 flex -translate-y-1/2 flex-col gap-4">
        {[0, 1, 2].map((h) => (
          <span key={h} className="size-2 rounded-full border border-ink-900/20 bg-[#FDFBF3]" />
        ))}
      </div>
      <div className="relative m-3 ml-7 overflow-hidden border border-ink-900/20 bg-paper-white shadow-[0_2px_6px_rgba(5,9,20,0.12)]">
        <Photo img={img} aspect={aspect} mobileAspect={mobileAspect} />
      </div>
      <figcaption className="relative px-3 pt-1.5 pb-3 pl-7">
        <p className="font-hand text-ink-700 text-sm leading-snug font-medium">{img.caption}</p>
      </figcaption>
    </figure>
  )
}

/** 2 — POLAROID WARNA: washi tape warna pastel + area putih bawah. */
function PolaroidColorCard({ img, aspect, idx, mobileAspect }: PhotoProps & { idx: number }) {
  const tapeColors = ['bg-note-pink/80', 'bg-note-mint/80', 'bg-note-sky/80', 'bg-note-peach/80']
  return (
    <figure className="group relative flex h-full flex-col rounded-[3px] border border-ink-900/30 bg-paper-white p-2.5 pb-5 shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
      {/* Washi tape warna */}
      <span
        aria-hidden
        className={cn(
          'absolute top-4 left-1/2 z-10 h-[16px] w-16 -translate-x-1/2 -rotate-3 opacity-90',
          tapeColors[idx % tapeColors.length],
        )}
      />
      <div className="overflow-hidden border border-ink-900/20 bg-paper-panel">
        <Photo img={img} aspect={aspect} mobileAspect={mobileAspect} />
      </div>
      <figcaption className="flex flex-1 items-end px-1 pt-4">
        <p className="font-hand text-ink-800 w-full text-center text-sm leading-snug font-semibold">
          {img.caption}
        </p>
      </figcaption>
    </figure>
  )
}

/** 3 — PATCH KERTAS WARNA: pastel solid, sudut terpotong, foto "dipaste". */
function PatchCard({ img, aspect, idx, mobileAspect }: PhotoProps & { idx: number }) {
  const patchBg = [
    'bg-note-yellow',
    'bg-note-mint',
    'bg-note-peach',
    'bg-note-pink',
    'bg-note-sky',
    'bg-note-lavender',
  ]
  return (
    <figure
      className={cn(
        'group relative flex h-full flex-col p-3.5 transition-transform duration-300 ease-out hover:-translate-y-1.5',
        patchBg[idx % patchBg.length],
      )}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
        filter: 'drop-shadow(0 8px 12px rgba(5,9,20,0.14))',
      }}
    >
      <div className="overflow-hidden border-2 border-paper-white bg-paper-white shadow-[0_3px_0_rgba(5,9,20,0.18)]">
        <Photo img={img} aspect={aspect} mobileAspect={mobileAspect} />
      </div>
      <figcaption className="px-1 pt-2.5 pb-0.5">
        <p className="font-marker text-ink-900 text-sm leading-snug -rotate-1">
          {img.caption}
        </p>
      </figcaption>
    </figure>
  )
}

/** 4 — LABEL KRAFT + TALI: kertas kraft, tali/benang di atas, caption spidol. */
function KraftLabelCard({ img, mobileAspect }: PhotoProps) {
  return (
    <figure className="group relative flex h-full flex-col overflow-hidden rounded-[6px] border border-[#8A6A45]/40 bg-[#EDE0CB] shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
      {/* Tali/benang horizontal di atas */}
      <div aria-hidden className="absolute inset-x-0 top-0 z-10 flex justify-center">
        <div className="h-[7px] w-full border-y-2 border-dashed border-[#8A6A45]/50" />
      </div>
      {/* Foto "digantung" — kotak, bukan bulat */}
      <div className="mx-auto mt-5 w-4/5 overflow-hidden rounded-[12px] border-[3px] border-paper-white shadow-paper sm:mt-7">
        <div className="overflow-hidden">
          <Photo img={img} aspect="aspect-[4/3]" mobileAspect={mobileAspect ?? 'aspect-[4/3]'} />
        </div>
      </div>
      <figcaption className="flex flex-1 items-end px-3 pt-2 pb-3 sm:pt-3">
        <p className="font-marker text-[#4A3623] w-full text-center text-sm leading-snug -rotate-1">
          {img.caption}
        </p>
      </figcaption>
    </figure>
  )
}

/** 5 — KARTU POS JADUL: krem, bingkai ganda, perangko, stempel. */
function PostcardCard({ img, aspect, mobileAspect }: PhotoProps) {
  return (
    <figure className="group relative flex h-full flex-col rounded-[4px] border border-ink-900/35 bg-[#F7F1E3] p-3 shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover">
      {/* Bingkai dalam dashed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-1.5 rounded-[3px] border border-dashed border-ink-900/25"
      />
      {/* Perangko pojok kanan-atas */}
      <div
        aria-hidden
        className="absolute top-2.5 right-2.5 z-10 grid size-9 place-items-center rounded-[3px] border-2 border-dashed border-ink-900/60 bg-note-sky text-xs text-ink-900/70"
      >
        ✦
      </div>
      {/* Stempel miring pojok kiri-bawah */}
      <div aria-hidden className="absolute bottom-8 left-2 z-10 -rotate-12 opacity-60">
        <p className="font-marker text-brand-ink/70 text-[10px] leading-none">DOSCOM</p>
      </div>
      <div className="mt-4 overflow-hidden border border-ink-900/25 bg-paper-panel">
        <Photo img={img} aspect={aspect} mobileAspect={mobileAspect} />
      </div>
      <figcaption className="px-1 pt-2.5 pb-1">
        <p className="font-hand text-ink-700 text-sm leading-snug font-medium">{img.caption}</p>
      </figcaption>
    </figure>
  )
}

/** Pilih kulit kartu berdasarkan indeks foto global (putar 6 varian). */
function ScrapbookCard({
  img,
  globalIdx,
  aspect,
  mobileAspect,
}: {
  img: GalleryImage
  globalIdx: number
  aspect: string
  mobileAspect?: string
}) {
  const variant = img.variant ?? globalIdx % 6
  if (variant === 0) return <TornPaperCard img={img} aspect={aspect} mobileAspect={mobileAspect} />
  if (variant === 1) return <NotebookCard img={img} aspect={aspect} mobileAspect={mobileAspect} />
  if (variant === 2) return <PolaroidColorCard img={img} aspect={aspect} idx={globalIdx} mobileAspect={mobileAspect} />
  if (variant === 3) return <PatchCard img={img} aspect={aspect} idx={globalIdx} mobileAspect={mobileAspect} />
  if (variant === 4) return <KraftLabelCard img={img} aspect={aspect} mobileAspect={mobileAspect} />
  return <PostcardCard img={img} aspect={aspect} mobileAspect={mobileAspect} />
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
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24 lg:py-28">
        <SectionHeader
          eyebrow={gallery.eyebrow}
          title={gallery.title}
          copy={gallery.copy}
          className="mx-auto max-w-3xl"
        />

        {rows.length === 0 ? (
          <p className="text-ink-500 mt-10 text-center text-sm font-bold uppercase tracking-[0.2em] sm:mt-16">
            Dokumentasi segera hadir.
          </p>
        ) : (
          <div className="mt-10 flex flex-col gap-6 sm:mt-16 md:gap-8">
            {rows.map((rowPhotos, rowIdx) => {
              const slotDefs = BENTO_ROWS[rowIdx % BENTO_ROWS.length]
              return (
                <div
                  key={rowIdx}
                  className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-12 md:gap-7"
                >
                  {rowPhotos.map((img, i) => {
                    const gIdx = rowStartIdx[rowIdx] + i
                    const slot: RowSlot =
                      rowPhotos.length === 1
                        ? { cols: COL_SPANS[12], aspect: 'aspect-[16/9]', tilt: '-rotate-1', mobileAspect: 'aspect-[16/9]' }
                        : (slotDefs[i % slotDefs.length] ?? {
                            cols: COL_SPANS[4],
                            aspect: 'aspect-[4/3]',
                            tilt: 'rotate-1',
                            mobileAspect: 'aspect-square',
                          })
                    const isLastOdd = rowPhotos.length % 2 === 1 && i === rowPhotos.length - 1
                    return (
                      <Reveal
                        key={`${img.src}-${rowIdx}-${i}`}
                        delay={(i % 3) * 0.08}
                        className={cn(
                          'h-full col-span-1',
                          isLastOdd && 'col-span-2',
                          slot.cols,
                        )}
                      >
                        {/* Rotasi di luar (kulit) — scrapbook miring halus */}
                        <div className={cn('h-full', slot.tilt)}>
                          <ScrapbookCard img={img} globalIdx={gIdx} aspect={slot.aspect} mobileAspect={slot.mobileAspect} />
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
