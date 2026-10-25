import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import MentorCard from '@/components/landing/MentorCard'
import { LANDING_COPY } from '@/lib/landing/copy'
import { usePublicMentors } from '@/hooks/use-public-mentors'
import type { LandingMentor } from '@/lib/landing/mentors'

/** Jumlah mentor pratinjau di beranda — selebihnya di halaman /mentors. */
export const MENTOR_PREVIEW_COUNT = 4

/**
 * Mentors — grid kartu profil persegi: foto, nama, course yang diajar,
 * sosmed. Klik kartu membuka modal detail mentor.
 */
export default function MentorsSection() {
  const { mentors } = LANDING_COPY
  const { data, isLoading, isError } = usePublicMentors()
  const preview: LandingMentor[] = data?.mentors.map((mentor) => ({
    uid: mentor.uid,
    name: mentor.name,
    email: mentor.email,
    role: mentor.role,
    photo: mentor.avatar_url,
    courses: [],
    assignedCourses: mentor.assigned_courses,
    joinedTeachingCourses: mentor.joined_teach_courses,
    isVerified: mentor.is_verified,
    createdAt: mentor.created_at,
    socials: mentor.social_links ?? [],
  })) ?? []

  return (
    <section id="mentor" className="relative overflow-hidden bg-paper-offwhite">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:py-28">
        {/* Header kiri + angka editorial — istirahat dari header sentris */}
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow={mentors.eyebrow}
              title={mentors.title}
              copy={mentors.copy}
              align="left"
            />
          </div>
          <div className="hidden lg:col-span-5 lg:block">
            <p
              aria-hidden
              className="font-display text-ink-900/10 text-right text-[clamp(5rem,10vw,9rem)] leading-[0.8] font-bold tracking-tight select-none"
            >
              03
            </p>
            <p className="text-ink-400 mt-2 text-right text-xs font-extrabold tracking-[0.2em] uppercase">
              mentor aktif · next.js & laravel
            </p>
          </div>
          <p className="text-ink-400 mt-3 text-xs font-extrabold tracking-[0.2em] uppercase lg:hidden">
            mentor aktif · next.js & laravel
          </p>
        </div>

        {/* Grid kartu profil kompak */}
        {isLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5" aria-label="Memuat mentor">
            {Array.from({ length: MENTOR_PREVIEW_COUNT }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-[20px] bg-ink-900/10" />)}
          </div>
        ) : isError ? (
          <p className="text-ink-600 mt-10 text-center">Data mentor belum dapat dimuat.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {preview.slice(0, MENTOR_PREVIEW_COUNT).map((mentor, i) => <MentorCard key={mentor.uid} mentor={mentor} index={i} />)}
          </div>
        )}

        <Reveal className="mt-10 flex justify-center sm:mt-14">
          <Link
            to={mentors.allHref}
            className="group/btn text-ink-900 hover:bg-note-yellow focus-visible:ring-brand-blue/50 inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-ink-900 bg-paper-white px-6 text-sm font-extrabold tracking-wider uppercase shadow-button outline-none transition-all focus-visible:ring-4"
          >
            {mentors.allLabel}
            <ArrowRight className="size-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
