'use client'

import { useCallback, useId, useState } from 'react'
import { Paperclip, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export type AssignmentAttachmentItem = {
  id: string
  fileName: string
  dataUrl: string
  mime: string
  size: number
  description?: string
}

const MAX_FILES = 8
const MAX_BYTES = 6 * 1024 * 1024

const ACCEPT = 'image/*,.zip,application/zip,application/x-zip-compressed'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function isAllowedFile(file: File): boolean {
  const lower = file.name.toLowerCase()
  if (file.type.startsWith('image/')) return true
  if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') return true
  if (lower.endsWith('.zip')) return true
  return false
}

function ingestFiles(fileList: File[], onAdd: (item: AssignmentAttachmentItem) => void) {
  for (const file of fileList) {
    if (file.size > MAX_BYTES) {
      toast.error(`${file.name} melebihi batas 6 MB.`)
      continue
    }
    if (!isAllowedFile(file)) {
      toast.error(`${file.name}: hanya gambar atau berkas ZIP.`)
      continue
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      if (!url) return
      onAdd({
        id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        fileName: file.name,
        dataUrl: url,
        size: file.size,
        mime: file.type || (file.name.toLowerCase().endsWith('.zip') ? 'application/zip' : 'application/octet-stream'),
      })
    }
    reader.readAsDataURL(file)
  }
}

type AssignmentAttachmentUploadProps = {
  items: AssignmentAttachmentItem[]
  onAdd: (item: AssignmentAttachmentItem) => void
  onRemove: (id: string) => void
  onChangeDescription?: (id: string, description: string) => void
  showDescriptionField?: boolean
  disabled?: boolean
  className?: string
}

export function AssignmentAttachmentUpload({ items, onAdd, onRemove, onChangeDescription, showDescriptionField, disabled, className }: AssignmentAttachmentUploadProps) {
  const inputId = useId()
  const [dragOver, setDragOver] = useState(false)

  const runPick = useCallback(
    (files: File[]) => {
      if (!files.length || disabled) return
      ingestFiles(files, onAdd)
    },
    [disabled, onAdd],
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files
      if (f?.length) runPick(Array.from(f))
      e.target.value = ''
    },
    [runPick],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      const f = e.dataTransfer.files
      if (f?.length) runPick(Array.from(f))
    },
    [disabled, runPick],
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Lampiran berkas</p>
        <p className="mt-1 text-xs text-slate-500">Gambar (JPG, PNG, WebP, …) atau arsip ZIP. Maks. {MAX_FILES} berkas, masing-masing hingga 6 MB.</p>
      </div>

      <label
        htmlFor={inputId}
        onDragEnter={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 transition-colors',
          disabled ? 'cursor-not-allowed border-slate-200 bg-slate-50/50 opacity-60' : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50/60',
          dragOver && !disabled && 'border-primary/50 bg-primary/5',
        )}>
        <input id={inputId} type="file" accept={ACCEPT} multiple className="sr-only" disabled={disabled} onChange={onInputChange} />
        <Upload className="h-8 w-8 text-slate-400" aria-hidden />
        <span className="text-center text-sm font-medium text-slate-700">
          Seret berkas ke sini atau <span className="text-primary underline-offset-2">pilih dari perangkat</span>
        </span>
        <span className="text-xs text-slate-400">ZIP, PNG, JPG, GIF, WebP, …</span>
      </label>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => {
            const isImg = item.mime.startsWith('image/')
            return (
              <li key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-sm">
                {isImg ? (
                  <Image src={item.dataUrl} width={40} height={40} loading="lazy" alt={item.fileName} className="h-10 w-10 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Paperclip className="h-4 w-4" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{item.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {isImg ? 'Gambar' : 'Berkas'} · {formatBytes(item.size)} · {item.mime || '—'}
                  </p>
                  {showDescriptionField && (
                    <input
                      type="text"
                      value={item.description ?? ''}
                      onChange={(e) => onChangeDescription?.(item.id, e.target.value)}
                      placeholder="Deskripsi file"
                      disabled={disabled}
                      className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-slate-500 hover:text-rose-600"
                  disabled={disabled}
                  onClick={() => onRemove(item.id)}
                  aria-label={`Hapus ${item.fileName}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { MAX_FILES, MAX_BYTES }
