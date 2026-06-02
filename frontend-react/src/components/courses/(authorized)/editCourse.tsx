import { useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { ILesson, IQuiz } from '../../../lib/types/course'
import type { CourseDetailItem, IModulesData, LessonDetailItem } from '../../../lib/types/api'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../ui/button'
import { ROUTES } from '../../../lib/routes'
import { PageHeader } from '../../shared/Header'
import { Checkbox } from '../../ui/checkbox'
import { ConfirmDialog } from '../../shared/ConfirmDialog'
import { TiptapEditor } from '../../shared/TipTapEditor'
import { LessonVideoEditor } from '../../shared/LessonVideoEditor'
import { CourseAssignmentDialog } from '../../shared/CourseAssignmentDialog'
import { CourseModuleOutline } from '../../shared/CourseModuleOutline'

type CourseEditClientProps = {
  initialModuleId?: string
  routeBasePath?: '/mentor' | '/admin'
  role?: 'mentor' | 'admin'
  courseData: CourseDetailItem
}

type LessonApiItem = LessonDetailItem
type EditableLesson = ILesson & { uid?: string }
type EditableModule = Omit<IModulesData, 'lessons'> & { uid?: string; lessons: EditableLesson[] }
type OutlineLesson = NonNullable<IModulesData['lessons']>[number]

function createLocalId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function findLesson(modules: EditableModule[], lessonId: string): EditableLesson | null {
  for (const courseModule of modules) {
    const lesson = courseModule.lessons.find((item: EditableLesson) => item.id === lessonId)
    if (lesson) return lesson
  }
  return null
}

function toMentorCourse(course: CourseDetailItem): Partial<CourseDetailItem> {
  const category = course.category as { name?: unknown } | undefined
  const courseType = course.course_type as { name?: unknown } | undefined

  return {
    uid: (course.uid as string) ?? '',
    title: (course.title as string) ?? '',
    subtitle: (course.subtitle as string) ?? '',
    description: (course.description as string) ?? '',
    cover_url: (course.cover_url as string) ?? (course.thumbnail_url as string) ?? '',
    is_published: Boolean(course.is_published),
    updated_at: (course.updated_at as string) ?? '',
    category: typeof category?.name === 'string' ? (category as CourseDetailItem['category']) : undefined,
    level: (course.level as CourseDetailItem['level']) ?? undefined,
    course_type: typeof courseType?.name === 'string' ? (courseType as CourseDetailItem['course_type']) : undefined,
    price: typeof course.price === 'number' ? course.price : undefined,
    price_strike: typeof course.price_strike === 'number' ? course.price_strike : undefined,
    what_you_learn: Array.isArray(course.what_you_learn) ? (course.what_you_learn as unknown[]).filter((item): item is string => typeof item === 'string') : undefined,
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
    contentType: 'text',
    contentHtml: '',
  }
}

function createFallbackModule(order_index = 1): EditableModule {
  return {
    uid: createLocalId('module'),
    course_uid: '',
    created_at: '',
    order_index,
    title: `Modul ${order_index}`,
    lessons: [createFallbackLesson(1)],
  }
}

function toLesson(item: LessonApiItem, fallbackOrder: number): EditableLesson {
  const rawContent = item.content
  const contentObject = rawContent && typeof rawContent === 'object' ? (rawContent as { quiz?: IQuiz; contentHtml?: string; html?: string }) : undefined
  const contentType =
    (item.content_type as string | undefined) === 'video' || Boolean(item.video_url)
      ? 'video'
      : 'text'

  const base = {
    id: (item.uid as string) ?? `lesson-${fallbackOrder}`,
    uid: item.uid as string,
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

  return {
    ...base,
    contentType: 'text',
    contentHtml,
  }
}

function toModule(item: IModulesData, lessons: EditableLesson[], fallbackOrder: number): EditableModule {
  return {
    uid: item.uid,
    course_uid: (item.course_uid as string) ?? '',
    title: (item.title as string) ?? `Modul ${fallbackOrder}`,
    order_index: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    created_at: (item.created_at as string) ?? '',
    lessons: lessons.length > 0 ? lessons : [createFallbackLesson(1)],
  }
}

export function CourseEditClient({ initialModuleId, routeBasePath = '/mentor', role = 'mentor', courseData }: CourseEditClientProps) {
  const isAdmin = role === 'admin'
  const navigate = useNavigate()

  const [course, setCourse] = useState<Partial<CourseDetailItem> | null>(null)
  const [modules, setModules] = useState<EditableModule[]>([])
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [editorReady, setEditorReady] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [modifiedLessons, setModifiedLessons] = useState<Set<string>>(new Set())
  const [isConfirm, setIsConfirm] = useState(false)

  console.log('CourseEditClient render', { courseData, modules, activeLessonId, modifiedLessons })

  const courseModules = useMemo<IModulesData[]>(() => {
    if (!courseData || typeof courseData !== 'object') return []
    const modulesData = (courseData as CourseDetailItem).modules
    return Array.isArray(modulesData) ? (modulesData as IModulesData[]) : []
  }, [courseData])

  // const lessonQueries = useQueries({
  //   queries: courseModules.map((module) => ({
  //     queryKey: queryKeys.lessons.list({ module_uid: (module.uid as string) ?? '', per_page: 1000 }),
  //     queryFn: () =>
  //       get<Envelope<LessonListResponse>>('/lessons', {
  //         module_uid: (module.uid as string) ?? '',
  //         per_page: 1000,
  //       }).then((response: Envelope<LessonListResponse>) => response.data),
  //     enabled: Boolean(module.uid),
  //   })),
  // })

  // const modulesLoading = lessonQueries.some((query) => query.isPending)

  const fetchedModules = useMemo(() => {
    if (!courseModules || courseModules.length === 0) return []
    return courseModules.map((module, index) => {
      const lessonItems: LessonApiItem[] = [] // lessonQueries[index]?.data?.lessons ?? []
      const lessons = lessonItems.length > 0 ? lessonItems.map((item: LessonApiItem, lessonIndex: number) => toLesson(item, lessonIndex + 1)) : [createFallbackLesson(1)]
      return toModule(module, lessons, index + 1)
    })
    // return courseModules.map((module, index) => {
    //   const lessonItems = lessonQueries[index]?.data?.lessons ?? []
    //   const lessons = lessonItems.length > 0 ? lessonItems.map((item: LessonApiItem, lessonIndex: number) => toLesson(item, lessonIndex + 1)) : [createFallbackLesson(1)]
    //   return toModule(module, lessons, index + 1)
    // })
  }, [courseModules])

  const hasCourseModules = courseModules.length > 0

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null
    return findLesson(modules, activeLessonId)
  }, [modules, activeLessonId])

  const outlineModules = useMemo<IModulesData[]>(() => {
    return modules.map((module) => ({
      ...(module as unknown as IModulesData),
      lessons: module.lessons.map(
        (lesson, index) =>
          ({
            ...(lesson as unknown as OutlineLesson),
            uid: lesson.uid ?? lesson.id,
            module_uid: module.uid ?? '',
            order_index: lesson.order ?? index + 1,
            created_at: (lesson as unknown as { created_at?: string }).created_at ?? '',
            updated_at: (lesson as unknown as { updated_at?: string }).updated_at ?? '',
          }) as OutlineLesson,
      ),
    }))
  }, [modules])

  // Initialize course data from API response
  useEffect(() => {
    if (courseData && typeof courseData === 'object') {
      setCourse(toMentorCourse(courseData as CourseDetailItem))
      return
    }
    setCourse(null)
  }, [courseData])

  // Initialize modules only once when data is loaded
  useEffect(() => {
    if (isInitialized || !courseData || typeof courseData !== 'object') return

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
        const targetModule = nextModules.find((module) => module.uid === initialModuleId)
        if (targetModule?.lessons[0]) return targetModule.lessons[0].id
      }
      return nextModules[0]?.lessons[0]?.id ?? null
    })()

    setActiveLessonId(firstLessonId)
    setEditorReady(true)
    setIsInitialized(true)
  }, [isInitialized, fetchedModules, initialModuleId, courseData, hasCourseModules])

  // Update lesson and mark as modified
  const updateLesson = useCallback((lessonId: string, updater: (lesson: EditableLesson) => EditableLesson) => {
    setModules((previous: EditableModule[]) =>
      previous.map((module) => ({
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

        for (const courseModule of nextModules) {
          const persistedModuleUid = courseModule.uid
          const moduleUid = persistedModuleUid

          if (moduleUid) {
            // await put<Envelope<Record<string, unknown>>>(`/modules/${moduleUid}`, {
            //   title: courseModule.title,
            //   order_index: courseModule.order_index,
            // })
          } else {
            // const createdModuleResponse = await post<Envelope<Record<string, unknown>>>('/modules', {
            //   course_uid: course?.uid ?? '',
            //   title: courseModule.title,
            //   order_index: courseModule.order_index,
            // })
            // moduleUid = createdModuleResponse.data.uid
            // if (!moduleUid) {
            //   throw new Error('Backend tidak mengembalikan uid untuk module baru.')
            // }
            // courseModule.uid = moduleUid
          }

          // Lesson persistence can be re-enabled here once the API mutation layer is connected.
        }

        setModules(nextModules)
        setModifiedLessons(new Set())

        if (modules.length === 0) {
          toast.info('Module dan lesson baru berhasil dibuat di backend.')
        }

        if (!opts?.silent) toast.success('Perubahan diterapkan.')
        if (opts?.redirect !== false) {
          navigate(`${routeBasePath}/courses/${courseData.uid}`)
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal menyimpan perubahan.')
      }
    },
    [modules, routeBasePath, navigate, courseData.uid],
  )

  const handlePublish = useCallback(async () => {
    try {
      await handleSave({ silent: true, redirect: false })
      // await publishCourse.mutateAsync()
      setCourse((previous: Partial<CourseDetailItem> | null) => (previous ? { ...previous, published: true } : previous))
      toast.success('Kursus berhasil dipublikasikan.')
      navigate(`${routeBasePath}/courses/${courseData.uid}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mempublikasikan kursus.')
    }
  }, [handleSave, courseData.uid, routeBasePath, navigate])

  const handlePublishClick = async () => {
    await handlePublish()
  }

  if (!course) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">Kursus tidak ditemukan. Akses editor hanya dari daftar kursus atau setelah membuat kursus baru.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl">
          <Link to={ROUTES.courses}>Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-6">
      {isConfirm && <ConfirmDialog open={isConfirm} onOpenChange={setIsConfirm} title="Konfirmasi Publish" />}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader title={course.title ?? ''} subtitle={course.subtitle} />
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              course.is_published ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-100 text-slate-600'
            }`}>
            {course.is_published ? 'Aktif' : 'Belum dipublikasikan'}
          </span>
          {!course.is_published && isAdmin && (
            <Button type="button" className="rounded-xl" onClick={() => void handlePublishClick()}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {course.cover_url && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <img src={course.cover_url} width={384} height={256} loading="lazy" alt={course.title} className="max-h-56 w-full object-cover" />
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
              {activeLesson.contentType === 'text' && (
                <TiptapEditor
                  key={activeLesson.id}
                  initialContent={activeLesson.contentHtml}
                  onChange={(html: string) => {
                    updateLesson(activeLesson.id, (lesson: EditableLesson) => {
                      if (lesson.contentType !== 'text') return lesson
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
                    course={course as CourseDetailItem}
                    courseUid={courseData.uid}
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
            <Button type="button" className="rounded-xl px-5" onClick={() => setIsConfirm(true)}>
              Simpan Perubahan
            </Button>
          </div>
        </div>

        <CourseModuleOutline
          modules={outlineModules}
          activeLessonId={activeLessonId}
          onSelectLesson={setActiveLessonId}
          onModulesChange={(nextModules: IModulesData[]) => setModules(nextModules as unknown as EditableModule[])}
        />
      </div>
    </section>
  )
}
