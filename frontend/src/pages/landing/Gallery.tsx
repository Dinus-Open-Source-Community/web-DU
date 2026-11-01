import { useEffect, useMemo, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import GuestLayout from '../../components/layouts/GuestLayouts'
import { GALLERY_PREVIEW_COUNT, GalleryBentoGrid } from '@/components/landing/GallerySection'
import Reveal from '@/components/playful/Reveal'
import {
  StickerStar,
  StickerSparkle,
} from '@/components/playful/Stickers'
import { useDummyGallery } from '@/lib/gallery/dummy-gallery'
import type { GalleryImage } from '@/lib/landing/gallery'

export default function GalleryPage() {
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useDummyGallery({
    perPage: GALLERY_PREVIEW_COUNT,
  })
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const photos: GalleryImage[] = useMemo(() => {
    return items.map((item) => ({
      src: item.src,
      alt: item.alt,
      caption: item.caption,
      variant: item.variant ?? undefined,
    }))
  }, [items])

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
        <section className="relative min-h-dvh overflow-hidden bg-paper-white">
          {/* Garis pemisah atas dengan aksen tinta tegas */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ink-900/80" />

          {/* Grid grafik kertas */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(5,9,20,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(5,9,20,0.045) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Dekorasi stiker / doodle taktil di pinggir canvas */}
          <StickerStar className="pointer-events-none absolute right-[4%] top-24 hidden size-10 rotate-12 opacity-80 md:block" />
          <StickerSparkle className="pointer-events-none absolute left-[3%] top-36 hidden size-8 -rotate-12 opacity-70 md:block" />

          <div className="relative z-[1] mx-auto max-w-6xl px-6 pt-24 pb-16 md:px-10 md:pt-28 md:pb-24">
            {/* Header: Title Rapi & Enak Dilihat */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <Reveal once={false} y={32} className="max-w-3xl">
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.15] [text-wrap:balance]">
                  Galeri & <span className="text-brand-blue">Dokumentasi</span> Kegiatan
                </h1>
              </Reveal>
            </div>

            <GalleryBentoGrid photos={photos} isLoading={isLoading} />

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
