import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { DOSCOM_STACK } from '@/lib/landing/stack'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * "Tech deck" — kartu teknologi terasa seperti koleksi kartu, bukan grid fitur.
 * Bento asimetris (indeks 0 melintang 2 kolom; 1, 4, 5 pastel aksen), semua
 * ikon dari data DOSCOM_STACK. Hover: kartu terangkat + chip ikon membesar.
 * Di atas navy ink-800 dengan grid kertas halus + noise. Twinkle dekoratif
 * sengaja dilepas — biar fokus ke kartu, bukan ke gerak latar.
 */

type StackLayout = {
  /** Kelas bento (lebar/tinggi) di grid. */
  cell: string
  /** Latar kartu: paper polos atau pastel aksen (indeks 1, 4, 5). */
  bg: string
  /** Ukuran teks judul. */
  title: string
}

const STACK_LAYOUTS: StackLayout[] = [
  // 0 — React: bento besar 2 kolom (kartu pembuka baris 1)
  { cell: 'sm:col-span-2', bg: 'bg-paper-white', title: 'text-3xl' },
  // 1 — TypeScript: 1 kolom, aksen pastel (melengkapi baris 1: 2+1+1)
  { cell: '', bg: 'bg-note-mint', title: 'text-2xl' },
  // 2 — Tailwind: 1 kolom (menutup baris 1)
  { cell: '', bg: 'bg-paper-white', title: 'text-2xl' },
  // 3 — Go
  { cell: '', bg: 'bg-paper-white', title: 'text-lg' },
  // 4 — PostgreSQL: pastel aksen
  { cell: '', bg: 'bg-note-peach', title: 'text-lg' },
  // 5 — MinIO: pastel aksen
  { cell: '', bg: 'bg-note-sky', title: 'text-lg' },
  // 6 — Docker
  { cell: '', bg: 'bg-paper-white', title: 'text-lg' },
]

export default function StackSection() {
  const { stack } = LANDING_COPY

  return (
    <section id="stack" className="relative overflow-hidden bg-ink-800">
      {/* Grid kertas halus + grain di atas navy — tekstur, bukan gerak */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div aria-hidden className="paper-noise pointer-events-none absolute inset-0 opacity-40 mix-blend-screen" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:py-28">
        <SectionHeader
          dark
          eyebrow={stack.eyebrow}
          title={stack.title}
          copy={stack.copy}
          className="mx-auto max-w-3xl"
        />

        {/* Tech deck bento asimetris — 2 kolom di layar kecil, 4 di desktop */}
        <div className="mt-10 grid auto-rows-fr grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-4">
          {DOSCOM_STACK.map((item, i) => {
            const Icon = item.icon
            const layout = STACK_LAYOUTS[i % STACK_LAYOUTS.length]
            const isBig = i === 0
            return (
              <Reveal
                key={item.name}
                delay={(i % 4) * 0.07}
                className={cn('h-full col-span-1', isBig && 'col-span-2', layout.cell)}
              >
                <article
                  className={cn(
                    'group relative flex h-full flex-col justify-between rounded-[18px] border-2 border-ink-900 shadow-paper transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover sm:rounded-[20px]',
                    layout.bg,
                    isBig ? 'p-5 sm:p-7' : 'p-4 sm:p-6',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        'inline-grid place-items-center rounded-[12px] border-2 border-ink-900 bg-paper-white text-ink-900 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:rounded-[14px]',
                        isBig ? 'size-11 sm:size-14' : 'size-9 sm:size-11',
                      )}
                    >
                      <Icon
                        className={isBig ? 'size-6 sm:size-7' : 'size-4 sm:size-5'}
                        strokeWidth={2.2}
                      />
                    </span>
                    <span
                      className={cn(
                        'font-display leading-none font-bold text-ink-900/10',
                        isBig ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-3xl',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className={cn(isBig ? 'mt-4 sm:mt-6' : 'mt-3 sm:mt-4')}>
                    <h3
                      className={cn(
                        'font-display font-bold text-ink-900',
                        isBig ? 'text-2xl sm:text-3xl' : 'text-base leading-tight sm:text-2xl',
                      )}
                    >
                      {item.name}
                    </h3>
                    <p
                      className={cn(
                        'font-medium',
                        isBig
                          ? 'text-ink-600 mt-1 text-sm sm:text-base'
                          : 'text-ink-600 mt-1 text-xs leading-snug sm:text-sm',
                      )}
                    >
                      {item.detail}
                    </p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
