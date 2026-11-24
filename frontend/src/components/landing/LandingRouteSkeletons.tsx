import type { ReactNode } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import GuestLayout from '@/components/layouts/GuestLayouts'
import { cn } from '@/lib/utils'

const KemiringanKartu = ['-rotate-1', 'rotate-1', 'rotate-1', '-rotate-1'] as const


function LandingSkeletonTheme({ children }: { children: ReactNode }) {
  return (
    <SkeletonTheme baseColor="#ebe6dc" highlightColor="#faf8f5">
      {children}
    </SkeletonTheme>
  )
}

/** 1 Kartu Mentor Polaroid */
export function MentorCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <LandingSkeletonTheme>
      <div
        className={cn(
          'relative flex h-full w-full flex-col justify-between rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-3.5 shadow-paper',
          KemiringanKartu[index % KemiringanKartu.length],
        )}
      >
        <div>
          <Skeleton className="aspect-[4/3] w-full" borderRadius={12} />
          <div className="mt-3">
            <Skeleton height={20} width="75%" />
            <Skeleton height={14} width="50%" className="mt-1.5" />
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-ink-900/15 pt-2.5">
          <Skeleton height={14} width={96} />
          <Skeleton height={24} width={24} borderRadius={8} />
        </div>
      </div>
    </LandingSkeletonTheme>
  )
}

/** 1 Kartu Kursus */
export function CourseCardSkeleton() {
  return (
    <LandingSkeletonTheme>
      <div className="relative flex h-full flex-col justify-between rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-4 shadow-paper">
        <div>
          <Skeleton className="aspect-[16/10] w-full" borderRadius={12} />
          <div className="mt-3.5 flex items-center justify-between border-b border-ink-900/10 pb-2">
            <Skeleton height={14} width={80} />
            <Skeleton height={14} width={56} />
          </div>
          <Skeleton height={20} width="80%" className="mt-2.5" />
          <div className="mt-2">
            <Skeleton count={2} height={14} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-900/10 pt-3">
          <Skeleton height={16} width={96} />
          <Skeleton height={32} width={32} borderRadius={8} />
        </div>
      </div>
    </LandingSkeletonTheme>
  )
}

/** Bento Grid Galeri */
export function GalleryBentoSkeleton() {
  return (
    <LandingSkeletonTheme>
      <div className="space-y-4 sm:space-y-5">
        {/* Baris 1: 7 + 5 */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-12">
          <div className="md:col-span-7 -rotate-1 rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-3 shadow-paper">
            <Skeleton className="aspect-[16/10] w-full" borderRadius={12} />
            <Skeleton height={16} width="65%" className="mt-2.5" />
          </div>
          <div className="md:col-span-5 rotate-1 rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-3 shadow-paper">
            <Skeleton className="aspect-[16/10] md:aspect-[16/11] w-full" borderRadius={12} />
            <Skeleton height={16} width="50%" className="mt-2.5" />
          </div>
        </div>

        {/* Baris 2: 4 + 4 + 4 */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-12">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'md:col-span-4 rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-3 shadow-paper',
                i === 1 ? '-rotate-1' : 'rotate-1',
              )}
            >
              <Skeleton className="aspect-[4/3] w-full" borderRadius={12} />
              <Skeleton height={16} width="60%" className="mt-2.5" />
            </div>
          ))}
        </div>
      </div>
    </LandingSkeletonTheme>
  )
}

function PublicHeaderSkeleton() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
      <Skeleton height={28} width={160} borderRadius={6} />
      <Skeleton height={44} width={420} borderRadius={12} className="mt-4 max-w-full" />
      <Skeleton height={16} width={500} className="mt-4 max-w-full" />
      <Skeleton height={16} width={340} className="mt-2 max-w-full" />
    </div>
  )
}

/** Route Fallback Beranda (/) */
export function HomeRouteFallback() {
  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <LandingSkeletonTheme>
        <main className="w-full overflow-x-clip bg-paper-white">
          <section className="container mx-auto px-4 pt-20 pb-14 sm:px-6 md:pt-24 md:pb-20 lg:px-10">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <Skeleton height={52} width={540} borderRadius={16} className="max-w-full" />
              <Skeleton height={52} width={400} borderRadius={16} className="mt-3 max-w-full" />
              <Skeleton height={16} width={480} className="mt-5 max-w-full" />
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-ink-900/20 bg-paper-offwhite p-5 shadow-paper"
                >
                  <Skeleton height={20} width={180} />
                  <Skeleton height={14} width="75%" className="mt-2.5" />
                </div>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-5xl rounded-2xl border-2 border-ink-900/20 bg-paper-white p-4 shadow-paper">
              <Skeleton height={256} borderRadius={12} />
            </div>
          </section>

          <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </main>
      </LandingSkeletonTheme>
    </GuestLayout>
  )
}

/** Route Fallback Mentor (/mentors) */
export function MentorsRouteFallback() {
  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <LandingSkeletonTheme>
        <main className="w-full">
          <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
            <div className="container mx-auto px-4 pt-20 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-10">
              <PublicHeaderSkeleton />
              <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <MentorCardSkeleton key={i} index={i} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </LandingSkeletonTheme>
    </GuestLayout>
  )
}

/** Route Fallback Kursus (/courses) */
export function CoursesRouteFallback() {
  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <LandingSkeletonTheme>
        <main className="w-full">
          <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
            <div className="container mx-auto px-4 pt-20 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-10">
              <PublicHeaderSkeleton />
              <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Skeleton height={48} borderRadius={12} />
                </div>
                <div className="w-full sm:w-44">
                  <Skeleton height={48} borderRadius={12} />
                </div>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:mt-14">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </LandingSkeletonTheme>
    </GuestLayout>
  )
}

/** Route Fallback Galeri (/gallery) */
export function GalleryRouteFallback() {
  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <LandingSkeletonTheme>
        <main className="w-full">
          <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
            <div className="container mx-auto px-4 pt-20 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-10">
              <PublicHeaderSkeleton />
              <div className="mt-10 lg:mt-14">
                <GalleryBentoSkeleton />
              </div>
            </div>
          </section>
        </main>
      </LandingSkeletonTheme>
    </GuestLayout>
  )
}

/** Route Fallback Detail Kursus (/course/:courseUid) */
export function CourseDetailRouteFallback() {
  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <LandingSkeletonTheme>
        <main className="w-full">
          <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ink-900/80" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: 'radial-gradient(#050914 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />

            <div className="relative z-[1] mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
              <Skeleton height={16} width={140} />

              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Kolom Kiri: Info & Kurikulum Kursus */}
                <div className="space-y-6 lg:col-span-8">
                  <div className="rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-6 shadow-paper">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton height={24} width={96} borderRadius={999} />
                      <Skeleton height={24} width={84} borderRadius={999} />
                    </div>
                    <Skeleton height={36} width="80%" className="mt-4" />
                    <div className="mt-3">
                      <Skeleton count={3} height={14} />
                    </div>
                  </div>

                  {/* Yang akan dipelajari */}
                  <div className="rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-6 shadow-paper">
                    <Skeleton height={24} width={220} />
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} height={18} width="85%" />
                      ))}
                    </div>
                  </div>

                  {/* Daftar Modul */}
                  <div className="rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-6 shadow-paper">
                    <Skeleton height={24} width={180} />
                    <div className="mt-4 space-y-3">
                      {[0, 1, 2].map((i) => (
                        <Skeleton key={i} height={52} borderRadius={12} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Kartu Thumbnail & Tombol Daftar */}
                <div className="lg:col-span-4">
                  <div className="rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-4 shadow-paper">
                    <Skeleton className="aspect-[16/10] w-full" borderRadius={12} />
                    <div className="mt-4 space-y-2.5">
                      <Skeleton height={16} width="70%" />
                      <Skeleton height={16} width="55%" />
                    </div>
                    <div className="mt-5">
                      <Skeleton height={48} borderRadius={12} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </LandingSkeletonTheme>
    </GuestLayout>
  )
}