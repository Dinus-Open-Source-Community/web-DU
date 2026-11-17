import {
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  Layout,
} from 'lucide-react'
import Footprints from '@/components/playful/Footprints'
import HandUnderline from '@/components/playful/HandUnderline'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import DoodleArrow from '@/components/playful/DoodleArrow'
import { LANDING_COPY } from '@/lib/landing/copy'
import { cn } from '@/lib/utils'

const NOTE_CARDS = [
  {
    icon: BookOpen,
    title: 'Kurikulum Terstruktur',
    desc: 'Materi bertahap dari dasar hingga mahir',
    accent: 'bg-note-mint',
    tapeTilt: '-rotate-3',
    cardTilt: '-rotate-2 hover:-rotate-1',
  },
  {
    icon: HeartHandshake,
    title: 'Bimbingan Praktisi',
    desc: 'Mentoring interaktif & feedback berkala',
    accent: 'bg-note-yellow',
    tapeTilt: 'rotate-3',
    cardTilt: 'rotate-2 hover:rotate-1',
  },
  {
    icon: Compass,
    title: 'Praktik & Studi Kasus',
    desc: 'Belajar aplikatif lewat proyek nyata',
    accent: 'bg-note-peach',
    tapeTilt: '-rotate-2',
    cardTilt: '-rotate-1 hover:rotate-0',
  },
  {
    icon: Award,
    title: 'Sertifikat Portofolio',
    desc: 'Pencapaian resmi yang terverifikasi',
    accent: 'bg-note-sky',
    tapeTilt: 'rotate-2',
    cardTilt: 'rotate-2 hover:rotate-1',
  },
] as const

export default function Hero() {
  const { hero } = LANDING_COPY

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-paper-offwhite pt-24 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-32"
    >
      {/* Latar: grid kertas grafik halus dengan noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--color-ink-900) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-ink-900) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div
        aria-hidden
        className="paper-noise pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        {/* Display Headline Editorial */}
        <Reveal delay={0.05}>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,8.5vw,7.5rem)] font-bold leading-[0.92] tracking-tight text-ink-900 [text-wrap:balance]">
            {hero.titleA}{' '}
            <span className="relative inline-block whitespace-nowrap text-brand-blue">
              {hero.titleB}
              <HandUnderline draw className="absolute -bottom-2.5 left-0 w-full sm:-bottom-3.5" />
            </span>
          </h1>
        </Reveal>

        {/* Subtitle & Footprints */}
        <Reveal delay={0.1}>
          <div data-hero-sub className="mx-auto mt-6 max-w-2xl sm:mt-8">
            <p className="text-base leading-relaxed text-ink-600 sm:text-lg lg:text-xl">
              {hero.sub}
            </p>
            <Footprints className="mt-4 justify-center opacity-60 [&_svg]:w-4" />
          </div>
        </Reveal>

        {/* Floating Tactile Sticky Notes Row (Pilar Universal Pembelajaran) */}
        <Reveal delay={0.16} className="mt-10 sm:mt-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {NOTE_CARDS.map((note) => {
              const Icon = note.icon
              return (
                <div
                  key={note.title}
                  className={cn(
                    'relative rounded-2xl border-2 border-ink-900 p-4 text-left shadow-paper transition-all duration-300 hover:-translate-y-1 sm:p-5',
                    note.accent,
                    note.cardTilt,
                  )}
                >
                  <StickerTape
                    className={cn('absolute -top-2.5 left-1/2 -translate-x-1/2', note.tapeTilt)}
                  />
                  <div className="flex items-center gap-2.5 text-ink-900">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl border-2 border-ink-900 bg-paper-white shadow-button sm:size-9">
                      <Icon className="size-4 text-ink-900 sm:size-5" />
                    </span>
                    <h3 className="font-display text-sm font-bold leading-tight text-ink-900 sm:text-base">
                      {note.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-ink-700 sm:text-sm">
                    {note.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </Reveal>

        {/* Interactive Student Workspace Mockup Artifact */}
        <Reveal delay={0.25} className="mt-14 sm:mt-18 lg:mt-20">
          <div className="relative mx-auto max-w-5xl text-left">
            {/* Taped label dekoratif di pojok atas */}
            <div className="absolute -top-5 -left-3 z-20 hidden items-center gap-2 sm:flex">
              <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-900 bg-note-yellow px-3 py-1 font-mono text-xs font-bold text-ink-900 shadow-button -rotate-3">
                <Layout className="size-3.5" />
                <span>student-workspace.board</span>
              </span>
            </div>

            <div className="absolute -top-12 -right-4 z-20 hidden items-center lg:flex">
              <DoodleArrow variant="down" className="size-16 text-brand-blue rotate-12" />
              <span className="font-hand -rotate-6 text-sm font-bold text-brand-ink">
                Belajar & bangun karya!
              </span>
            </div>

            {/* Container Window Paper Canvas */}
            <div className="relative overflow-hidden rounded-[24px] border-2 border-ink-900 bg-paper-white shadow-paper">
              {/* Top Window Bar */}
              <div className="flex flex-wrap items-center justify-between border-b-2 border-ink-900 bg-paper-paper px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full border-2 border-ink-900 bg-note-peach" />
                  <span className="size-3 rounded-full border-2 border-ink-900 bg-note-yellow" />
                  <span className="size-3 rounded-full border-2 border-ink-900 bg-note-mint" />
                  <span className="ml-2 hidden font-mono text-xs font-bold text-ink-700 sm:inline">
                    dkelas-learning / student-workspace
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink-700">
                    <span className="size-2 border border-ink-900 bg-note-mint" />
                    <span>Modul Aktif · Sesi Berjalan</span>
                  </span>
                  <div className="hidden items-center -space-x-1 sm:flex">
                    <span title="Siswa" className="inline-grid size-5 place-items-center border border-ink-900 bg-note-mint text-[9px] font-bold text-ink-900 shadow-2xs">S</span>
                    <span title="Rekan Belajar" className="inline-grid size-5 place-items-center border border-ink-900 bg-note-yellow text-[9px] font-bold text-ink-900 shadow-2xs">R</span>
                    <span title="Mentor" className="inline-grid size-5 place-items-center border border-ink-900 bg-brand-soft text-[9px] font-bold text-brand-ink shadow-2xs">M</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-500">
                    3 kolaborator aktif
                  </span>
                </div>
              </div>

              {/* Window Body: Modul Pembelajaran & Progres Belajar */}
              <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:gap-8">
                {/* Kolom Kiri: Modul Pembelajaran & Evaluasi */}
                <div className="lg:col-span-7">
                  <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-ink-900 bg-paper-offwhite p-4 shadow-paper sm:p-5">
                    <div className="flex items-center justify-between border-b border-ink-900/10 pb-3">
                      <div className="flex items-center gap-2 text-ink-700">
                        <BookOpen className="size-4 text-brand-ink" />
                        <span className="font-mono text-xs font-bold">Modul Pembelajaran & Studi Kasus</span>
                      </div>
                      <span className="border-2 border-ink-900 bg-note-mint px-2 py-0.5 text-[11px] font-bold text-ink-900 shadow-button rotate-1">
                        Tugas Terverifikasi ✨
                      </span>
                    </div>

                    <div className="mt-3 space-y-3 py-1">
                      {/* Status Tahapan Materi */}
                      <div className="space-y-1.5 font-mono text-xs text-ink-800">
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-note-mint shrink-0" />
                          <span>Tahap 1: Pemahaman Konsep & Teori Dasar</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-note-mint shrink-0" />
                          <span>Tahap 2: Pengerjaan Latihan & Studi Kasus</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-note-mint shrink-0" />
                          <span>Tahap 3: Evaluasi & Umpan Balik Mentor</span>
                        </p>
                      </div>

                      {/* Catatan Feedback Mentor */}
                      <div className="rounded-xl border-2 border-dashed border-ink-900/15 bg-paper-white p-3 text-xs leading-relaxed text-ink-800">
                        <div className="flex items-center gap-1.5 font-bold text-ink-900">
                          <HeartHandshake className="size-4 text-brand-ink" />
                          <span>Ulasan & Masukan Mentor</span>
                        </div>
                        <p className="mt-1 text-ink-600">
                          &quot;Pengerjaan tugas sangat rapi, alur penyelesaian masalah jelas, dan pemahaman materi sudah sangat matang. Siap lanjut ke tantangan berikutnya!&quot;
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-ink-900/10 pt-2 text-xs text-ink-500">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Compass className="size-3.5 text-brand-blue" />
                        Materi Terstruktur ➔ Praktik Mandiri ➔ Evaluasi Berkala
                      </span>
                      <span className="font-mono text-ink-700">Tahap 2 / 4</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Kanban Alur & Milestone */}
                <div className="flex flex-col justify-between gap-4 lg:col-span-5">
                  <div className="space-y-3">
                    <div className="relative rounded-xl border-2 border-ink-900 bg-note-mint p-3.5 shadow-button -rotate-1">
                      <StickerTape className="absolute -top-2 left-6 h-3 w-10 -rotate-2" />
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-extrabold uppercase text-ink-900">Tahap Belajar</span>
                        <span className="font-mono text-[11px] font-extrabold tracking-wide text-ink-900/80">[ Minggu 2 ]</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-ink-900">Eksplorasi Materi & Latihan Terstruktur</p>
                    </div>

                    <div className="relative rounded-xl border-2 border-ink-900 bg-note-yellow p-3.5 shadow-button rotate-1">
                      <StickerTape className="absolute -top-2 right-6 h-3 w-10 rotate-3" />
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-extrabold uppercase text-ink-900">Sesi Mentoring</span>
                        <span className="font-mono text-[11px] font-extrabold tracking-wide text-ink-900/80">[ Interaktif ]</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-ink-900">Diskusi Langsung & Tanya Jawab Berkala</p>
                    </div>

                    <div className="relative rounded-xl border-2 border-ink-900 bg-note-sky p-3.5 shadow-button -rotate-1">
                      <StickerTape className="absolute -top-2 left-10 h-3 w-10 -rotate-1" />
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-extrabold uppercase text-ink-900">Hasil Akhir</span>
                        <span className="font-mono text-[11px] font-extrabold tracking-wide text-ink-900/80">[ Portofolio ]</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-ink-900">Karya Nyata Siap Ditunjukkan ke Publik</p>
                    </div>
                  </div>

                  {/* Stamp & Badges Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-ink-900/15 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-700">
                      <BadgeCheck className="size-4 text-brand-ink" />
                      Sertifikat Kelulusan Resmi
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-700">
                      <GraduationCap className="size-3.5 text-brand-ink" />
                      Komunitas Belajar Terbuka
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
