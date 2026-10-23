import { useMemo } from 'react'
import GuestLayout from '../../components/layouts/GuestLayouts'
import { GalleryBentoGrid } from '@/components/landing/GallerySection'
import SectionHeader from '@/components/playful/SectionHeader'
import { useDummyGallery } from '@/lib/gallery/dummy-gallery'
import { LANDING_COPY } from '@/lib/landing/copy'
import type { GalleryImage } from '@/lib/landing/gallery'

export default function GalleryPage() {
  const { gallery } = LANDING_COPY
  const { items } = useDummyGallery()

  const photos: GalleryImage[] = useMemo(() => {
    return items.map((item) => ({
      src: item.src,
      alt: item.alt,
      caption: item.caption,
      variant: item.variant ?? undefined,
    }))
  }, [items])

  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <main className="w-full">
        <section className="relative overflow-hidden bg-paper-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(5,9,20,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(5,9,20,0.055) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-[1] mx-auto max-w-6xl px-6 pt-24 pb-16 md:px-10 md:pt-28 md:pb-24">
            <SectionHeader
              eyebrow={gallery.eyebrow}
              title={gallery.title}
              copy={gallery.copy}
              className="mx-auto max-w-3xl"
            />

            <GalleryBentoGrid photos={photos} />
          </div>
        </section>
      </main>
    </GuestLayout>
  )
}
