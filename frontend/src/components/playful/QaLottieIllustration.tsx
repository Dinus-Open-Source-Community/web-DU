import { PlayfulEmptyIllustration } from './PublicLottieIllustration'

type QaLottieIllustrationProps = {
  className?: string
  height?: string
}

export function QaLottieIllustration({
  className,
}: QaLottieIllustrationProps) {
  return (
    <PlayfulEmptyIllustration
      variant="qa"
      className={className}
    />
  )
}
