import GuestLayout from '../../components/layouts/GuestLayouts'
import { GalleryBentoGrid } from '@/components/landing/GallerySection'
import SectionHeader from '@/components/playful/SectionHeader'
import { GALLERY_IMAGES } from '@/lib/landing/gallery'
import { LANDING_COPY } from '@/lib/landing/copy'

export default function GalleryPage() {
  const { gallery } = LANDING_COPY

  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <main className="w-full">
        <section className="relative overflow-hidden bg-paper-white">
          <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-16 md:px-10 md:pt-28 md:pb-24">
            <SectionHeader
              eyebrow={gallery.eyebrow}
              title={gallery.title}
              copy={gallery.copy}
              className="mx-auto max-w-3xl"
            />

            <GalleryBentoGrid photos={GALLERY_IMAGES} />
          </div>
        </section>
      </main>
    </GuestLayout>
  )
}
