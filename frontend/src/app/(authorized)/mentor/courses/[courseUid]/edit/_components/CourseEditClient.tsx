'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { IModule, ILesson, IMentorCourse } from '@/lib/types'
import { getManagedCourseByUid, getSessionCourseModules, publishMentorCourse, setSessionCourseModules, upsertExtraCourse } from '@/lib/mentorCourseStorage'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { toast } from 'sonner'
import { CourseModuleOutline } from './CourseModuleOutline'
import { CourseAssignmentDialog } from '../../assignments/_components/CourseAssignmentDialog'
import Image from 'next/image'

const CourseTipTapEditor = dynamic(() => import('./CourseTipTapEditor').then((m) => ({ default: m.CourseTipTapEditor })), {
  ssr: false,
  loading: () => <div className="min-h-60 animate-pulse rounded-xl border border-slate-100 bg-slate-50" />,
})

const LessonVideoEditor = dynamic(() => import('./LessonVideoEditor').then((m) => ({ default: m.LessonVideoEditor })), { ssr: false })

const LessonQuizEditor = dynamic(() => import('./LessonQuizEditor').then((m) => ({ default: m.LessonQuizEditor })), { ssr: false })

type CourseEditClientProps = {
  courseUid: string
  initialModuleId?: string
  routeBasePath?: '/mentor' | '/admin'
  role?: 'mentor' | 'admin'
}

function findLesson(modules: IModule[], lessonId: string): ILesson | null {
  for (const m of modules) {
    const l = m.lessons.find((l) => l.id === lessonId)
    if (l) return l
  }
  return null
}

export function CourseEditClient({ courseUid, initialModuleId, routeBasePath = '/mentor', role = 'mentor' }: CourseEditClientProps) {
  const isAdmin = role === 'admin'
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
    const fromList = getManagedCourseByUid(courseUid, isAdmin ? 'all' : 'mentor')
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

    setCourse(fromList)
  }, [courseUid, initialModuleId, isAdmin])

  const updateLesson = (lessonId: string, updater: (l: ILesson) => ILesson) => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === lessonId ? updater(l) : l)),
      })),
    )
  }

  const handleSave = (opts?: { silent?: boolean; redirect?: boolean }) => {
    if (!modules.length) return
    setSessionCourseModules(courseUid, { version: 2, modules })
    if (!opts?.silent) toast.success('Perubahan berhasil disimpan.')
    if (opts?.redirect !== false) {
      router.push(`${routeBasePath}/courses/${courseUid}`)
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
    toast.success('Kursus berhasil dipublikasikan.')
    router.push(`${routeBasePath}/courses/${courseUid}`)
    router.refresh()
  }

  const handlePublishClick = async () => {
    const ok = await confirm({
      title: 'Publikasikan kursus?',
      description: 'Kursus akan ditandai aktif dan muncul di daftar pengelolaan kursus.',
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
        <p className="text-slate-600">Kursus tidak ditemukan. Akses editor hanya dari daftar kursus atau setelah membuat kursus baru.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl">
          <Link href={`${routeBasePath}/courses`}>Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader title={course.title} subtitle={course.header} />
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              course.published ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-100 text-slate-600'
            }`}>
            {course.published ? 'Aktif' : 'Belum dipublikasikan'}
          </span>
          {!course.published && isAdmin && (
            <Button type="button" className="rounded-xl" onClick={() => void handlePublishClick()}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {course.image && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <Image src={course.image} width={384} height={256} loading="lazy" alt={course.title} className="max-h-56 w-full object-cover" />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Konten lesson</h2>
            {activeLesson && (
              <p className="text-sm font-medium text-slate-700">
                Sedang mengedit: <span className="text-slate-900">{activeLesson.title}</span>
                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">{activeLesson.contentType}</span>
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
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Tipe konten lesson Quiz sudah tidak digunakan. Ubah tipe lesson ke Text atau Video dari panel struktur modul.
                </div>
              )}
            </>
          )}

          {activeLesson && (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`lesson-homework-${activeLesson.id}`}
                  className="mt-0.5 size-4 border-slate-300"
                  checked={Boolean(activeLesson.hasHomework)}
                  onCheckedChange={(checked) => {
                    const enabled = checked === true
                    updateLesson(activeLesson.id, (lesson) => ({
                      ...lesson,
                      hasHomework: enabled,
                      homeworkType: lesson.homeworkType ?? 'text',
                      homeworkDescriptionHtml: lesson.homeworkDescriptionHtml ?? '<p></p>',
                      homeworkQuiz: lesson.homeworkQuiz ?? { questions: [], passingScore: 70 },
                    }))
                  }}
                />
                <div>
                  <label htmlFor={`lesson-homework-${activeLesson.id}`} className="cursor-pointer text-sm font-semibold text-slate-700">
                    Aktifkan tugas untuk lesson ini
                  </label>
                  <p className="mt-1 text-xs text-slate-500">Saat aktif, pilih tipe tugas lalu isi kontennya sebelum membuat assignment lesson.</p>
                </div>
              </div>

              {activeLesson.hasHomework && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <CourseAssignmentDialog
                    open={Boolean(activeLesson.hasHomework)}
                    onOpenChange={() => undefined}
                    variant="inline"
                    course={course}
                    courseUid={courseUid}
                    mode="create"
                    editing={null}
                    onSaved={() => undefined}
                    defaultMeetingNumber={activeLesson.order}
                    defaultTitle={`Tugas: ${activeLesson.title}`}
                    defaultTaskType={activeLesson.homeworkType ?? 'text'}
                    defaultTaskDescription={activeLesson.homeworkDescriptionHtml ?? '<p></p>'}
                    defaultTaskQuiz={activeLesson.homeworkQuiz}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Semua perubahan disimpan ke sesi lokal setelah menekan tombol Simpan.</p>
            <Button type="button" className="rounded-xl px-5" onClick={() => void handleSaveClick()}>
              Save
            </Button>
          </div>
        </div>

        <CourseModuleOutline modules={modules} activeLessonId={activeLessonId} onSelectLesson={setActiveLessonId} onModulesChange={setModules} />
      </div>
    </section>
  )
}
