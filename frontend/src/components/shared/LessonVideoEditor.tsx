import { useEffect, useMemo, useState } from 'react'
import { Film } from 'lucide-react'

import { SafeEmbedFrame } from '@/components/shared/SafeEmbedFrame'
import { TiptapEditor } from '@/components/shared/TipTapEditor'
import { resolveSafeEmbedUrl } from '@/lib/security/safe-external-url'

type LessonVideoEditorProps = {
  videoUrl: string
  description: string
  onVideoUrlChange: (url: string) => void
  onDescriptionChange: (html: string) => void
}

function coerceTiptapInitialContent(html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return '<p></p>'
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed
  const escaped = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return `<p>${escaped}</p>`
}

export function LessonVideoEditor({
  videoUrl,
  description,
  onVideoUrlChange,
  onDescriptionChange,
}: LessonVideoEditorProps) {
  const [localUrl, setLocalUrl] = useState(videoUrl)
  const hasSafeEmbed = Boolean(localUrl.trim() && resolveSafeEmbedUrl(localUrl))
  const descriptionInitial = useMemo(
    () => coerceTiptapInitialContent(description),
    [description],
  )

  useEffect(() => {
    setLocalUrl(videoUrl)
  }, [videoUrl])

  const handleBlur = () => {
    onVideoUrlChange(localUrl)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink-600">URL Video (YouTube / Vimeo)</label>
        <input
          type="url"
          value={localUrl}
          onChange={(e) => setLocalUrl(e.target.value)}
          onBlur={handleBlur}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-xl border-2 border-ink-900/10 bg-paper-white px-3 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-blue/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>

      {hasSafeEmbed ? (
        <div className="overflow-hidden rounded-xl border-2 border-ink-900/10">
          <div className="relative aspect-video w-full">
            <SafeEmbedFrame embedUrl={localUrl} title="Video preview" className="absolute inset-0" />
          </div>
        </div>
      ) : localUrl ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          <Film className="size-4 shrink-0" />
          URL tidak dikenali. Pastikan URL dari YouTube atau Vimeo.
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-600">Deskripsi (opsional)</p>
        <TiptapEditor
          variant="compact"
          initialContent={descriptionInitial}
          onChange={onDescriptionChange}
          placeholder="Tambahkan ringkasan, poin penting, atau materi pendukung untuk video ini…"
        />
      </div>
    </div>
  )
}
