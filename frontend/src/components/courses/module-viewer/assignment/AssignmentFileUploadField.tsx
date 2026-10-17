import { useEffect, useMemo } from 'react'
import { FileText, ImageIcon, Upload, Video, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createSubmissionFilePreviewUrl,
  formatSubmissionFileMeta,
  revokeSubmissionFilePreviewUrl,
} from '@/lib/lesson-assignment/submission-file-preview'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type AssignmentFileUploadFieldProps = {
  file: File | null
  fileDescription: string
  requireDescription: boolean
  theme: LessonThemeMode
  onFileChange: (file: File | null) => void
  onDescriptionChange: (value: string) => void
}

function PreviewIcon({ kind }: { kind: ReturnType<typeof formatSubmissionFileMeta>['kind'] }) {
  if (kind === 'image') return <ImageIcon className="size-5" aria-hidden />
  if (kind === 'video') return <Video className="size-5" aria-hidden />
  return <FileText className="size-5" aria-hidden />
}

export function AssignmentFileUploadField({
  file,
  fileDescription,
  requireDescription,
  theme,
  onFileChange,
  onDescriptionChange,
}: AssignmentFileUploadFieldProps) {
  const isDark = theme === 'dark'

  const previewUrl = useMemo(() => createSubmissionFilePreviewUrl(file), [file])
  const fileMeta = file ? formatSubmissionFileMeta(file) : null

  useEffect(() => {
    return () => revokeSubmissionFilePreviewUrl(previewUrl)
  }, [previewUrl])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="assignment-file"
          className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-foreground')}
        >
          Lampiran
        </label>
        {file ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => onFileChange(null)}
          >
            <X className="mr-1 size-3.5" aria-hidden />
            Hapus
          </Button>
        ) : null}
      </div>

      {file && fileMeta ? (
        <div className="space-y-3">
          {fileMeta.kind === 'image' && previewUrl ? (
            <img
              src={previewUrl}
              alt={fileMeta.name}
              className="max-h-80 w-full rounded-xl object-contain bg-muted"
            />
          ) : null}

          {fileMeta.kind === 'video' && previewUrl ? (
            <video
              src={previewUrl}
              controls
              className="max-h-80 w-full rounded-xl bg-black"
            />
          ) : null}

          {fileMeta.kind === 'pdf' && previewUrl ? (
            <iframe
              src={previewUrl}
              title={fileMeta.name}
              className="h-80 w-full rounded-xl border border-input bg-card"
            />
          ) : null}

          {fileMeta.kind === 'other' ? (
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3',
                isDark ? 'bg-zinc-900/60 text-zinc-200' : 'bg-muted text-foreground',
              )}
            >
              <PreviewIcon kind={fileMeta.kind} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{fileMeta.name}</p>
                <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-muted-foreground')}>
                  {fileMeta.sizeLabel}
                </p>
              </div>
            </div>
          ) : (
            <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-muted-foreground')}>
              {fileMeta.name} · {fileMeta.sizeLabel}
            </p>
          )}

          <label
            htmlFor="assignment-file-replace"
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 text-sm font-medium hover:underline',
              isDark ? 'text-sky-300' : 'text-primary',
            )}
          >
            Ganti file
            <input
              id="assignment-file-replace"
              type="file"
              className="sr-only"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      ) : (
        <label
          htmlFor="assignment-file"
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
            isDark
              ? 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40'
              : 'border-input hover:border-line-medium hover:bg-muted',
          )}
        >
          <Upload className={cn('size-5', isDark ? 'text-zinc-400' : 'text-muted-foreground')} aria-hidden />
          <span className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-foreground')}>
            Pilih file untuk diunggah
          </span>
          <span className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-muted-foreground')}>
            Gambar, PDF, video, atau dokumen lain
          </span>
          <input
            id="assignment-file"
            type="file"
            className="sr-only"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
        </label>
      )}

      {requireDescription ? (
        <div className="space-y-2">
          <label htmlFor="assignment-file-description" className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-foreground')}>
            Deskripsi file
          </label>
          <Input
            id="assignment-file-description"
            value={fileDescription}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Jelaskan isi lampiran"
            className={cn(
              'rounded-xl',
              isDark &&
                'border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-3 focus-visible:ring-zinc-700',
            )}
          />
        </div>
      ) : null}
    </div>
  )
}
