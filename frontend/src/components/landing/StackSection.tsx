import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import DoodleDivider from '@/components/playful/DoodleDivider'
import { StickerSparkle } from '@/components/playful/Stickers'
import { DOSCOM_STACK } from '@/lib/landing/stack'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * "Tech deck" — kartu teknologi terasa seperti koleksi kartu, bukan grid fitur.
 * Bento asimetris (indeks 0 melintang 2 kolom; 1, 4, 5 pastel aksen), semua
 * ikon dari data DOSCOM_STACK. Hover: kartu terangkat + chip ikon membesar.
 * Di atas navy ink-800 dengan grid kertas halus + squiggle transisi ke bawah.
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
      {/* Grid kertas halus di atas navy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Aksen twinkle halus di pojok */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <StickerSparkle twinkle className="absolute top-[10%] left-[5%] size-6 text-brand-soft/40" />
        <StickerSparkle twinkle className="absolute right-[7%] bottom-[16%] size-8 text-brand-soft/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          dark
          eyebrow={stack.eyebrow}
          title={stack.title}
          copy={stack.copy}
          className="mx-auto max-w-3xl"
        />

        {/* Tech deck bento asimetris */}
        <div className="mt-16 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DOSCOM_STACK.map((item, i) => {
            const Icon = item.icon
            const layout = STACK_LAYOUTS[i % STACK_LAYOUTS.length]
            const isBig = i === 0
            return (
              <Reveal key={item.name} delay={(i % 4) * 0.07} className={cn('h-full', layout.cell)}>
                <article
                  className={cn(
                    'group relative flex h-full flex-col justify-between rounded-[20px] border-2 border-ink-900 p-6 shadow-paper transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover',
                    layout.bg,
                    isBig ? 'p-7' : 'p-6',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        'inline-grid place-items-center rounded-[14px] border-2 border-ink-900 bg-paper-white text-ink-900 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6',
                        isBig ? 'size-14' : 'size-11',
                      )}
                    >
                      <Icon className={isBig ? 'size-7' : 'size-5'} strokeWidth={2.2} />
                    </span>
                    <span
                      className={cn(
                        'font-display leading-none font-bold text-ink-900/10',
                        isBig ? 'text-5xl' : 'text-3xl',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className={cn(isBig ? 'mt-6' : 'mt-4')}>
                    <h3
                      className={cn(
                        'font-display font-bold text-ink-900',
                        layout.title,
                      )}
                    >
                      {item.name}
                    </h3>
                    <p
                      className={cn(
                        'font-medium',
                        isBig ? 'text-ink-600 mt-1.5 text-base' : 'text-ink-600 mt-1 text-sm',
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

      {/* Squiggle transisi navy → paper berikutnya */}
      <DoodleDivider className="relative -mb-1 text-paper-white/25" />
    </section>
  )
}
