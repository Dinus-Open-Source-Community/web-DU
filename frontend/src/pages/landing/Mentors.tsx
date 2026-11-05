import { useEffect, useMemo, useRef } from 'react'
import { Loader2, Users } from 'lucide-react'
import GuestLayout from '../../components/layouts/GuestLayouts'
import MentorCard from '@/components/landing/MentorCard'
import HandUnderline from '@/components/playful/HandUnderline'
import {
  StickerStar,
  StickerSparkle,
} from '@/components/playful/Stickers'
import { cn } from '@/lib/utils'
import { useInfinitePublicMentors } from '@/hooks/use-public-mentors'
import { toLandingMentor, type LandingMentor } from '@/lib/landing/mentors'

const TILTS = ['-rotate-1', 'rotate-1', 'rotate-1', '-rotate-1'] as const
const MENTORS_PER_PAGE = 8

export default function MentorsPage() {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePublicMentors(MENTORS_PER_PAGE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const mentorItems: LandingMentor[] = useMemo(() => {
    const pages = data?.pages ?? []
    const seen = new Set<string>()
    const list: LandingMentor[] = []
    for (const page of pages) {
      for (const mentor of page.mentors ?? []) {
        if (seen.has(mentor.uid)) continue
        seen.add(mentor.uid)
        list.push(toLandingMentor(mentor))
      }
    }
    return list
  }, [data?.pages])

  useEffect(() => {
    if (!hasNextPage || isLoading || isFetchingNextPage) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isLoading, isFetchingNextPage, fetchNextPage])

  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <main className="w-full">
        <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
          {/* Garis pemisah atas beraksen tinta tegas */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ink-900/80" />

          {/* Garis horizontal bergaris buku tulis (ruled lines) khas seksi mentor */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(to bottom, #050914 1px, transparent 1px)',
              backgroundSize: '100% 28px',
            }}
          />

          {/* Stiker & doodle dekorasi */}
          <StickerStar className="pointer-events-none absolute right-[5%] top-24 hidden size-10 rotate-12 opacity-80 md:block" />
          <StickerSparkle className="pointer-events-none absolute left-[4%] top-40 hidden size-8 -rotate-12 opacity-70 md:block" />

          <div className="relative z-[1] container mx-auto px-4 pt-20 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-10">
            {/* Header Hero Section */}
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-yellow px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-button -rotate-1">
                Direktori Mentor
              </span>

              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.15] [text-wrap:balance]">
                Belajar Langsung dari{' '}
                <span className="relative inline-block text-brand-blue">
                  Mentor Praktisi
                  <HandUnderline draw className="absolute -bottom-2.5 left-0 w-full" />
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-base md:text-lg">
                Mentormu praktisi berpengalaman yang siap membimbing langkah belajarmu — bukan sekadar nama di brosur.
              </p>
            </div>

            {/* Konten Grid Kartu Mentor Polaroid */}
            {isLoading && mentorItems.length === 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 sm:mt-14">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-3.5 shadow-paper animate-pulse"
                  />
                ))}
              </div>
            ) : isError && mentorItems.length === 0 ? (
              <p className="text-ink-600 mt-10 min-h-[40vh] text-center">
                Data mentor belum dapat dimuat.
              </p>
            ) : mentorItems.length === 0 ? (
              <div className="mx-auto my-12 max-w-md py-10 text-center">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-note-yellow text-ink-900">
                  <Users className="size-6 text-ink-900" />
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900">
                  Belum Ada Mentor
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Daftar mentor praktisi sedang dalam proses kurasi dan akan segera hadir untuk membimbing langkah belajarmu.
                </p>
              </div>
            ) : (
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 sm:mt-14">
                {mentorItems.map((mentor, i) => (
                  <MentorCard
                    key={mentor.uid}
                    mentor={mentor}
                    index={i}
                    className={cn(TILTS[i % TILTS.length])}
                  />
                ))}
              </div>
            )}

            {/* Loader Infinite Scroll */}
            <div ref={sentinelRef} className="mt-10 flex justify-center">
              {isFetchingNextPage && (
                <div className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-ink-900 bg-note-yellow px-5 py-2.5 text-xs font-extrabold tracking-wider text-ink-900 uppercase shadow-button">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  <span>Memuat mentor lainnya...</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </GuestLayout>
  )
}
