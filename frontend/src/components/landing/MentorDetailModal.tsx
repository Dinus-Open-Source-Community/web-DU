import { ArrowUpRight, BookOpen, LoaderCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { StickerTape, StickerSquiggle } from '@/components/playful/Stickers'
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

/**
 * Modal detail mentor bergaya Berkas Resmi / Mentor Dossier taktil:
 *  - Header dossier dengan cap ID fakultas
 *  - Kartu identitas polaroid lengkap dengan washi tape & verifikasi
 *  - Metrik pembelajaran berbasis sticky-notes miring
 *  - Daftar kurikulum kelas yang diampu dengan tampilan tiket taktil
 *  - Kanal komunikasi dengan tombol terstempel
 */
export default function MentorDetailModal({ mentor, index = 0, children }: MentorDetailModalProps) {
  const detailQuery = useQuery({
    queryKey: ['public-mentor', mentor.uid],
    queryFn: () => fetchPublicMentor(mentor.uid),
    enabled: false,
  })
  const assignments = detailQuery.data?.assignments ?? mentor.assignments ?? []
  const resolvedRole = detailQuery.data?.role || mentor.role
  const roleDisplay = resolvedRole && resolvedRole !== 'mentor' ? resolvedRole : 'Mentor Praktisi'
  const resolvedName = detailQuery.data?.name || mentor.name
  const resolvedPhoto = detailQuery.data?.avatar_url || mentor.photo
  const resolvedEmail = detailQuery.data?.email || mentor.email
  const resolvedSocials = detailQuery.data?.social_links ?? mentor.socials ?? []
  const isVerified = detailQuery.data?.is_verified ?? mentor.isVerified

  return (
    <Dialog onOpenChange={(open) => { if (open) void detailQuery.refetch() }}>
      {children}
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] gap-0 overflow-y-auto rounded-[28px] border-2 border-ink-900 bg-paper-white p-0 shadow-floating sm:max-w-4xl lg:max-w-5xl">
        {/* Header Bar Dossier */}
        <div className="flex shrink-0 items-center justify-between border-b-2 border-ink-900 bg-paper-panel px-5 py-3 sm:px-7 sm:py-3.5 pr-14 sm:pr-16">
          <div className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center rounded-sm border border-ink-900 bg-note-yellow font-mono text-xs font-bold text-ink-900 shadow-2xs">
              ✦
            </span>
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-ink-900">
              BERKAS RESMI MENTOR • DOSCOM FACULTY
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row">
          {/* Kolom Kiri: Polaroid Identity & Practitioner Card */}
          <div className="relative flex flex-col justify-between border-b-2 border-ink-900 bg-[#FDFBF7] p-5 sm:w-[42%] sm:border-r-2 sm:border-b-0 sm:p-7 lg:w-[38%]">
            {/* Pola grid halus di kolom kiri */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(5,9,20,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(5,9,20,0.035) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative">
              {/* Polaroid Photo Frame */}
              <div className="relative rounded-2xl border-2 border-ink-900 bg-paper-white p-3 shadow-paper">
                {/* Washi Tape di atas polaroid */}
                <StickerTape className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-2 z-10 opacity-90" />

                <div
                  className={cn(
                    'relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-xl border border-ink-900/20 shadow-2xs',
                    FALLBACK_BG[index % FALLBACK_BG.length],
                  )}
                >
                  <img
                    src={resolvedPhoto}
                    alt={`${resolvedName} — ${resolvedRole}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-[center_25%]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>

                {/* Footer kartu polaroid */}
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink-900/15 pt-2 font-mono text-[11px]">
                  <span className="font-bold text-ink-600 uppercase">PRAKTISI</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    TERVERIFIKASI
                  </span>
                </div>
              </div>

              {/* Info Kontak & Kredensial */}
              <div className="mt-4 rounded-xl border-2 border-ink-900/15 bg-paper-white p-3.5 shadow-2xs">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  Peran & Spesialisasi
                </p>
                <p className="mt-0.5 font-display text-base font-bold text-ink-900">
                  {roleDisplay}
                </p>
                {resolvedEmail && (
                  <p className="mt-1.5 font-mono text-xs text-ink-600 break-all">
                    {resolvedEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Kanal Sosial / Terhubung */}
            {resolvedSocials.length > 0 && (
              <div className="relative mt-5 pt-4 border-t border-dashed border-ink-900/20">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-500">
                  Kanal Komunikasi
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {resolvedSocials.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform]
                    const isPlaceholder = social.url === '#'
                    const label = socialPlatformLabel(social.platform)
                    const cls =
                      'inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-900 px-2.5 py-1 font-mono text-xs font-bold text-ink-900 shadow-button transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30'
                    return (
                      <li key={social.platform}>
                        {isPlaceholder ? (
                          <span
                            title={`${label} — segera hadir`}
                            aria-label={`${label} — segera hadir`}
                            className={cn(cls, 'bg-paper-white opacity-40 cursor-not-allowed')}
                          >
                            <Icon className="size-3.5" />
                            {label}
                          </span>
                        ) : (
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${label} ${resolvedName} (buka di tab baru)`}
                            className={cn(cls, 'bg-paper-white hover:bg-note-yellow hover:-translate-y-0.5')}
                          >
                            <Icon className="size-3.5" />
                            {label}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Track Record, Metrik & Kurikulum */}
          <div className="relative flex min-w-0 flex-1 flex-col gap-6 overflow-hidden p-6 sm:p-8 lg:p-9">
            {/* Tekstur grid kertas tipis */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(5,9,20,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(5,9,20,0.035) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Nama Mentor */}
            <div className="relative">
              <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-mint px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-900 shadow-2xs -rotate-1">
                MENTOR DOSCOM UNIVERSITY
              </span>
              <DialogTitle className="mt-2.5 font-display text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
                {resolvedName}
              </DialogTitle>
              <StickerSquiggle className="mt-2.5 h-3.5 w-36" />
              <DialogDescription className="sr-only">
                Detail profil mentor {resolvedName}.
              </DialogDescription>
            </div>

            {/* 3 Metrik Taktil (Sticky-Notes bergaya miring) */}
            <div className="relative grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="-rotate-1 rounded-xl border-2 border-ink-900 bg-note-yellow p-3 shadow-paper">
                <p className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{assignments.length}</p>
                <p className="mt-0.5 font-mono text-[10px] font-bold uppercase text-ink-800 sm:text-xs">Total Kelas</p>
              </div>
              <div className="rotate-1 rounded-xl border-2 border-ink-900 bg-note-mint p-3 shadow-paper">
                <p className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                  {assignments.filter((course) => course.status === 'joined').length || mentor.assignedCourses || 0}
                </p>
                <p className="mt-0.5 font-mono text-[10px] font-bold uppercase text-ink-800 sm:text-xs">Kelas Aktif</p>
              </div>
              <div className="-rotate-1 rounded-xl border-2 border-ink-900 bg-note-peach p-3 shadow-paper">
                <p className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{isVerified ? '100%' : 'Aktif'}</p>
                <p className="mt-0.5 font-mono text-[10px] font-bold uppercase text-ink-800 sm:text-xs">Verifikasi</p>
              </div>
            </div>

            {/* Kurikulum Kelas yang Diampu */}
            <div className="relative rounded-2xl border-2 border-ink-900 bg-paper-white p-4 shadow-paper sm:p-5">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-ink-900/10 bg-paper-white pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-ink-900" aria-hidden />
                  <h3 className="font-display text-lg font-bold text-ink-900 sm:text-xl">Program Kelas yang Diampu</h3>
                </div>
                <span className="font-mono text-xs font-bold text-ink-600">[{assignments.length} Program]</span>
              </div>

              <div className="mt-3.5 max-h-64 overflow-y-auto overscroll-contain pr-1 sm:max-h-72" aria-label="Daftar kursus yang diajar">
                <ul className="flex flex-col gap-3">
                  {detailQuery.isFetching ? (
                    <li className="inline-flex items-center gap-2 py-4 text-xs font-mono text-ink-500">
                      <LoaderCircle className="size-4 animate-spin text-brand-blue" />
                      Memuat kurikulum kelas...
                    </li>
                  ) : assignments.length > 0 ? (
                    assignments.map((course) => (
                      <li key={course.course_uid}>
                        <Link
                          to={ROUTES.courseDetail(course.course_uid)}
                          className="group flex items-center gap-3.5 rounded-xl border-2 border-ink-900 bg-paper-white p-2.5 text-sm font-medium text-ink-900 shadow-paper transition-colors hover:bg-paper-panel outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                        >
                          <img
                            src={course.thumbnail_url || course.cover_url}
                            alt=""
                            loading="lazy"
                            className="size-14 sm:size-16 shrink-0 rounded-lg border border-ink-900/20 object-cover shadow-2xs"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                          />
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="block truncate font-display text-sm sm:text-base font-bold text-ink-900">
                              {course.course_title}
                            </span>
                            <span className="mt-1 inline-block rounded-xs border border-ink-900/30 bg-note-mint px-2 py-0.5 font-mono text-[10px] font-bold text-ink-800">
                              {course.status === 'joined' ? 'KURIKULUM AKTIF' : 'TERTUGAS'}
                            </span>
                          </div>
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-ink-900 bg-paper-white text-ink-900 shadow-2xs transition-colors group-hover:bg-paper-panel">
                            <ArrowUpRight className="size-4" />
                          </span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-dashed border-ink-900/20 bg-paper-panel p-4 text-center font-mono text-xs text-ink-500">
                      Belum ada kelas aktif yang ditugaskan saat ini.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
