import { PublicLottieIllustration } from './PublicLottieIllustration'

type NothingGalleryLottieIllustrationProps = {
  className?: string
  height?: string
}

export function NothingGalleryLottieIllustration({
  className,
  height = '200px',
}: NothingGalleryLottieIllustrationProps) {
  return (
    <PublicLottieIllustration
      src="/lotties/nothing-gallery.json"
      height={height}
      className={className}
    />
  )
}
