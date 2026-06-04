import { EmptyState } from '@/components/shared/EmptyState'
import { SafeLottie } from '@/components/ui/lottie'
import type { LessonDetailItem } from '@/lib/types/course'
import { cn } from '@/lib/utils'

import { getEmbedUrl, type LessonThemeMode } from './utils'

type LessonContentProps = {
  lesson: LessonDetailItem | null
  theme: LessonThemeMode
}

export function LessonContent({ lesson, theme }: LessonContentProps) {
  const isDark = theme === 'dark'

  return (
    <main className="min-h-screen px-6 pb-28 pt-26 transition-[padding] duration-200 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl justify-center">
        <article className="w-full max-w-[920px]">
          <div className={cn('lesson-reader tiptap-editor-root tiptap-preview', isDark ? 'text-zinc-200' : 'text-slate-700')}>
            {lesson ? (
              <>
                {lesson.content_type === 'text' &&
                  (lesson.content?.contentType === 'tiptap' ? (
                    <LessonHtml html={lesson.content.contentHtml} theme={theme} />
                  ) : (
                    <EmptyState title="Type bukan html" />
                  ))}

                {lesson.content_type === 'video' && (
                  <div className="space-y-7">
                    <LessonVideo lesson={lesson} theme={theme} />

                    {lesson.content?.contentType === 'tiptap' && <LessonHtml html={lesson.content.contentHtml} theme={theme} />}
                  </div>
                )}
              </>
            ) : (
              <SafeLottie src="/transaction-not-found.lottie" />
            )}
          </div>
        </article>
      </div>
    </main>
  )
}

function LessonHtml({ html, theme }: { html: string; theme: LessonThemeMode }) {
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'ProseMirror reader-prose mx-auto w-full max-w-[920px] px-0 text-base leading-8 [&_*:first-child]:mt-0 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h1]:mb-5 [&_h1]:mt-10 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug [&_hr]:my-10 [&_img]:mx-auto [&_img]:my-8 [&_img]:max-h-[520px] [&_img]:rounded-lg [&_img]:border [&_img]:object-contain [&_li]:my-1.5 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6',
        isDark
          ? 'text-zinc-200 [&_a]:text-cyan-300 [&_blockquote]:border-l-zinc-700 [&_blockquote]:text-zinc-300 [&_code]:bg-zinc-900 [&_h1]:text-zinc-50 [&_h2]:text-zinc-50 [&_h3]:text-zinc-100 [&_hr]:border-zinc-800 [&_img]:border-zinc-800 [&_pre]:border-zinc-800 [&_pre]:bg-zinc-900 [&_strong]:text-zinc-50 [&_td]:border-zinc-800 [&_th]:border-zinc-800 [&_th]:bg-zinc-900'
          : 'text-slate-700 [&_a]:text-primary [&_blockquote]:border-l-slate-300 [&_blockquote]:text-slate-600 [&_code]:bg-slate-100 [&_h1]:text-slate-950 [&_h2]:text-slate-950 [&_h3]:text-slate-900 [&_hr]:border-slate-200 [&_img]:border-slate-200 [&_pre]:border-slate-200 [&_pre]:bg-slate-100 [&_strong]:text-slate-950 [&_td]:border-slate-200 [&_th]:border-slate-200 [&_th]:bg-slate-100',
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function LessonVideo({ lesson, theme }: { lesson: LessonDetailItem; theme: LessonThemeMode }) {
  const embed = getEmbedUrl(lesson.video_url)
  const frameClassName = cn('mx-auto w-full max-w-[920px] overflow-hidden rounded-lg border bg-black', theme === 'dark' ? 'border-zinc-800' : 'border-slate-200')

  if (embed) {
    return (
      <div className={frameClassName}>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embed}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    )
  }

  if (lesson.video_url) {
    return (
      <video controls className={frameClassName}>
        <source src={lesson.video_url} />
      </video>
    )
  }

  return <EmptyState title="Video not found" />
}
