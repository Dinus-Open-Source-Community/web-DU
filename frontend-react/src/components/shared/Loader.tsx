import { SafeLottie } from '../ui/lottie'

const LOTTIE_SRC = '/Book-loading.lottie'

interface LottieOverlayProps {
  visible: boolean
  message?: string
}

export function LottieOverlay({ visible, message = 'Mohon tunggu...' }: LottieOverlayProps) {
  if (!visible) return null

  return (
    <div role="status" aria-busy className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="size-36">
          <SafeLottie src={LOTTIE_SRC} className="size-full" />
        </div>
        <p className="text-sm font-semibold text-white/90 tracking-wide">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    </div>
  )
}
