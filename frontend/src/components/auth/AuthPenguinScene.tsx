import { GraduationCap, Send } from 'lucide-react'
import { useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

type AuthPenguinSceneProps = {
  /** Versi ringkas untuk mobile: pinguin kecil + sapaan dalam satu baris. */
  compact?: boolean
}

/**
 * AuthPenguinScene — kartu maskot pinguin untuk halaman auth ("Pinguin Hidup").
 * Animasi murni SVG inline tanpa library maupun dep baru:
 *  - kedip mata & lambaian sayap lewat SMIL (`<animate>` / `<animateTransform>`)
 *  - doodle kertas & topi wisuda sebagai aksen dekoratif
 * Semua gerak berhenti total saat `prefers-reduced-motion`: CSS lewat media
 * query global + `motion-reduce`, sedangkan SMIL lewat gerbang
 * `useReducedMotion()` (tanpa node animasi saat reduksi).
 */
export function AuthPenguinScene({ compact = false }: AuthPenguinSceneProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const animated = !prefersReducedMotion

  return (
    <div
      className={cn(
        'relative border-2 border-ink-900 bg-paper-white shadow-paper',
        compact
          ? 'flex items-center gap-4 rounded-[10px] px-4 py-3'
          : 'mx-auto w-full max-w-sm rounded-[10px] px-6 pt-8 pb-6',
      )}
    >
      {/* Badge aksen — dekoratif. */}
      <span
        aria-hidden
        className={cn(
          'absolute grid place-items-center rounded-full border-2 border-ink-900 bg-note-yellow text-ink-900',
          compact ? '-top-2.5 -left-2 size-7' : '-top-3 left-5 size-8',
        )}
      >
        <GraduationCap className="size-4" strokeWidth={2.4} />
      </span>

      {compact ? null : (
        <>
          {/* Doodle melayang — pesawat kertas & topi wisuda (CSS float). */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-5 top-12 text-primary"
          >
            <Send className="size-9 -rotate-12" strokeWidth={2} />
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-3 bottom-14 text-primary"
          >
            <GraduationCap className="size-7" strokeWidth={2.2} />
          </span>
        </>
      )}

      <PenguinSvg animated={animated} compact={compact} />

      <p
        aria-hidden
        className={cn(
          'rounded-[10px] border-2 border-ink-900 bg-note-yellow px-3 py-1 text-sm font-bold text-ink-900',
          compact ? 'rotate-2' : 'absolute top-16 right-4 -rotate-3',
        )}
      >
        Halo!
      </p>
    </div>
  )
}

type PenguinSvgProps = {
  animated: boolean
  compact: boolean
}

/**
 * Pinguin inline SVG (viewBox 200×230) dengan SMIL di dalamnya. Saat
 * `animated` false, node `<animate>`/`<animateTransform>` tidak dirender
 * sama sekali sehingga gambar benar-benar diam.
 */
function PenguinSvg({ animated, compact }: PenguinSvgProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 200 230"
      className={cn(
        'overflow-visible',
        compact ? 'w-20 shrink-0' : 'mx-auto w-40 sm:w-44',
      )}
    >
      <title>Maskot pinguin DOSCOM melambai</title>
      <desc>Ilustrasi pinguin tersenyum dengan pipi merona dan sayap yang melambai.</desc>

      {/* Sayap kiri — goyang halus. */}
      <g>
        <ellipse cx="52" cy="130" rx="16" ry="42" fill="#101318" transform="rotate(18 52 130)" />
        {animated ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 52 108; 0 52 108; 12 52 108; 0 52 108; 0 52 108"
            keyTimes="0; 0.5; 0.6; 0.7; 1"
            dur="4.2s"
            repeatCount="indefinite"
          />
        ) : null}
      </g>

      {/* Sayap kanan — melambai. */}
      <g>
        <ellipse cx="148" cy="130" rx="16" ry="42" fill="#101318" transform="rotate(-18 148 130)" />
        {animated ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 148 104; 0 148 104; -34 148 104; 0 148 104; -34 148 104; 0 148 104; 0 148 104"
            keyTimes="0; 0.4; 0.5; 0.6; 0.7; 0.8; 1"
            dur="3.8s"
            repeatCount="indefinite"
          />
        ) : null}
      </g>

      {/* Kaki. */}
      <ellipse cx="70" cy="212" rx="24" ry="12" fill="#FFB36A" stroke="#101318" strokeWidth="5" />
      <ellipse cx="130" cy="212" rx="24" ry="12" fill="#FFB36A" stroke="#101318" strokeWidth="5" />

      {/* Badan & perut. */}
      <ellipse cx="100" cy="118" rx="68" ry="86" fill="#101318" />
      <ellipse cx="100" cy="140" rx="44" ry="58" fill="#FFFFFF" />

      {/* Mata. */}
      <circle cx="78" cy="82" r="15" fill="#FFFFFF" />
      <circle cx="122" cy="82" r="15" fill="#FFFFFF" />
      <circle cx="80" cy="84" r="6" fill="#101318" />
      <circle cx="120" cy="84" r="6" fill="#101318" />
      <circle cx="82" cy="82" r="2" fill="#FFFFFF" />
      <circle cx="122" cy="82" r="2" fill="#FFFFFF" />

      {/* Paruh. */}
      <polygon
        points="100,94 86,108 114,108"
        fill="#FFB36A"
        stroke="#101318"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Pipi merona — pulse. */}
      <circle cx="66" cy="106" r="7" fill="#F4A6CD" opacity="0.8">
        {animated ? (
          <animate attributeName="opacity" values="0.8; 0.35; 0.8" dur="2.8s" repeatCount="indefinite" />
        ) : null}
      </circle>
      <circle cx="134" cy="106" r="7" fill="#F4A6CD" opacity="0.8">
        {animated ? (
          <animate attributeName="opacity" values="0.8; 0.35; 0.8" dur="2.8s" repeatCount="indefinite" />
        ) : null}
      </circle>

      {/* Jambul. */}
      <path d="M40 60 C 30 40, 48 28, 62 36" fill="none" stroke="#101318" strokeWidth="4" strokeLinecap="round" />

      {/* Kelopak mata — kedip sesaat (menutup lalu membuka). Digambar terakhir
          agar menutup seluruh mata saat berkedip. */}
      {animated ? (
        <>
          <rect x="63" y="67" width="30" height="0" rx="4" fill="#101318">
            <animate
              attributeName="height"
              values="0; 0; 30; 0; 0"
              keyTimes="0; 0.86; 0.9; 0.94; 1"
              dur="4.6s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="107" y="67" width="30" height="0" rx="4" fill="#101318">
            <animate
              attributeName="height"
              values="0; 0; 30; 0; 0"
              keyTimes="0; 0.86; 0.9; 0.94; 1"
              dur="4.6s"
              repeatCount="indefinite"
            />
          </rect>
        </>
      ) : null}
    </svg>
  )
}
