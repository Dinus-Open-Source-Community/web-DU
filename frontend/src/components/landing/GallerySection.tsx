import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type GalleryImage } from '@/lib/landing/gallery'
import { useDummyGallery } from '@/lib/gallery/dummy-gallery'
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
    { cols: 'md:col-span-7', aspect: 'aspect-[16/10]', tilt: '-rotate-1', mobileAspect: 'aspect-[16/10]' },
    { cols: 'md:col-span-5', aspect: 'aspect-[16/11]', tilt: 'rotate-1', mobileAspect: 'aspect-[16/10]' },
  ],
  [
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-1', mobileAspect: 'aspect-[4/3]' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: '-rotate-1', mobileAspect: 'aspect-[4/3]' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-2', mobileAspect: 'aspect-[4/3]' },
  ],
  [
    { cols: 'md:col-span-5', aspect: 'aspect-[16/10]', tilt: 'rotate-2', mobileAspect: 'aspect-[16/10]' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: '-rotate-2', mobileAspect: 'aspect-[4/3]' },
    { cols: 'md:col-span-3', aspect: 'aspect-[4/3]', tilt: 'rotate-1', mobileAspect: 'aspect-[4/3]' },
  ],
  [
    { cols: 'md:col-span-3', aspect: 'aspect-[4/3]', tilt: '-rotate-1', mobileAspect: 'aspect-[4/3]' },
    { cols: 'md:col-span-4', aspect: 'aspect-[4/3]', tilt: 'rotate-1', mobileAspect: 'aspect-[4/3]' },
    { cols: 'md:col-span-5', aspect: 'aspect-[16/10]', tilt: '-rotate-1', mobileAspect: 'aspect-[16/10]' },
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
    <div className="relative overflow-hidden">
      <img
        src={img.src}
        alt={img.alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'w-full object-cover object-center transition-transform duration-300 group-hover:scale-105',
          aspectCls,
        )}
      />
    </div>
  )
}

/** 0 — KERTAS SOBEK: potongan kertas dgn tepi miring/sobek (clip-path). */
function TornPaperCard({ img, aspect, mobileAspect }: PhotoProps) {
  return (
    <figure className="group relative flex h-full flex-col transition-transform duration-300 ease-out">
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
    <figure className="group relative flex h-full flex-col overflow-hidden rounded-[4px] border border-ink-900/20 bg-[#FDFBF3] shadow-paper transition-transform duration-300 ease-out">
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
    <figure className="group relative flex h-full flex-col rounded-[3px] border border-ink-900/30 bg-paper-white p-2.5 pb-5 shadow-paper transition-transform duration-300 ease-out">
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
        'group relative flex h-full flex-col p-3.5 transition-transform duration-300 ease-out',
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
    <figure className="group relative flex h-full flex-col overflow-hidden rounded-[6px] border border-[#8A6A45]/40 bg-[#EDE0CB] shadow-paper transition-transform duration-300 ease-out">
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
    <figure className="group relative flex h-full flex-col rounded-[4px] border border-ink-900/35 bg-[#F7F1E3] p-3 shadow-paper transition-transform duration-300 ease-out">
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
export function ScrapbookCard({
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

/* ============================== Grid bento ============================== */

/** Jumlah foto pratinjau di beranda — 2 baris bento penuh (2 + 3). */
export const GALLERY_PREVIEW_COUNT = 5

/** Grid bento scrapbook — dipakai beranda (pratinjau) & halaman galeri (penuh). */
export function GalleryBentoGrid({ photos }: { photos: GalleryImage[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  useEffect(() => {
    if (activeIdx === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1))
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIdx, photos.length])

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

  if (rows.length === 0) {
    return (
      <p className="text-ink-500 mt-10 text-center text-sm font-bold uppercase tracking-[0.2em] sm:mt-16">
        Dokumentasi segera hadir.
      </p>
    )
  }

  return (
    <>
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
                    {/* Rotasi di luar (kulit) — scrapbook miring halus + interaktif klik untuk lihat detail */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveIdx(gIdx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setActiveIdx(gIdx)
                        }
                      }}
                      className={cn(
                        'h-full cursor-pointer rounded-xl transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
                        slot.tilt,
                      )}
                      title={`Klik untuk melihat detail foto: ${img.caption}`}
                    >
                      <ScrapbookCard img={img} globalIdx={gIdx} aspect={slot.aspect} mobileAspect={slot.mobileAspect} />
                    </div>
                  </Reveal>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Modal Popup Pratinjau Detail Foto — Immersive Cinematic Lightbox */}
      {activeIdx !== null && photos[activeIdx] && (
        <Dialog open={activeIdx !== null} onOpenChange={(open) => !open && setActiveIdx(null)}>
          <DialogContent className="flex max-h-[94vh] w-[96vw] sm:max-w-[92vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl border-2 border-ink-900 bg-paper-white p-0 shadow-[0_20px_50px_rgba(5,9,20,0.3)]">
            <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b-2 border-ink-900/10 bg-paper-white px-5 py-3 sm:px-6 sm:py-3.5 pr-14 sm:pr-16">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg border border-ink-900/15 bg-brand-soft text-brand-ink shadow-xs">
                  <Camera className="size-4" aria-hidden />
                </span>
                <DialogTitle className="line-clamp-1 text-sm font-extrabold uppercase tracking-wide text-ink-900 sm:text-base">
                  Dokumentasi DOSCOM
                </DialogTitle>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-ink-900/15 bg-note-yellow px-3 py-1 font-mono text-xs font-bold text-ink-900 shadow-xs">
                  {activeIdx + 1} / {photos.length}
                </span>
              </div>
            </DialogHeader>

            {/* Stage: Dark Navy Blueprint Canvas for Crisp Photo Display */}
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#0A101D]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 opacity-40"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Main Photo: Large & 100% Uncropped */}
              <div className="relative z-[1] flex min-h-[48vh] max-h-[66vh] w-full flex-1 items-center justify-center p-3 sm:p-6 md:p-8">
                <img
                  src={photos[activeIdx].src}
                  alt={photos[activeIdx].alt}
                  className="max-h-[58vh] sm:max-h-[62vh] w-auto max-w-full rounded-xl border border-white/15 object-contain shadow-[0_16px_48px_rgba(0,0,0,0.7)]"
                />

                {/* Left Arrow Button */}
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1))
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border-2 border-ink-900 bg-paper-white text-ink-900 shadow-button transition hover:bg-brand-blue hover:text-white hover:scale-105 active:scale-95 sm:left-6"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="size-6 stroke-[2.5]" />
                  </button>
                )}

                {/* Right Arrow Button */}
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveIdx((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0))
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border-2 border-ink-900 bg-paper-white text-ink-900 shadow-button transition hover:bg-brand-blue hover:text-white hover:scale-105 active:scale-95 sm:right-6"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="size-6 stroke-[2.5]" />
                  </button>
                )}
              </div>

              {/* Bottom Thumbnail Strip (Quick Thumbnails Bar) */}
              {photos.length > 1 && (
                <div className="relative z-[1] flex w-full items-center justify-center gap-2 overflow-x-auto border-t border-white/10 bg-black/40 px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {photos.map((p, pIdx) => {
                    const isCurrent = pIdx === activeIdx
                    return (
                      <button
                        key={`${p.src}-${pIdx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveIdx(pIdx)
                        }}
                        className={cn(
                          'relative aspect-video h-11 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                          isCurrent
                            ? 'border-brand-blue scale-105 opacity-100 ring-2 ring-brand-blue/50'
                            : 'border-white/20 opacity-50 hover:opacity-90 hover:border-white/50',
                        )}
                        title={`Lihat foto ${pIdx + 1}: ${p.caption}`}
                      >
                        <img src={p.src} alt={p.alt} className="size-full object-cover" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer: Caption Details */}
            <div className="shrink-0 border-t-2 border-ink-900/10 bg-paper-white px-5 py-3.5 sm:px-6 sm:py-4">
              <p className="font-sans text-base font-extrabold text-ink-900 sm:text-lg leading-snug">
                {photos[activeIdx].caption}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

/* ============================== Section ============================== */

export default function GallerySection() {
  const { gallery } = LANDING_COPY
  const { items } = useDummyGallery()
  const photos: GalleryImage[] = useMemo(() => {
    return items.slice(0, GALLERY_PREVIEW_COUNT).map((item) => ({
      src: item.src,
      alt: item.alt,
      caption: item.caption,
      variant: item.variant ?? undefined,
    }))
  }, [items])

  return (
    <section id="galeri" className="relative overflow-hidden bg-paper-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(5,9,20,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(5,9,20,0.045) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative z-[1] mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24 lg:py-28">
        <SectionHeader
          eyebrow={gallery.eyebrow}
          title={gallery.title}
          copy={gallery.copy}
          className="mx-auto max-w-3xl"
        />

        <GalleryBentoGrid photos={photos} />

        <Reveal className="mt-10 flex justify-center sm:mt-14">
          <Link
            to={gallery.allHref}
            className="group/btn text-ink-900 hover:bg-note-yellow focus-visible:ring-brand-blue/50 inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-ink-900 bg-paper-white px-6 text-sm font-extrabold tracking-wider uppercase shadow-button outline-none transition-all focus-visible:ring-4"
          >
            {gallery.allLabel}
            <ArrowRight className="size-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
