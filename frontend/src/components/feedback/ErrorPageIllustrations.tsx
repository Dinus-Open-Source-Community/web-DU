/** Inline SVGs for error / 404 — colors use currentColor (primary) */

export function ErrorBurstIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden>
      <circle cx="100" cy="80" r="56" stroke="currentColor" strokeWidth="2" className="text-primary/25" />
      <path
        d="M100 36 L108 68 L140 68 L114 86 L122 118 L100 98 L78 118 L86 86 L60 68 L92 68 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="text-primary du-error-star"
        fill="none"
      />
      <circle cx="100" cy="80" r="4" fill="currentColor" className="text-primary" />
    </svg>
  )
}

export function NotFoundIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden>
      <rect
        x="44"
        y="40"
        width="112"
        height="88"
        rx="12"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary/30"
      />
      <path
        d="M72 64h56M72 80h40M72 96h48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary/50 du-nf-lines"
      />
    </svg>
  )
}
