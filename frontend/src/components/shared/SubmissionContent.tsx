import type { SubmissionContentBlock } from '@/lib/types/course'
import { SafeEmbedFrame } from '@/components/shared/SafeEmbedFrame'
import { SafeExternalImage } from '@/components/shared/SafeExternalImage'
import { SafeExternalLink } from '@/components/shared/SafeExternalLink'
import { SanitizedHtml } from '@/components/shared/SanitizedHtml'
import { resolveSafeExternalHref, resolveSafeImageSrc } from '@/lib/security/safe-external-url'
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
                  <SanitizedHtml html={b.html} className="ProseMirror" />
                </div>
              )
            case 'text':
              return (
                <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {b.text}
                </p>
              )
            case 'image': {
              const imageSrc = resolveSafeImageSrc(b.url)
              if (!imageSrc) return null

              return (
                <figure key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
                  <SafeExternalImage
                    src={imageSrc}
                    width={320}
                    height={200}
                    loading="lazy"
                    alt={b.alt ?? 'Lampiran gambar'}
                    className="max-h-72 w-full object-contain"
                  />
                </figure>
              )
            }
            case 'file': {
              const fileHref = resolveSafeExternalHref(b.url)
              if (!fileHref) return null

              return (
                <div key={i} className="space-y-1.5">
                  <SafeExternalLink
                    href={fileHref}
                    download={b.fileName}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-slate-50"
                  >
                    Unduh {b.fileName}
                  </SafeExternalLink>
                  {b.description && <p className="text-xs text-slate-500">{b.description}</p>}
                </div>
              )
            }
            case 'videoEmbed':
              return (
                <div key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-black/5">
                  <div className="aspect-video w-full">
                    <SafeEmbedFrame embedUrl={b.embedUrl} title={b.title ?? 'Video'} />
                  </div>
                </div>
              )
            case 'link':
              return (
                <SafeExternalLink
                  key={i}
                  href={b.url}
                  className="break-all text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  {b.label ?? b.url}
                </SafeExternalLink>
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
