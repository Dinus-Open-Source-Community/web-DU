import { useState, useMemo } from 'react'
import { Film } from 'lucide-react'

type LessonVideoEditorProps = {
  videoUrl: string
  description: string
  onVideoUrlChange: (url: string) => void
  onDescriptionChange: (html: string) => void
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const videoId = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }
    if (u.hostname.includes('vimeo.com')) {
      const match = u.pathname.match(/\/(\d+)/)
      if (match) return `https://player.vimeo.com/video/${match[1]}`
    }
  } catch {
    // not a valid URL
  }
  return null
}

export function LessonVideoEditor({ videoUrl, description, onVideoUrlChange, onDescriptionChange }: LessonVideoEditorProps) {
  const [localUrl, setLocalUrl] = useState(videoUrl)
  const embedUrl = useMemo(() => getEmbedUrl(localUrl), [localUrl])

  const handleBlur = () => {
    onVideoUrlChange(localUrl)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">URL Video (YouTube / Vimeo)</label>
        <input
          type="url"
          value={localUrl}
          onChange={(e) => setLocalUrl(e.target.value)}
          onBlur={handleBlur}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>

      {embedUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              title="Video preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      ) : localUrl ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          <Film className="size-4 shrink-0" />
          URL tidak dikenali. Pastikan URL dari YouTube atau Vimeo.
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Deskripsi (opsional)</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          placeholder="Catatan tambahan untuk video ini..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>
    </div>
  )
}
