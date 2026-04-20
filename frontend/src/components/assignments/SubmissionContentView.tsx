'use client'

import type { SubmissionContentBlock } from '@/lib/types'
import '@/styles/tiptap-editor.css'
import Image from 'next/image'

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
                  <Image src={b.url} width={320} height={200} loading="lazy" alt={b.alt ?? 'Lampiran gambar'} className="max-h-72 w-full object-contain" />
                </figure>
              )
            case 'file':
              return (
                <div key={i} className="space-y-1.5">
                  <a
                    href={b.url}
                    download={b.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-slate-50">
                    Unduh {b.fileName}
                  </a>
                  {b.description && <p className="text-xs text-slate-500">{b.description}</p>}
                </div>
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
                <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="break-all text-sm font-medium text-primary underline-offset-2 hover:underline">
                  {b.label ?? b.url}
                </a>
              )
            case 'quiz':
              return (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jawaban quiz</p>
                  {b.passingScore != null && <p className="mt-1 text-xs text-slate-500">Passing score: {b.passingScore}</p>}
                  <div className="mt-3 space-y-2.5">
                    {b.answers.map((answer) => (
                      <div key={answer.questionId} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className="text-sm font-medium text-slate-800">{answer.prompt}</p>
                        <p className="mt-1 text-xs text-slate-500">Jawaban: {answer.selectedLabel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
