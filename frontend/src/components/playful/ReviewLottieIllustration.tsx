import { PlayfulEmptyIllustration } from './PublicLottieIllustration'

type ReviewLottieIllustrationProps = {
  className?: string
  height?: string
}

export function ReviewLottieIllustration({
  className,
}: ReviewLottieIllustrationProps) {
  return (
    <PlayfulEmptyIllustration
      variant="review"
      className={className}
    />
  )
}
