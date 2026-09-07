import { cn } from '@/lib/utils'

export default function PenguinMascot({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Maskot pinguin DOSCOM"
      viewBox="0 0 200 230"
      className={cn('animate-bob', className)}
    >
      <ellipse cx="52" cy="130" rx="16" ry="42" fill="#101318" transform="rotate(18 52 130)" />
      <ellipse cx="148" cy="130" rx="16" ry="42" fill="#101318" transform="rotate(-18 148 130)" />
      <ellipse cx="70" cy="212" rx="24" ry="12" fill="#FFB36A" stroke="#101318" strokeWidth="5" />
      <ellipse cx="130" cy="212" rx="24" ry="12" fill="#FFB36A" stroke="#101318" strokeWidth="5" />
      <ellipse cx="100" cy="118" rx="68" ry="86" fill="#101318" />
      <ellipse cx="100" cy="140" rx="44" ry="58" fill="#FFFFFF" />
      <circle cx="78" cy="82" r="15" fill="#FFFFFF" />
      <circle cx="122" cy="82" r="15" fill="#FFFFFF" />
      <circle cx="80" cy="84" r="6" fill="#101318" />
      <circle cx="120" cy="84" r="6" fill="#101318" />
      <circle cx="82" cy="82" r="2" fill="#FFFFFF" />
      <circle cx="122" cy="82" r="2" fill="#FFFFFF" />
      <polygon points="100,94 86,108 114,108" fill="#FFB36A" stroke="#101318" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="66" cy="106" r="7" fill="#F4A6CD" opacity="0.8" />
      <circle cx="134" cy="106" r="7" fill="#F4A6CD" opacity="0.8" />
      <path d="M40 60 C 30 40, 48 28, 62 36" fill="none" stroke="#101318" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
