'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, ImageIcon, Link2, Video } from 'lucide-react'
import {
  getYoutubeEmbedUrl,
  type TiptapMediaKind,
  validateMediaUrl,
} from '../../lib/tiptap-media'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'

const DIALOG_META: Record<
  TiptapMediaKind,
  { title: string; description: string; placeholder: string; icon: typeof Link2 }
> = {
  link: {
    title: 'Sisipkan tautan',
    description: 'Tempel URL lalu periksa pratinjau sebelum menyimpan.',
    placeholder: 'https://example.com',
    icon: Link2,
  },
  image: {
    title: 'Sisipkan gambar',
    description: 'Gunakan URL gambar (https). Pratinjau ditampilkan di bawah.',
    placeholder: 'https://example.com/gambar.jpg',
    icon: ImageIcon,
  },
  youtube: {
    title: 'Sisipkan video YouTube',
    description: 'Dukung URL watch, youtu.be, atau Shorts.',
    placeholder: 'https://www.youtube.com/watch?v=...',
    icon: Video,
  },
}

type TipTapMediaDialogProps = {
  open: boolean
  kind: TiptapMediaKind
  initialUrl?: string
  allowRemove?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (url: string) => void
  onRemove?: () => void
}

export function TipTapMediaDialog({
  open,
  kind,
  initialUrl = '',
  allowRemove = false,
  onOpenChange,
  onConfirm,
  onRemove,
}: TipTapMediaDialogProps) {
  const [url, setUrl] = useState(initialUrl)
  const [error, setError] = useState<string | null>(null)
  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  const meta = DIALOG_META[kind]
  const Icon = meta.icon

  useEffect(() => {
    if (!open) return
    setUrl(initialUrl || (kind === 'link' ? 'https://' : ''))
    setError(null)
    setImageStatus('idle')
  }, [open, initialUrl, kind])

  const youtubeEmbed = useMemo(() => (kind === 'youtube' ? getYoutubeEmbedUrl(url) : null), [kind, url])
  const canPreviewImage = kind === 'image' && url.trim().length > 0 && !validateMediaUrl('image', url)

  useEffect(() => {
    if (!canPreviewImage) {
      setImageStatus('idle')
      return
    }
    setImageStatus('loading')
  }, [canPreviewImage, url])

  function handleConfirm() {
    const validationError = validateMediaUrl(kind, url)
    if (validationError) {
      setError(validationError)
      return
    }
    onConfirm(url.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            {meta.title}
          </DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
            }}
            placeholder={meta.placeholder}
            aria-label="URL"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleConfirm()
              }
            }}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pratinjau</p>

            {kind === 'link' && (
              <div className="min-h-[72px] rounded-lg border border-dashed border-slate-200 bg-white p-3">
                {url.trim() ? (
                  <a
                    href={url.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 break-all text-sm font-medium text-primary underline underline-offset-2">
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    {url.trim()}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">Tautan akan tampil di sini.</p>
                )}
              </div>
            )}

            {kind === 'image' && (
              <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-white">
                {canPreviewImage ? (
                  <>
                    {imageStatus === 'loading' && <p className="text-sm text-slate-400">Memuat gambar…</p>}
                    {imageStatus === 'error' && <p className="text-sm text-amber-700">Gambar tidak dapat dimuat dari URL ini.</p>}
                    <img
                      src={url.trim()}
                      alt="Pratinjau gambar"
                      className={cn('max-h-56 w-full object-contain', imageStatus !== 'loaded' && 'hidden')}
                      onLoad={() => setImageStatus('loaded')}
                      onError={() => setImageStatus('error')}
                    />
                  </>
                ) : (
                  <p className="text-sm text-slate-400">Pratinjau gambar akan tampil di sini.</p>
                )}
              </div>
            )}

            {kind === 'youtube' && (
              <div className="overflow-hidden rounded-lg border border-dashed border-slate-200 bg-black">
                {youtubeEmbed ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={youtubeEmbed}
                      title="Pratinjau YouTube"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[160px] items-center justify-center bg-white">
                    <p className="text-sm text-slate-400">Pratinjau video akan tampil di sini.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {allowRemove && onRemove ? (
            <Button type="button" variant="outline" className="text-destructive" onClick={() => { onRemove(); onOpenChange(false) }}>
              Hapus tautan
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Sisipkan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
