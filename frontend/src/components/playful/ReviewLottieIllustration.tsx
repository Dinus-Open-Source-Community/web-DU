import { PublicLottieIllustration } from './PublicLottieIllustration'

type ReviewLottieIllustrationProps = {
  className?: string
  height?: string
}

export function ReviewLottieIllustration({
  className,
  height = '200px',
}: ReviewLottieIllustrationProps) {
  return (
    <PublicLottieIllustration
      src="/lotties/review.json"
      height={height}
      className={className}
    />
  )
}
