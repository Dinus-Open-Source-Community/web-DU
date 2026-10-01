import { NothingLottieIllustration } from '@/components/playful/NothingLottieIllustration'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'

type CourseDetailLottieEmptyProps = {
  title: string
  description?: string
  className?: string
}

export function CourseDetailLottieEmpty({
  title,
  description,
  className,
}: CourseDetailLottieEmptyProps) {
  return (
    <div
      className={cn(
        manageDetailLayout.flatEmpty,
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
    >
      <NothingLottieIllustration className="mb-2 max-w-[12rem]" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
