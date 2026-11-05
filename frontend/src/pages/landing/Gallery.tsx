import { useEffect, useMemo, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import GuestLayout from '../../components/layouts/GuestLayouts'
import { GALLERY_PREVIEW_COUNT, GalleryBentoGrid } from '@/components/landing/GallerySection'
import HandUnderline from '@/components/playful/HandUnderline'
import {
  StickerStar,
  StickerSparkle,
} from '@/components/playful/Stickers'
import { useDummyGallery } from '@/lib/gallery/dummy-gallery'
import { useSimulateEmpty } from '@/lib/simulation'
import type { GalleryImage } from '@/lib/landing/gallery'

export default function GalleryPage() {
  const [simulateEmpty] = useSimulateEmpty()
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useDummyGallery({
    perPage: GALLERY_PREVIEW_COUNT,
  })
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const photos: GalleryImage[] = useMemo(() => {
    if (simulateEmpty) return []
    return items.map((item) => ({
      src: item.src,
      alt: item.alt,
      caption: item.caption,
      variant: item.variant ?? undefined,
    }))
  }, [items, simulateEmpty])

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return

    const checkBottomReached = () => {
      if (window.scrollY <= 0) return
      const doc = document.documentElement
      const scrolledToPageBottom =
        window.innerHeight + window.scrollY >= doc.scrollHeight - 120

      const sentinel = sentinelRef.current
      const scrolledToGridBottom = sentinel
        ? sentinel.getBoundingClientRect().top <= window.innerHeight - 20 &&
          window.scrollY >= 60
        : false

      if (scrolledToPageBottom || scrolledToGridBottom) {
        void loadMore()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY <= 0) return
      const doc = document.documentElement
      if (doc.scrollHeight <= window.innerHeight + 10) {
        void loadMore()
      }
    }

    window.addEventListener('scroll', checkBottomReached, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      window.removeEventListener('scroll', checkBottomReached)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [hasMore, isLoading, isLoadingMore, loadMore])

  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <main className="w-full">
        <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
          {/* Garis pemisah atas dengan aksen tinta tegas */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ink-900/80" />

          {/* Pola titik dot grid khas kertas */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.14]"
            style={{
              backgroundImage: 'radial-gradient(#050914 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* Dekorasi stiker / doodle taktil di pinggir canvas */}
          <StickerStar className="pointer-events-none absolute right-[5%] top-24 hidden size-10 rotate-12 opacity-80 md:block" />
          <StickerSparkle className="pointer-events-none absolute left-[4%] top-36 hidden size-8 -rotate-12 opacity-70 md:block" />

          <div className="relative z-[1] container mx-auto px-4 pt-20 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-10">
            {/* Header Hero Section */}
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-yellow px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-button -rotate-1">
                Dokumentasi Kegiatan
              </span>

              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.15] [text-wrap:balance]">
                Dokumentasi &{' '}
                <span className="relative inline-block text-brand-blue">
                  Galeri Belajar
                  <HandUnderline draw className="absolute -bottom-2.5 left-0 w-full" />
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-base md:text-lg">
                Dari diskusi materi di kelas sampai sesi eksplorasi santai bareng teman seangkatan — nongkrong, berdiskusi, dan mendokumentasikan semuanya.
              </p>
            </div>

            <div className="mt-10 lg:mt-14">
              <GalleryBentoGrid photos={photos} isLoading={isLoading} />
            </div>

            <div ref={sentinelRef} className="mt-10 flex justify-center">
              {isLoadingMore && (
                <div className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-ink-900 bg-note-yellow px-5 py-2.5 text-xs font-extrabold tracking-wider text-ink-900 uppercase shadow-button">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  <span>Memuat dokumentasi lainnya...</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </GuestLayout>
  )
}
