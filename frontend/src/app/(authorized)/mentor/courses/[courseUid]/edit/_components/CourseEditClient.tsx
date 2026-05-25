'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueries } from '@tanstack/react-query'
import { Button } from '../../../../../../../components/ui/button'
import { Checkbox } from '../../../../../../../components/ui/checkbox'
import { PageHeader } from '../../../../../../../components/layout/PageHeader'
import { useConfirm } from '../../../../../../../components/feedback/ConfirmProvider'
import type { IModule, ILesson, IMentorCourse, IQuiz } from '../../../../../../../lib/types'
import { get, post, put, type Envelope } from '../../../../../../../lib/api/fetcher'
import { queryKeys } from '../../../../../../../lib/api/query-keys'
import { useCourseByUidQuery } from '../../../../../../../hooks/api/use-course-queries'
import { usePublishCourse } from '../../../../../../../hooks/api/use-course-edit-mutations'
import type { TiptapRichTextEditorProps } from '../../../../../../../components/rich-text/TiptapRichTextEditor'
import { toast } from 'sonner'
import { CourseModuleOutline } from './CourseModuleOutline'
import { CourseAssignmentDialog } from '../../assignments/_components/CourseAssignmentDialog'
import Image from 'next/image'

const CourseTipTapEditor = dynamic<TiptapRichTextEditorProps>(() => import('./CourseTipTapEditor').then((m) => ({ default: m.CourseTipTapEditor })), {
  ssr: false,
  loading: () => <div className="min-h-60 animate-pulse rounded-xl border border-slate-100 bg-slate-50" />,
})

const LessonVideoEditor = dynamic(() => import('./LessonVideoEditor').then((m) => ({ default: m.LessonVideoEditor })), { ssr: false })

type CourseEditClientProps = {
  courseUid: string
  initialModuleId?: string
  routeBasePath?: '/mentor' | '/admin'
  role?: 'mentor' | 'admin'
}

type CourseModuleApiItem = Record<string, unknown>
type LessonApiItem = Record<string, unknown>
type EditableLesson = ILesson & { uid?: string }
type EditableModule = Omit<IModule, 'lessons'> & { uid?: string; lessons: EditableLesson[] }
type LessonListResponse = {
  lessons: LessonApiItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function createLocalId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function getPersistedUid(item: { uid?: unknown; id?: unknown }): string | undefined {
  if (isUuid(item.uid)) return item.uid
  if (isUuid(item.id)) return item.id
  return undefined
}

function findLesson(modules: EditableModule[], lessonId: string): EditableLesson | null {
  for (const courseModule of modules) {
    const lesson = courseModule.lessons.find((item: EditableLesson) => item.id === lessonId)
    if (lesson) return lesson
  }
  return null
}

function toMentorCourse(course: Record<string, unknown>): IMentorCourse {
  const category = course.category as { name?: unknown } | undefined
  const courseType = course.course_type as { name?: unknown } | undefined

  return {
    uid: (course.uid as string) ?? '',
    title: (course.title as string) ?? '',
    header: (course.subtitle as string) ?? '',
    description: (course.description as string) ?? '',
    image: (course.cover_url as string) ?? (course.thumbnail_url as string) ?? '',
    published: Boolean(course.is_published),
    moduleCount: Array.isArray(course.modules) ? course.modules.length : 0,
    studentCount: 0,
    rating: 0,
    totalReviews: 0,
    updatedAt: (course.updated_at as string) ?? '',
    category: typeof category?.name === 'string' ? (category.name as IMentorCourse['category']) : undefined,
    level: (course.level as IMentorCourse['level']) ?? undefined,
    classType: typeof courseType?.name === 'string' ? (courseType.name as IMentorCourse['classType']) : undefined,
    price: typeof course.price === 'number' ? course.price : undefined,
    strikePrice: typeof course.price_strike === 'number' ? course.price_strike : undefined,
    whatYouLearn: Array.isArray(course.what_you_learn) ? (course.what_you_learn as unknown[]).filter((item): item is string => typeof item === 'string') : undefined,
  }
}

function createDefaultQuiz(): IQuiz {
  return { questions: [], passingScore: 70 }
}

function createFallbackLesson(order = 1): EditableLesson {
  return {
    id: createLocalId('lesson'),
    title: `Lesson ${order}`,
    order,
    durationMinutes: 10,
    hasHomework: false,
    homeworkType: 'text',
    homeworkDescriptionHtml: '<p></p>',
    homeworkQuiz: createDefaultQuiz(),
    contentType: 'tiptap',
    contentHtml: '',
  }
}

function createFallbackModule(order = 1): EditableModule {
  return {
    id: createLocalId('module'),
    title: `Modul ${order}`,
    order,
    lessons: [createFallbackLesson(1)],
  }
}

function toLesson(item: LessonApiItem, fallbackOrder: number): EditableLesson {
  const rawContent = item.content
  const contentObject = rawContent && typeof rawContent === 'object' ? (rawContent as Record<string, unknown>) : undefined
  const contentType =
    (item.content_type as string | undefined) === 'video' || Boolean(item.video_url)
      ? 'video'
      : (item.content_type as string | undefined) === 'quiz' || Boolean(contentObject?.quiz)
        ? 'quiz'
        : 'tiptap'

  const base = {
    id: (item.uid as string) ?? (item.id as string) ?? `lesson-${fallbackOrder}`,
    uid: isUuid(item.uid) ? item.uid : isUuid(item.id) ? item.id : undefined,
    title: (item.title as string) ?? `Lesson ${fallbackOrder}`,
    order: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    durationMinutes: 10,
    hasHomework: false,
    homeworkType: 'text' as const,
    homeworkDescriptionHtml: '<p></p>',
    homeworkQuiz: createDefaultQuiz(),
  }

  const contentHtml =
    typeof contentObject?.contentHtml === 'string' ? contentObject.contentHtml : typeof contentObject?.html === 'string' ? contentObject.html : typeof rawContent === 'string' ? rawContent : ''

  if (contentType === 'video') {
    return {
      ...base,
      contentType: 'video',
      videoUrl: (item.video_url as string) ?? '',
      contentHtml,
    }
  }

  if (contentType === 'quiz') {
    const quiz = (contentObject?.quiz as IQuiz | undefined) ?? createDefaultQuiz()
    return {
      ...base,
      contentType: 'quiz',
      quiz,
    }
  }

  return {
    ...base,
    contentType: 'tiptap',
    contentHtml,
  }
}

function toModule(item: CourseModuleApiItem, lessons: EditableLesson[], fallbackOrder: number): EditableModule {
  return {
    id: ((item.uid as string) ?? createLocalId('module')) as string,
    uid: getPersistedUid(item),
    title: (item.title as string) ?? `Modul ${fallbackOrder}`,
    order: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    lessons: lessons.length > 0 ? lessons : [createFallbackLesson(1)],
  }
}

export function CourseEditClient({ courseUid, initialModuleId, routeBasePath = '/mentor', role = 'mentor' }: CourseEditClientProps) {
  const isAdmin = role === 'admin'
  const confirm = useConfirm()
  const router = useRouter()
  const { data: courseData } = useCourseByUidQuery(courseUid)
  const publishCourse = usePublishCourse(courseUid)

  const [course, setCourse] = useState<IMentorCourse | null>(null)
  const [modules, setModules] = useState<EditableModule[]>([])
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [editorReady, setEditorReady] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [modifiedLessons, setModifiedLessons] = useState<Set<string>>(new Set())

  console.log('CourseEditClient render', { courseData, modules, activeLessonId, modifiedLessons })

  const courseModules = useMemo<CourseModuleApiItem[]>(() => {
    if (!courseData || typeof courseData !== 'object') return []
    const modulesData = (courseData as Record<string, unknown>).modules
    return Array.isArray(modulesData) ? (modulesData as CourseModuleApiItem[]) : []
  }, [courseData])

  const lessonQueries = useQueries({
    queries: courseModules.map((module) => ({
      queryKey: queryKeys.lessons.list({ module_uid: (module.uid as string) ?? '', per_page: 1000 }),
      queryFn: () =>
        get<Envelope<LessonListResponse>>('/lessons', {
          module_uid: (module.uid as string) ?? '',
          per_page: 1000,
        }).then((response: Envelope<LessonListResponse>) => response.data),
      enabled: Boolean(module.uid),
    })),
  })

  const modulesLoading = lessonQueries.some((query) => query.isPending)

  const fetchedModules = useMemo(() => {
    return courseModules.map((module, index) => {
      const lessonItems = lessonQueries[index]?.data?.lessons ?? []
      const lessons = lessonItems.length > 0 ? lessonItems.map((item: LessonApiItem, lessonIndex: number) => toLesson(item, lessonIndex + 1)) : [createFallbackLesson(1)]
      return toModule(module, lessons, index + 1)
    })
  }, [courseModules, lessonQueries])

  const hasCourseModules = courseModules.length > 0

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null
    return findLesson(modules, activeLessonId)
  }, [modules, activeLessonId])

  // Initialize course data from API response
  useEffect(() => {
    if (courseData && typeof courseData === 'object') {
      setCourse(toMentorCourse(courseData as Record<string, unknown>))
      return
    }
    setCourse(null)
  }, [courseData])

  // Initialize modules only once when data is loaded
  useEffect(() => {
    if (isInitialized || modulesLoading || !courseData || typeof courseData !== 'object') return

    if (!hasCourseModules) {
      const fallbackModule = createFallbackModule(1)
      setModules([fallbackModule])

      const fallbackLessonId = fallbackModule.lessons[0]?.id ?? null
      setActiveLessonId(fallbackLessonId)
      setEditorReady(true)
      setIsInitialized(true)
      return
    }

    const nextModules = fetchedModules.length > 0 ? fetchedModules : [createFallbackModule(1)]
    setModules(nextModules)

    const firstLessonId = (() => {
      if (initialModuleId) {
        const targetModule = nextModules.find((module) => module.id === initialModuleId)
        if (targetModule?.lessons[0]) return targetModule.lessons[0].id
      }
      return nextModules[0]?.lessons[0]?.id ?? null
    })()

    setActiveLessonId(firstLessonId)
    setEditorReady(true)
    setIsInitialized(true)
  }, [modulesLoading, isInitialized, fetchedModules, initialModuleId, courseData, hasCourseModules])

  // Update lesson and mark as modified
  const updateLesson = useCallback((lessonId: string, updater: (lesson: EditableLesson) => EditableLesson) => {
    setModules((previous: IModule[]) =>
      previous.map((module: EditableModule) => ({
        ...module,
        lessons: module.lessons.map((lesson: EditableLesson) => {
          if (lesson.id === lessonId) {
            setModifiedLessons((prev) => new Set([...prev, lessonId]))
            return updater(lesson)
          }
          return lesson
        }),
      })),
    )
  }, [])

  const handleSave = useCallback(
    async (opts?: { silent?: boolean; redirect?: boolean }) => {
      try {
        const nextModules = modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({ ...lesson })),
        }))

        const buildLessonPayload = (lesson: EditableLesson) => {
          const payload: Record<string, unknown> = {
            title: lesson.title,
            order_index: lesson.order,
          }

          if (lesson.contentType === 'video') {
            payload.content_type = 'video'
            payload.video_url = (lesson as any).videoUrl || ''
            payload.content = (lesson as any).contentHtml || ''
          } else if (lesson.contentType === 'quiz') {
            payload.content_type = 'quiz'
            payload.content = { quiz: (lesson as any).quiz || {} }
          } else {
            payload.content_type = 'text'
            payload.content = (lesson as any).contentHtml || ''
          }

          return payload
        }

        for (const courseModule of nextModules) {
          const persistedModuleUid = courseModule.uid
          let moduleUid = persistedModuleUid

          if (moduleUid) {
            await put<Envelope<Record<string, unknown>>>(`/modules/${moduleUid}`, {
              title: courseModule.title,
              order_index: courseModule.order,
            })
          } else {
            const createdModuleResponse = await post<Envelope<Record<string, unknown>>>('/modules', {
              course_uid: courseUid,
              title: courseModule.title,
              order_index: courseModule.order,
            })

            moduleUid = getPersistedUid(createdModuleResponse.data)
            if (!moduleUid) {
              throw new Error('Backend tidak mengembalikan uid untuk module baru.')
            }

            courseModule.uid = moduleUid
          }

          for (const lesson of courseModule.lessons) {
            if (lesson.uid) {
              await put<Envelope<Record<string, unknown>>>(`/lessons/${lesson.uid}`, buildLessonPayload(lesson))
              continue
            }

            const createdLessonResponse = await post<Envelope<Record<string, unknown>>>('/lessons', {
              module_uid: moduleUid,
              ...buildLessonPayload(lesson),
            })

            const createdLessonUid = getPersistedUid(createdLessonResponse.data)
            if (!createdLessonUid) {
              throw new Error('Backend tidak mengembalikan uid untuk lesson baru.')
            }

            lesson.uid = createdLessonUid
          }
        }

        setModules(nextModules)
        setModifiedLessons(new Set())

        if (modules.length === 0) {
          toast.info('Module dan lesson baru berhasil dibuat di backend.')
        }

        if (!opts?.silent) toast.success('Perubahan diterapkan.')
        if (opts?.redirect !== false) {
          router.push(`${routeBasePath}/courses/${courseUid}`)
          router.refresh()
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal menyimpan perubahan.')
      }
    },
    [modules, courseUid, routeBasePath, router],
  )

  const handleSaveClick = async () => {
    const ok = await confirm({
      title: 'Simpan perubahan?',
      description: 'Semua perubahan di form ini akan diterapkan pada tampilan editor saat ini.',
      confirmLabel: 'Simpan',
    })
    if (!ok) return
    await handleSave({ redirect: true })
  }

  const handlePublish = useCallback(async () => {
    try {
      await handleSave({ silent: true, redirect: false })
      await publishCourse.mutateAsync()
      setCourse((previous: IMentorCourse | null) => (previous ? { ...previous, published: true } : previous))
      toast.success('Kursus berhasil dipublikasikan.')
      router.push(`${routeBasePath}/courses/${courseUid}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mempublikasikan kursus.')
    }
  }, [handleSave, publishCourse, courseUid, routeBasePath, router])

  const handlePublishClick = async () => {
    const ok = await confirm({
      title: 'Publikasikan kursus?',
      description: 'Kursus akan ditandai aktif dan muncul di daftar pengelolaan kursus.',
      confirmLabel: 'Publish',
    })
    if (!ok) return
    await handlePublish()
  }

  if (modulesLoading) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-500">Memuat lesson…</p>
      </section>
    )
  }

  if (!course) {
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
                  onChange={(html: string) => {
                    updateLesson(activeLesson.id, (lesson: EditableLesson) => {
                      if (lesson.contentType !== 'tiptap') return lesson
                      return { ...lesson, contentHtml: html }
                    })
                  }}
                />
              )}

              {activeLesson.contentType === 'video' && (
                <LessonVideoEditor
                  key={activeLesson.id}
                  videoUrl={activeLesson.videoUrl}
                  description={activeLesson.contentHtml ?? ''}
                  onVideoUrlChange={(url: string) => {
                    updateLesson(activeLesson.id, (lesson: EditableLesson) => {
                      if (lesson.contentType !== 'video') return lesson
                      return { ...lesson, videoUrl: url }
                    })
                  }}
                  onDescriptionChange={(html: string) => {
                    updateLesson(activeLesson.id, (lesson: EditableLesson) => {
                      if (lesson.contentType !== 'video') return lesson
                      return { ...lesson, contentHtml: html }
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
                  onCheckedChange={(checked: boolean | 'indeterminate') => {
                    const enabled = checked === true
                    updateLesson(activeLesson.id, (lesson: EditableLesson) => {
                      if (enabled) {
                        return {
                          ...lesson,
                          hasHomework: true,
                          homeworkType: lesson.homeworkType ?? 'text',
                          homeworkDescriptionHtml: lesson.homeworkDescriptionHtml ?? '<p></p>',
                          homeworkQuiz: lesson.homeworkQuiz ?? createDefaultQuiz(),
                        }
                      }

                      return {
                        ...lesson,
                        hasHomework: false,
                      }
                    })
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
            <p className="text-xs text-slate-500">Semua perubahan disimpan di state editor ini sampai backend update tersedia.</p>
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
