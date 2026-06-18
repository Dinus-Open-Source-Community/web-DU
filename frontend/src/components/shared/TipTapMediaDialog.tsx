'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, ImageIcon, Link2, Video } from 'lucide-react'

import { SafeEmbedFrame } from '@/components/shared/SafeEmbedFrame'
import { SafeExternalLink } from '@/components/shared/SafeExternalLink'
import { useProtectedFile } from '@/hooks/files/use-protected-file'
import { isResolvableProtectedFileReference } from '@/lib/files/parse-protected-file-reference'
import {
  normalizeTiptapMediaUrl,
  type TiptapMediaKind,
  validateMediaUrl,
} from '@/lib/tiptap-media'
import { resolveSafeEmbedUrl, resolveSafeImageSrc } from '@/lib/security/safe-external-url'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

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
    description: 'URL https atau path /files/{bucket}/{object} dari storage.',
    placeholder: 'https://example.com/gambar.jpg atau /files/bucket/object',
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
  onConfirm: (url: string) => boolean | void
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

  const trimmedUrl = normalizeTiptapMediaUrl(url)
  const protectedFile = useProtectedFile(kind === 'image' ? trimmedUrl : null)
  const publicPreviewSrc = kind === 'image' ? resolveSafeImageSrc(trimmedUrl) : null
  const previewImageSrc = protectedFile.displayUrl ?? publicPreviewSrc
  const youtubeEmbed = useMemo(
    () => (kind === 'youtube' ? resolveSafeEmbedUrl(trimmedUrl) : null),
    [kind, trimmedUrl],
  )
  const canPreviewImage = Boolean(
    previewImageSrc || isResolvableProtectedFileReference(trimmedUrl),
  )

  useEffect(() => {
    if (!canPreviewImage) {
      setImageStatus('idle')
      return
    }
    setImageStatus('loading')
  }, [canPreviewImage, trimmedUrl])

  function handleConfirm() {
    const validationError = validateMediaUrl(kind, url)
    if (validationError) {
      setError(validationError)
      return
    }
    const inserted = onConfirm(trimmedUrl)
    if (inserted === false) {
      setError('Gagal menyisipkan ke editor. Pastikan kursor aktif di area teks.')
      return
    }
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
                {trimmedUrl ? (
                  <SafeExternalLink
                    href={trimmedUrl}
                    className="inline-flex items-center gap-2 break-all text-sm font-medium text-primary underline underline-offset-2"
                    fallback={<p className="text-sm text-amber-700">URL tautan tidak valid.</p>}
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    {trimmedUrl}
                  </SafeExternalLink>
                ) : (
                  <p className="text-sm text-slate-400">Tautan akan tampil di sini.</p>
                )}
              </div>
            )}

            {kind === 'image' && (
              <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-white">
                {canPreviewImage && previewImageSrc ? (
                  <>
                    {(imageStatus === 'loading' || protectedFile.isLoading) && (
                      <p className="text-sm text-slate-400">Memuat gambar…</p>
                    )}
                    {imageStatus === 'error' && !protectedFile.isLoading && (
                      <p className="text-sm text-amber-700">Gambar tidak dapat dimuat dari URL ini.</p>
                    )}
                    <img
                      src={previewImageSrc}
                      alt="Pratinjau gambar"
                      className={cn('max-h-56 w-full object-contain', imageStatus !== 'loaded' && 'hidden')}
                      onLoad={() => setImageStatus('loaded')}
                      onError={() => setImageStatus('error')}
                    />
                  </>
                ) : canPreviewImage && protectedFile.isLoading ? (
                  <p className="text-sm text-slate-400">Memuat gambar…</p>
                ) : (
                  <p className="px-4 text-center text-sm text-slate-400">
                    Pratinjau gambar akan tampil di sini. Path `/files/...` didukung.
                  </p>
                )}
              </div>
            )}

            {kind === 'youtube' && (
              <div className="overflow-hidden rounded-lg border border-dashed border-slate-200 bg-black">
                {youtubeEmbed ? (
                  <div className="relative aspect-video w-full">
                    <SafeEmbedFrame embedUrl={trimmedUrl} title="Pratinjau YouTube" className="absolute inset-0" />
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
