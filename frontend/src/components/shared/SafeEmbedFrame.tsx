import { resolveSafeEmbedUrl } from '@/lib/security/safe-external-url'
import { cn } from '@/lib/utils'

type SafeEmbedFrameProps = {
  embedUrl: string
  title?: string
  className?: string
}

export function SafeEmbedFrame({ embedUrl, title = 'Video', className }: SafeEmbedFrameProps) {
  const safeSrc = resolveSafeEmbedUrl(embedUrl)

  if (!safeSrc) {
    return (
      <div className={cn('flex aspect-video items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500', className)}>
        Video tidak dapat ditampilkan karena URL embed tidak valid.
      </div>
    )
  }

  return (
    <iframe
      title={title}
      src={safeSrc}
      className={cn('h-full w-full', className)}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}
