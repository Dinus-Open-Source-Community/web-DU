import { EmptyState } from '@/components/shared/EmptyState'
import { SafeLottie } from '@/components/ui/lottie'
import type { LessonDetailItem } from '@/lib/types/course'
import { parseLessonContent } from '@/lib/rich-text'
import { cn } from '@/lib/utils'

import { getEmbedUrl, type LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type LessonContentProps = {
  lesson: LessonDetailItem | null
  theme: LessonThemeMode
  isLoading?: boolean
}

export function LessonContent({ lesson, theme, isLoading = false }: LessonContentProps) {
  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-24 xl:pt-26">
        <p className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}>Memuat konten lesson...</p>
      </main>
    )
  }

  const isDark = theme === 'dark'
  const resolvedContent = lesson ? parseLessonContent(lesson.content) : null
  const hasRenderableContent = Boolean(resolvedContent?.contentHtml?.trim())

  return (
    <main className="min-h-dvh px-4 pb-24 pt-20 transition-[padding] duration-200 sm:px-6 sm:pb-28 sm:pt-24 md:px-8 xl:px-10 xl:pt-26">
      <div className="mx-auto flex w-full max-w-7xl justify-center">
        <article className="w-full max-w-[920px]">
          <div className={cn('lesson-reader', isDark ? 'lesson-reader--dark text-zinc-200' : 'lesson-reader--light text-slate-700')}>
            {lesson ? (
              <>
                {lesson.content_type === 'text' &&
                  (hasRenderableContent ? (
                    <LessonRichContent html={resolvedContent!.contentHtml} format={resolvedContent!.contentFormat} />
                  ) : (
                    <EmptyState title="Konten lesson belum tersedia" />
                  ))}

                {lesson.content_type === 'video' && (
                  <div className="space-y-7">
                    <LessonVideo lesson={lesson} theme={theme} />

                    {hasRenderableContent && (
                      <LessonRichContent html={resolvedContent!.contentHtml} format={resolvedContent!.contentFormat} />
                    )}
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

function LessonRichContent({
  html,
  format,
}: {
  html: string
  format: 'tiptap' | 'html'
}) {
  if (format === 'html') {
    return <div className="lesson-html-raw" dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className="tiptap-editor-root tiptap-preview">
      <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
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
