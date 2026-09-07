import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import { GALLERY_IMAGES } from '@/lib/landing/gallery'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * GallerySection — "papan tempel" foto kegiatan DOSCOM. Foto sumber
 * berbentuk portrait, jadi bingkainya ikut portrait (3:4) — tidak dipaksa
 * 16:9. Komposisi: satu foto besar di kiri (jangkar), dua foto kecil
 * tumpang-tindih di kanan dengan rotasi beda — kesan scrapbook, bukan grid.
 * Sumber: GALLERY_IMAGES (public/images).
 */

const FEATURED_IMG = GALLERY_IMAGES[0]
const SIDE_IMGS = GALLERY_IMAGES.slice(1)

export default function GallerySection() {
  const { gallery } = LANDING_COPY

  return (
    <section id="galeri" className="relative overflow-hidden bg-paper-white">
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          eyebrow={gallery.eyebrow}
          title={gallery.title}
          copy={gallery.copy}
          className="mx-auto max-w-3xl"
        />

        {GALLERY_IMAGES.length === 0 ? null : (
          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
            {/* Foto jangkar besar (kiri) */}
            <Reveal className="md:col-span-7">
              <figure className="group relative -rotate-1 rounded-[24px] border-2 border-ink-900 bg-paper-white p-3 pb-0 shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-button-hover">
                <StickerTape className="absolute -top-3 left-8 -rotate-6" />
                <StickerTape className="absolute -top-3 right-8 rotate-6" />
                <div className="overflow-hidden rounded-[16px] border-2 border-ink-900">
                  {FEATURED_IMG ? (
                    <img
                      src={FEATURED_IMG.src}
                      alt={FEATURED_IMG.alt}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] sm:aspect-[3/3.4]"
                    />
                  ) : null}
                </div>
                <figcaption className="px-2 py-3">
                  <p className="text-ink-600 text-sm leading-snug font-semibold italic">
                    {FEATURED_IMG?.alt}
                  </p>
                </figcaption>
              </figure>
            </Reveal>

            {/* Dua foto kecil (kanan) — dirapel biar menempel */}
            <div className="flex flex-col justify-center gap-10 md:col-span-5 md:gap-8">
              {SIDE_IMGS.map((img, i) => (
                <Reveal key={img.src} delay={(i + 1) * 0.1}>
                  <figure
                    className={cn(
                      'group relative overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white p-2.5 shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover',
                      i === 0 ? 'md:ml-6 md:rotate-2' : 'md:mr-4 md:-rotate-1',
                    )}
                  >
                    <div className="overflow-hidden rounded-[14px] border-2 border-ink-900">
                      <img
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        className="aspect-[3/4] w-full max-w-[420px] object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                    <figcaption className="px-2 pt-2 pb-1">
                      <p className="text-ink-600 text-xs leading-snug font-semibold italic">{img.alt}</p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
