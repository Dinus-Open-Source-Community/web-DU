import { PlayfulEmptyIllustration } from './PublicLottieIllustration'

type NothingGalleryLottieIllustrationProps = {
  className?: string
  height?: string
}

export function NothingGalleryLottieIllustration({
  className,
}: NothingGalleryLottieIllustrationProps) {
  return (
    <PlayfulEmptyIllustration
      variant="gallery"
      className={className}
    />
  )
}
