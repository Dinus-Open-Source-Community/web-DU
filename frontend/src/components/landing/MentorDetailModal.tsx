import { ArrowUpRight, BookOpen, LoaderCircle, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { SOCIAL_ICONS } from '@/components/profile/SettingsSocialSection'
import type { LandingMentor } from '@/lib/landing/mentors'
import { socialPlatformLabel } from '@/lib/profile/social-links'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'
import { fetchPublicMentor } from '@/services/mentor'

/** Latar fallback di belakang foto (terlihat saat gambar lambat/gagal). */
const FALLBACK_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach'] as const

type MentorDetailModalProps = {
  mentor: LandingMentor
  index?: number
  /** Pemicu yang membuka modal (kartu mentor). */
  children: React.ReactNode
}

/** Modal detail mentor — foto, bio, course yang diajar, dan sosmed. */
export default function MentorDetailModal({ mentor, index = 0, children }: MentorDetailModalProps) {
  const detailQuery = useQuery({
    queryKey: ['public-mentor', mentor.uid],
    queryFn: () => fetchPublicMentor(mentor.uid),
    enabled: false,
  })
  const assignments = detailQuery.data?.assignments ?? mentor.assignments ?? []

  return (
    <Dialog onOpenChange={(open) => { if (open) void detailQuery.refetch() }}>
      {children}
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] gap-0 overflow-y-auto rounded-[28px] border-2 border-ink-900 bg-paper-offwhite p-0 shadow-floating sm:max-w-4xl lg:max-w-5xl">
        <div className="flex flex-col sm:flex-row">
          {/* Foto persegi */}
          <div className={cn('relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b-2 border-ink-900 sm:aspect-auto sm:min-h-[620px] sm:w-[38%] sm:border-r-2 sm:border-b-0', FALLBACK_BG[index % FALLBACK_BG.length])}>
            <div className="pointer-events-none absolute left-1/2 top-3 z-10 h-[18px] w-[92px] -translate-x-1/2 -rotate-3 bg-[#6F7780]/30" />
            <img
              src={mentor.photo}
              alt={`${mentor.name} — ${mentor.role}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col gap-6 overflow-hidden p-6 sm:p-9 lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(12,28,48,0.065) 1px, transparent 1px), linear-gradient(90deg, rgba(12,28,48,0.065) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative rounded-2xl border-2 border-ink-900 bg-paper-white p-5 shadow-paper sm:p-6">
              <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-brand-blue">
                <Sparkles className="size-4" aria-hidden />
                Mentor pilihan komunitas
              </div>
              <DialogTitle className="font-display text-4xl leading-tight font-bold text-ink-900 sm:text-5xl">
                {mentor.name}
              </DialogTitle>
              <p className="mt-1.5 text-base text-ink-600">{mentor.email}</p>
              {/* Deskripsi sr-only agar dialog tetap aksesibel (radix butuh description). */}
              <DialogDescription className="sr-only">
                Detail profil mentor {mentor.name}.
              </DialogDescription>
            </div>

            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="-rotate-1 rounded-xl border-2 border-ink-900 bg-note-yellow p-3 shadow-paper">
                <p className="font-display text-2xl font-bold text-ink-900">{assignments.length}</p>
                <p className="mt-1 text-xs font-bold text-ink-700">Kursus diajar</p>
              </div>
              <div className="rotate-1 rounded-xl border-2 border-ink-900 bg-note-mint p-3 shadow-paper">
                <p className="font-display text-2xl font-bold text-ink-900">{assignments.filter((course) => course.status === 'joined').length}</p>
                <p className="mt-1 text-xs font-bold text-ink-700">Kursus aktif</p>
              </div>
              <div className="col-span-2 rounded-xl border-2 border-ink-900 bg-note-peach p-3 shadow-paper sm:col-span-1">
                <p className="font-display text-2xl font-bold text-ink-900">{mentor.isVerified ? 'Ya' : '—'}</p>
                <p className="mt-1 text-xs font-bold text-ink-700">Terverifikasi</p>
              </div>
            </div>

            {/* Course yang diajar */}
            <div className="relative rounded-2xl border-2 border-ink-900 bg-paper-white p-4 shadow-paper sm:p-5">
              <div className="sticky top-0 z-10 flex items-end justify-between gap-3 bg-paper-white pb-3">
                <p className="inline-flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
                  <BookOpen className="size-4" aria-hidden />
                  Mengajar
                </p>
                <span className="text-xs font-bold text-ink-500">{assignments.length} kursus</span>
              </div>
              <div className="max-h-72 overflow-y-auto overscroll-contain px-1 py-2 sm:max-h-96" aria-label="Daftar kursus yang diajar">
                <ul className="flex flex-col gap-3">
                  {detailQuery.isFetching ? <li className="inline-flex items-center gap-2 text-xs text-ink-500"><LoaderCircle className="size-3.5 animate-spin" /> Memuat kursus...</li> : assignments.length > 0 ? assignments.map((course) => (
                    <li key={course.course_uid}>
                      <Link
                        to={ROUTES.courseDetail(course.course_uid)}
                        className="group flex items-center gap-3 rounded-xl border-2 border-ink-900/15 bg-paper-paper p-2 text-sm font-medium text-ink-800 outline-none transition-all hover:-translate-y-0.5 hover:border-brand-blue hover:bg-brand-blue-soft focus-visible:ring-3 focus-visible:ring-ring/30"
                      >
                        <img
                          src={course.thumbnail_url || course.cover_url}
                          alt=""
                          loading="lazy"
                          className="size-16 shrink-0 rounded-lg border-2 border-ink-900/10 object-cover sm:size-20"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                        <span className="min-w-0 flex-1 truncate pr-2 font-bold">{course.course_title}</span>
                        <ArrowUpRight className="mr-2 size-5 shrink-0 text-brand-blue transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    </li>
                  )) : <li className="text-xs text-ink-500">Belum ada kursus yang ditugaskan.</li>}
                </ul>
              </div>
            </div>

            {/* Sosmed */}
            {mentor.socials.length > 0 ? (
              <div className="relative">
                <p className="text-xs font-extrabold tracking-[0.15em] text-ink-500 uppercase">
                  Terhubung
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {mentor.socials.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform]
                    const isPlaceholder = social.url === '#'
                    const label = socialPlatformLabel(social.platform)
                    const cls =
                      'inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-ink-900 px-2.5 text-xs font-extrabold text-ink-900 shadow-button transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30'
                    return (
                      <li key={social.platform}>
                        {isPlaceholder ? (
                          <span
                            title={`${label} — segera hadir`}
                            aria-label={`${label} — segera hadir`}
                            className={cn(cls, 'cursor-not-allowed opacity-40')}
                          >
                            <Icon className="size-4" />
                            {label}
                          </span>
                        ) : (
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${label} ${mentor.name} (buka di tab baru)`}
                            className={cn(cls, 'bg-paper-white hover:bg-paper-paper')}
                          >
                            <Icon className="size-4" />
                            {label}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
