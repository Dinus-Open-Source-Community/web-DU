import { cn } from '@/lib/utils'

type DoodleDividerProps = { className?: string; flip?: boolean }

export default function DoodleDivider({ className, flip = false }: DoodleDividerProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className={cn('block h-6 w-full', flip && 'rotate-180', className)}
    >
      <path
        d="M0 22 C 120 8, 240 34, 360 22 S 600 8, 720 22 S 960 34, 1080 22 S 1320 8, 1440 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
