import { ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import { GALLERY_IMAGES } from '@/lib/landing/gallery'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * GallerySection — suasana belajar. Saat GALLERY_IMAGES kosong, tampilkan
 * "papan foto yang menunggu": bingkai kosong miring dengan tape — bukan
 * placeholder mentah. Begitu foto diisi (LAUNCH GATE), beralih ke grid 3 kolom
 * dengan rotasi selang-seling.
 */

const FRAME_TILTS = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'] as const

export default function GallerySection() {
  const { gallery } = LANDING_COPY

  return (
    <section id="galeri" className="relative overflow-hidden bg-paper-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          eyebrow={gallery.eyebrow}
          title={gallery.title}
          copy={gallery.copy}
          className="mx-auto max-w-3xl"
        />

        {GALLERY_IMAGES.length === 0 ? (
          /* ---- Empty state: papan foto yang menunggu ---- */
          <Reveal className="mt-16">
            <div className="relative mx-auto max-w-4xl rounded-[28px] border-2 border-dashed border-ink-900/30 bg-paper-panel px-6 py-14 sm:px-10">
              {/* Tiga bingkai kosong miring "menunggu diisi" */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'relative aspect-[4/3] rounded-xl border-2 border-dashed border-ink-900/40 bg-paper-white shadow-paper',
                      FRAME_TILTS[i % FRAME_TILTS.length],
                    )}
                  >
                    <StickerTape
                      className={cn(
                        'absolute -top-2.5 left-1/2 -translate-x-1/2',
                        i % 2 === 0 ? '-rotate-3' : 'rotate-3',
                      )}
                    />
                    <div className="absolute inset-0 grid place-items-center">
                      <ImagePlus className="size-7 text-ink-900/25" strokeWidth={2} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <h3 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                  {gallery.emptyTitle}
                </h3>
                <p className="text-ink-600 mx-auto mt-2 max-w-md text-base leading-relaxed">
                  {gallery.emptyCopy}
                </p>
              </div>
            </div>
          </Reveal>
        ) : (
          /* ---- Grid foto (aktif saat GALLERY_IMAGES diisi) ---- */
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY_IMAGES.map((img, i) => (
              <Reveal key={img.src} delay={(i % 3) * 0.1}>
                <figure
                  className={cn(
                    'group overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white p-2 shadow-paper transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover',
                    FRAME_TILTS[i % FRAME_TILTS.length],
                  )}
                >
                  <div className="overflow-hidden rounded-[14px]">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
