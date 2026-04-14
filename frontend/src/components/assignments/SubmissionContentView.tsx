'use client'

import type { SubmissionContentBlock } from '@/lib/types'
import '@/styles/tiptap-editor.css'

type SubmissionContentViewProps = {
  blocks: SubmissionContentBlock[]
  className?: string
}

export function SubmissionContentView({ blocks, className }: SubmissionContentViewProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        {blocks.map((b, i) => {
          switch (b.type) {
            case 'html':
              return (
                <div key={i} className="tiptap-editor-root tiptap-preview text-slate-800">
                  <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: b.html }} />
                </div>
              )
            case 'text':
              return (
                <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {b.text}
                </p>
              )
            case 'image':
              return (
                <figure key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.url} alt={b.alt ?? 'Lampiran gambar'} className="max-h-72 w-full object-contain" loading="lazy" />
                </figure>
              )
            case 'file':
              return (
                <a
                  key={i}
                  href={b.url}
                  download={b.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-slate-50">
                  Unduh {b.fileName}
                </a>
              )
            case 'videoEmbed':
              return (
                <div key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-black/5">
                  <div className="aspect-video w-full">
                    <iframe title={b.title ?? 'Video'} src={b.embedUrl} className="h-full w-full" allowFullScreen />
                  </div>
                </div>
              )
            case 'link':
              return (
                <a
                  key={i}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm font-medium text-primary underline-offset-2 hover:underline">
                  {b.label ?? b.url}
                </a>
              )
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
