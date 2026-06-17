import { ReactIcon } from './icon'
import { cn } from '@/lib/utils'

type CourseCardCoverFallbackProps = {
  className?: string
}

/** Fallback cover kursus — sama dengan `CardCourse.tsx`. */
export function CourseCardCoverFallback({ className }: CourseCardCoverFallbackProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]',
        className,
      )}
      aria-hidden
    >
      <ReactIcon />
    </div>
  )
}
