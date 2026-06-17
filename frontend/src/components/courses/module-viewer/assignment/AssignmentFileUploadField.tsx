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
          className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-slate-800')}
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
              className="max-h-80 w-full rounded-lg object-contain bg-slate-50 dark:bg-zinc-950"
            />
          ) : null}

          {fileMeta.kind === 'video' && previewUrl ? (
            <video
              src={previewUrl}
              controls
              className="max-h-80 w-full rounded-lg bg-black"
            />
          ) : null}

          {fileMeta.kind === 'pdf' && previewUrl ? (
            <iframe
              src={previewUrl}
              title={fileMeta.name}
              className="h-80 w-full rounded-lg border border-slate-200 bg-white dark:border-zinc-800"
            />
          ) : null}

          {fileMeta.kind === 'other' ? (
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3',
                isDark ? 'bg-zinc-900/60 text-zinc-200' : 'bg-slate-50 text-slate-800',
              )}
            >
              <PreviewIcon kind={fileMeta.kind} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{fileMeta.name}</p>
                <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                  {fileMeta.sizeLabel}
                </p>
              </div>
            </div>
          ) : (
            <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>
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
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors',
            isDark
              ? 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50',
          )}
        >
          <Upload className={cn('size-5', isDark ? 'text-zinc-400' : 'text-slate-500')} aria-hidden />
          <span className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-slate-700')}>
            Pilih file untuk diunggah
          </span>
          <span className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>
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
          <label htmlFor="assignment-file-description" className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-slate-800')}>
            Deskripsi file
          </label>
          <Input
            id="assignment-file-description"
            value={fileDescription}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Jelaskan isi lampiran"
            className="rounded-lg"
          />
        </div>
      ) : null}
    </div>
  )
}
