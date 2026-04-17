'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import type { IModule, ILesson, IMentorCourse } from '@/lib/types'
import {
  getMergedMentorCourses,
  getSessionCourseModules,
  getSessionCourseMeta,
  publishMentorCourse,
  setSessionCourseModules,
  upsertExtraCourse,
} from '@/lib/mentorCourseStorage'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyPublished, notifySaved } from '@/lib/notify'
import { CourseModuleOutline } from './CourseModuleOutline'

const CourseTipTapEditor = dynamic(
  () => import('./CourseTipTapEditor').then((m) => ({ default: m.CourseTipTapEditor })),
  {
    ssr: false,
    loading: () => <div className="min-h-[240px] animate-pulse rounded-xl border border-slate-100 bg-slate-50" />,
  }
)

const LessonVideoEditor = dynamic(
  () => import('./LessonVideoEditor').then((m) => ({ default: m.LessonVideoEditor })),
  { ssr: false }
)

const LessonQuizEditor = dynamic(
  () => import('./LessonQuizEditor').then((m) => ({ default: m.LessonQuizEditor })),
  { ssr: false }
)

type CourseEditClientProps = {
  courseUid: string
  initialModuleId?: string
}

function findLesson(modules: IModule[], lessonId: string): ILesson | null {
  for (const m of modules) {
    const l = m.lessons.find((l) => l.id === lessonId)
    if (l) return l
  }
  return null
}

export function CourseEditClient({ courseUid, initialModuleId }: CourseEditClientProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [modules, setModules] = useState<IModule[]>([])
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [editorReady, setEditorReady] = useState(false)

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null
    return findLesson(modules, activeLessonId)
  }, [modules, activeLessonId])

  useEffect(() => {
    const merged = getMergedMentorCourses()
    const fromList = merged.find((c) => c.uid === courseUid)
    const session = getSessionCourseMeta(courseUid)
    const storedModules = getSessionCourseModules(courseUid)

    setModules(storedModules.modules)

    const firstLessonId = (() => {
      if (initialModuleId) {
        const targetModule = storedModules.modules.find((m) => m.id === initialModuleId)
        if (targetModule?.lessons[0]) return targetModule.lessons[0].id
      }
      return storedModules.modules[0]?.lessons[0]?.id ?? null
    })()

    setActiveLessonId(firstLessonId)
    setEditorReady(true)

    if (fromList) {
      setCourse(fromList)
    } else if (session) {
      setCourse({
        uid: courseUid,
        title: session.title,
        header: session.header,
        description: session.header,
        image: session.image,
        published: session.published ?? false,
        moduleCount: 0,
        studentCount: 0,
        rating: 0,
        totalReviews: 0,
        updatedAt: 'Baru',
      })
    } else {
      setCourse(null)
    }
  }, [courseUid, initialModuleId])

  const updateLesson = (lessonId: string, updater: (l: ILesson) => ILesson) => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === lessonId ? updater(l) : l)),
      }))
    )
  }

  const handleSave = (opts?: { silent?: boolean; redirect?: boolean }) => {
    if (!modules.length) return
    setSessionCourseModules(courseUid, { version: 2, modules })
    if (!opts?.silent) notifySaved('Perubahan berhasil disimpan.')
    if (opts?.redirect !== false) {
      router.push(`/mentor/courses/${courseUid}`)
      router.refresh()
    }
  }

  const handleSaveClick = async () => {
    const ok = await confirm({
      title: 'Simpan perubahan?',
      description: 'Semua konten modul dan lesson akan disimpan ke sesi lokal.',
      confirmLabel: 'Simpan',
    })
    if (!ok) return
    handleSave({ redirect: true })
  }

  const handlePublish = () => {
    handleSave({ silent: true, redirect: false })
    const moduleCount = Math.max(1, modules.length)
    if (course) {
      upsertExtraCourse({
        ...course,
        moduleCount,
        updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      })
      setCourse((prev) => (prev ? { ...prev, moduleCount } : prev))
    }
    publishMentorCourse(courseUid)
    notifyPublished()
    router.push(`/mentor/courses/${courseUid}`)
    router.refresh()
  }

  const handlePublishClick = async () => {
    const ok = await confirm({
      title: 'Publikasikan kursus?',
      description: 'Kursus akan ditandai aktif dan muncul di daftar kursus mentor.',
      confirmLabel: 'Publish',
    })
    if (!ok) return
    handlePublish()
  }

  if (course === undefined) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-500">Memuat…</p>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">
          Kursus tidak ditemukan. Akses editor hanya dari daftar kursus atau setelah membuat kursus baru.
        </p>
        <Button asChild variant="outline" className="w-fit rounded-xl">
          <Link href="/mentor/courses">Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-1 gap-2 rounded-lg border-border bg-card font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground"
          >
            <Link href={`/mentor/courses/${courseUid}`}>
              <ArrowLeft className="size-3.5 opacity-80" aria-hidden />
              Kembali
            </Link>
          </Button>
          <PageHeader title={course.title} subtitle={course.header} />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              course.published
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-100 text-slate-600'
            }`}
          >
            {course.published ? 'Aktif' : 'Belum dipublikasikan'}
          </span>
          {!course.published && (
            <Button type="button" className="rounded-xl" onClick={() => void handlePublishClick()}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {course.image && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.image} alt="" className="max-h-56 w-full object-cover" />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Konten lesson</h2>
            {activeLesson && (
              <p className="text-sm font-medium text-slate-700">
                Sedang mengedit:{' '}
                <span className="text-slate-900">{activeLesson.title}</span>
                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                  {activeLesson.contentType}
                </span>
              </p>
            )}
          </div>

          {editorReady && activeLesson && (
            <>
              {activeLesson.contentType === 'tiptap' && (
                <CourseTipTapEditor
                  key={activeLesson.id}
                  initialContent={activeLesson.contentHtml}
                  onChange={(html) => {
                    updateLesson(activeLesson.id, (l) => {
                      if (l.contentType !== 'tiptap') return l
                      return { ...l, contentHtml: html }
                    })
                  }}
                />
              )}

              {activeLesson.contentType === 'video' && (
                <LessonVideoEditor
                  key={activeLesson.id}
                  videoUrl={activeLesson.videoUrl}
                  description={activeLesson.contentHtml ?? ''}
                  onVideoUrlChange={(url) => {
                    updateLesson(activeLesson.id, (l) => {
                      if (l.contentType !== 'video') return l
                      return { ...l, videoUrl: url }
                    })
                  }}
                  onDescriptionChange={(html) => {
                    updateLesson(activeLesson.id, (l) => {
                      if (l.contentType !== 'video') return l
                      return { ...l, contentHtml: html }
                    })
                  }}
                />
              )}

              {activeLesson.contentType === 'quiz' && (
                <LessonQuizEditor
                  key={activeLesson.id}
                  quiz={activeLesson.quiz}
                  onChange={(quiz) => {
                    updateLesson(activeLesson.id, (l) => {
                      if (l.contentType !== 'quiz') return l
                      return { ...l, quiz }
                    })
                  }}
                />
              )}
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Semua perubahan disimpan ke sesi lokal setelah menekan tombol Simpan.
            </p>
            <Button type="button" className="rounded-xl px-5" onClick={() => void handleSaveClick()}>
              Save
            </Button>
          </div>
        </div>

        <CourseModuleOutline
          modules={modules}
          activeLessonId={activeLessonId}
          onSelectLesson={setActiveLessonId}
          onModulesChange={setModules}
        />
      </div>
    </section>
  )
}
