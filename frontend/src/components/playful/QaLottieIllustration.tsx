import { PublicLottieIllustration } from './PublicLottieIllustration'

/** Mental Therapy — https://lottiefiles.com/free-animation/mental-therapy-auMuzikwh9 */
const MENTAL_THERAPY_LOTTIE_SRC = '/lotties/mental-therapy.json'
const MENTAL_THERAPY_PREVIEW_GIF =
  'https://assets-v2.lottiefiles.com/a/8e98b76a-1179-11ee-886a-ab1d0b6e256f/yAHWnLCT3m.gif'

type QaLottieIllustrationProps = {
  className?: string
  height?: string
}

export function QaLottieIllustration({
  className,
  height = '200px',
}: QaLottieIllustrationProps) {
  return (
    <PublicLottieIllustration
      src={MENTAL_THERAPY_LOTTIE_SRC}
      fallbackImageSrc={MENTAL_THERAPY_PREVIEW_GIF}
      height={height}
      className={className}
    />
  )
}
