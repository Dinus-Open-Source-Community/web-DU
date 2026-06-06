import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  addLesson,
  addModule,
  changeLessonDeliveryType,
  findModuleByLessonId,
  getFirstLessonId,
  removeLesson,
  removeModule,
  renameLesson,
  renameModule,
} from '@/lib/course-curriculum'
import {
  createFallbackLesson,
  createFallbackModule,
  editableLessonToPayloadInput,
  findLesson,
  getLessonKey,
  mergeOutlineModules,
  toLesson,
  toMentorCourse,
  toModule,
  toOutlineModules,
} from '@/lib/course-edit/mappers'
import type {
  CourseEditClientProps,
  EditableLesson,
  EditableModule,
  LessonApiItem,
} from '@/lib/course-edit/types'
import type { ICourseDetailItem, ICourseDetailModule } from '@/lib/types/course'
import { validateLessonPayloadInputs } from '@/lib/validator/lessons'
import { courseKeys, lessonKeys, moduleKeys } from '@/hooks/query-keys'
import { useLessonByUid } from '@/hooks/use-lessons'
import { createLesson, deleteLesson, updateLesson } from '@/services/lessons'
import { createModule, deleteModule, updateModule } from '@/services/module'

export function useCourseEditController({
  initialModuleId,
  routeBasePath = '/mentor',
  courseData,
  modules: sourceModules,
  lessonsByModule,
}: CourseEditClientProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [course, setCourse] = useState<Partial<ICourseDetailItem> | null>(null)
  const [modules, setModules] = useState<EditableModule[]>([])
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false)
  const [renameModuleId, setRenameModuleId] = useState<string | null>(null)
  const [editorReady, setEditorReady] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [modifiedLessons, setModifiedLessons] = useState<Set<string>>(new Set())
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const persistedModuleUidsRef = useRef<Set<string>>(new Set())
  const [persistedLessonUids, setPersistedLessonUids] = useState<Set<string>>(
    () => new Set(),
  )
  const initialLessonModuleMapRef = useRef<Map<string, string>>(new Map())
  const lastHydratedLessonRef = useRef<string | null>(null)

  const hasCourseModules = sourceModules.length > 0

  const fetchedModules = useMemo(() => {
    if (!sourceModules || sourceModules.length === 0) return []
    return sourceModules.map((module, index) => {
      const lessonItems: LessonApiItem[] = (lessonsByModule[module.uid] ?? []).map(
        (lesson) => ({
          ...lesson,
          is_reading: 'is_reading' in lesson ? Boolean(lesson.is_reading) : false,
        }),
      )
      const lessons =
        lessonItems.length > 0
          ? lessonItems.map((item, lessonIndex) => toLesson(item, lessonIndex + 1))
          : [createFallbackLesson(1)]
      return toModule(module, lessons, index + 1)
    })
  }, [sourceModules, lessonsByModule])

  const shouldLoadLessonDetail = Boolean(
    activeLessonId &&
      persistedLessonUids.has(activeLessonId) &&
      !modifiedLessons.has(activeLessonId),
  )

  const lessonDetailQuery = useLessonByUid(
    shouldLoadLessonDetail ? activeLessonId! : '',
  )

  const outlineModules = useMemo(() => toOutlineModules(modules), [modules])

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null
    return findLesson(modules, activeLessonId)
  }, [modules, activeLessonId])

  const activeOutlineModule = useMemo(() => {
    if (outlineModules.length === 0) return null
    return (
      outlineModules.find((module) => module.uid === activeModuleId) ??
      outlineModules[0]
    )
  }, [outlineModules, activeModuleId])

  const renameModuleTitle =
    outlineModules.find((module) => module.uid === renameModuleId)?.title ?? ''

  useEffect(() => {
    if (courseData && typeof courseData === 'object') {
      setCourse(toMentorCourse(courseData as ICourseDetailItem))
      return
    }
    setCourse(null)
  }, [courseData])

  useEffect(() => {
    if (!shouldLoadLessonDetail || !lessonDetailQuery.data || !activeLessonId) return
    if (modifiedLessons.has(activeLessonId)) return
    if (lastHydratedLessonRef.current === activeLessonId) return

    const lessonApiItem = lessonDetailQuery.data as LessonApiItem
    const hydrated = toLesson(
      lessonApiItem,
      Number(lessonApiItem.order_index ?? 1) || 1,
    )

    lastHydratedLessonRef.current = activeLessonId
    setModules((previous) =>
      previous.map((courseModule) => ({
        ...courseModule,
        lessons: courseModule.lessons.map((lesson) => {
          const lessonKey = getLessonKey(lesson)
          if (lessonKey !== activeLessonId) return lesson
          return {
            ...hydrated,
            id: lesson.id,
            uid: lesson.uid ?? lessonApiItem.uid,
          }
        }),
      })),
    )
  }, [
    activeLessonId,
    lessonDetailQuery.data,
    modifiedLessons,
    shouldLoadLessonDetail,
  ])

  useEffect(() => {
    lastHydratedLessonRef.current = null
  }, [activeLessonId])

  useEffect(() => {
    if (!activeLessonId || outlineModules.length === 0) return
    const moduleForLesson = findModuleByLessonId(outlineModules, activeLessonId)
    if (moduleForLesson && moduleForLesson.uid !== activeModuleId) {
      setActiveModuleId(moduleForLesson.uid)
    }
  }, [activeLessonId, outlineModules, activeModuleId])

  useEffect(() => {
    if (isInitialized || !courseData || typeof courseData !== 'object') return

    if (!hasCourseModules) {
      const fallbackModule = createFallbackModule(1)
      setModules([fallbackModule])
      setActiveModuleId(fallbackModule.uid ?? null)
      setActiveLessonId(getLessonKey(fallbackModule.lessons[0]))
      setEditorReady(true)
      setIsInitialized(true)
      return
    }

    const nextModules =
      fetchedModules.length > 0 ? fetchedModules : [createFallbackModule(1)]
    setModules(nextModules)

    const initialModule =
      (initialModuleId
        ? nextModules.find((module) => module.uid === initialModuleId)
        : undefined) ?? nextModules[0]

    setActiveModuleId(initialModule?.uid ?? null)
    setActiveLessonId(
      initialModule?.lessons[0] ? getLessonKey(initialModule.lessons[0]) : null,
    )
    setEditorReady(true)
    setIsInitialized(true)

    if (hasCourseModules) {
      const moduleUids = new Set<string>()
      const lessonUids = new Set<string>()
      const lessonModuleMap = new Map<string, string>()

      for (const mod of nextModules) {
        if (mod.uid) moduleUids.add(mod.uid)
        for (const lesson of mod.lessons) {
          const lessonUid = lesson.uid ?? lesson.id
          lessonUids.add(lessonUid)
          if (mod.uid) lessonModuleMap.set(lessonUid, mod.uid)
        }
      }

      persistedModuleUidsRef.current = moduleUids
      setPersistedLessonUids(lessonUids)
      initialLessonModuleMapRef.current = lessonModuleMap
    } else {
      persistedModuleUidsRef.current = new Set()
      setPersistedLessonUids(new Set())
      initialLessonModuleMapRef.current = new Map()
    }
  }, [isInitialized, fetchedModules, initialModuleId, courseData, hasCourseModules])

  const patchLocalLesson = useCallback(
    (lessonId: string, updater: (lesson: EditableLesson) => EditableLesson) => {
      setModules((previous) =>
        previous.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => {
            const lessonKey = getLessonKey(lesson)
            if (lessonKey !== lessonId && lesson.id !== lessonId) return lesson
            setModifiedLessons((prev) => new Set([...prev, lessonKey]))
            return updater(lesson)
          }),
        })),
      )
    },
    [],
  )

  const handleModulesChange = useCallback(
    (nextOutlineModules: ICourseDetailModule[]) => {
      setModules((previous) => mergeOutlineModules(previous, nextOutlineModules))
    },
    [],
  )

  const applyOutlineUpdate = useCallback(
    (updater: (current: ICourseDetailModule[]) => ICourseDetailModule[]) => {
      handleModulesChange(updater(outlineModules))
    },
    [handleModulesChange, outlineModules],
  )

  const handleSelectModule = useCallback(
    (moduleId: string) => {
      setActiveModuleId(moduleId)
      const targetModule = outlineModules.find((module) => module.uid === moduleId)
      const firstLessonId = targetModule ? getFirstLessonId(targetModule) : null
      if (firstLessonId) setActiveLessonId(firstLessonId)
    },
    [outlineModules],
  )

  const handleCreateModule = useCallback(
    (title: string) => {
      const nextOutline = addModule(outlineModules, title)
      const createdModule = nextOutline[nextOutline.length - 1]
      handleModulesChange(nextOutline)
      setActiveModuleId(createdModule.uid)
      const firstLessonId = getFirstLessonId(createdModule)
      if (firstLessonId) setActiveLessonId(firstLessonId)
    },
    [handleModulesChange, outlineModules],
  )

  const handleRenameModule = useCallback(
    (moduleId: string, title: string) => {
      applyOutlineUpdate((current) => renameModule(current, moduleId, title))
    },
    [applyOutlineUpdate],
  )

  const handleDeleteModule = useCallback(
    (moduleId: string) => {
      const nextOutline = removeModule(outlineModules, moduleId)
      handleModulesChange(nextOutline)
      const fallbackModule = nextOutline[0]
      setActiveModuleId(fallbackModule?.uid ?? null)
      setActiveLessonId(fallbackModule ? getFirstLessonId(fallbackModule) : null)
    },
    [handleModulesChange, outlineModules],
  )

  const handleAddLesson = useCallback(
    (moduleId?: string) => {
      const targetModuleId = moduleId ?? activeOutlineModule?.uid
      if (!targetModuleId) return
      const nextOutline = addLesson(outlineModules, targetModuleId)
      handleModulesChange(nextOutline)
      setActiveModuleId(targetModuleId)
      const updatedModule = nextOutline.find((module) => module.uid === targetModuleId)
      const lastLesson = updatedModule?.lessons?.at(-1)
      if (lastLesson) setActiveLessonId(lastLesson.uid)
    },
    [activeOutlineModule, handleModulesChange, outlineModules],
  )

  const handleRenameLesson = useCallback(
    (lessonId: string, title: string) => {
      const moduleForLesson = findModuleByLessonId(outlineModules, lessonId)
      if (!moduleForLesson) return
      applyOutlineUpdate((current) =>
        renameLesson(current, moduleForLesson.uid, lessonId, title),
      )
      setModifiedLessons((previous) => new Set([...previous, lessonId]))
    },
    [applyOutlineUpdate, outlineModules],
  )

  const handleDeleteLesson = useCallback(
    (lessonId: string) => {
      const moduleForLesson = findModuleByLessonId(outlineModules, lessonId)
      if (!moduleForLesson) return
      const nextOutline = removeLesson(outlineModules, moduleForLesson.uid, lessonId)
      handleModulesChange(nextOutline)
      if (activeLessonId === lessonId) {
        const updatedModule = nextOutline.find(
          (module) => module.uid === moduleForLesson.uid,
        )
        setActiveLessonId(updatedModule ? getFirstLessonId(updatedModule) : null)
      }
    },
    [activeLessonId, handleModulesChange, outlineModules],
  )

  const handleChangeLessonType = useCallback(
    (lessonId: string, deliveryType: 'text' | 'video') => {
      const moduleForLesson = findModuleByLessonId(outlineModules, lessonId)
      if (!moduleForLesson) return
      applyOutlineUpdate((current) =>
        changeLessonDeliveryType(
          current,
          moduleForLesson.uid,
          lessonId,
          deliveryType,
        ),
      )
    },
    [applyOutlineUpdate, outlineModules],
  )

  const handleSave = useCallback(
    async (opts?: { silent?: boolean; redirect?: boolean }) => {
      if (isSaving) return

      setIsSaving(true)
      try {
        const courseUid = courseData.uid
        if (!courseUid) throw new Error('UID kursus tidak ditemukan.')

        const workingModules = modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({ ...lesson })),
        }))

        const currentModuleUids = new Set(
          workingModules
            .map((mod) => mod.uid)
            .filter((uid): uid is string => Boolean(uid)),
        )
        const currentLessonUids = new Set(
          workingModules.flatMap((mod) =>
            mod.lessons.map((lesson) => lesson.uid ?? lesson.id),
          ),
        )

        const lessonPayloadInputs = workingModules.flatMap((mod) => {
          if (!mod.uid) return []
          return mod.lessons.map((lesson) =>
            editableLessonToPayloadInput(lesson, mod.uid!),
          )
        })

        validateLessonPayloadInputs(lessonPayloadInputs)

        const nextPersistedLessonUids = new Set(persistedLessonUids)
        const removedModuleUids = [...persistedModuleUidsRef.current].filter(
          (uid) => !currentModuleUids.has(uid),
        )
        const removedLessonUids = [...nextPersistedLessonUids].filter(
          (uid) =>
            !currentLessonUids.has(uid) &&
            !removedModuleUids.includes(
              initialLessonModuleMapRef.current.get(uid) ?? '',
            ),
        )

        for (const lessonUid of removedLessonUids) {
          await deleteLesson(lessonUid)
          nextPersistedLessonUids.delete(lessonUid)
          initialLessonModuleMapRef.current.delete(lessonUid)
        }

        for (const moduleUid of removedModuleUids) {
          await deleteModule(moduleUid)
          persistedModuleUidsRef.current.delete(moduleUid)
        }

        const lessonUidMap = new Map<string, string>()

        for (const courseModule of workingModules) {
          let moduleUid = courseModule.uid

          if (moduleUid && persistedModuleUidsRef.current.has(moduleUid)) {
            await updateModule(moduleUid, {
              title: courseModule.title.trim(),
              order_index: courseModule.order_index,
            })
          } else {
            const createdModule = await createModule({
              course_uid: courseUid,
              title: courseModule.title.trim(),
              order_index: courseModule.order_index,
            })

            if (!createdModule.uid) {
              throw new Error('Backend tidak mengembalikan uid untuk modul baru.')
            }

            moduleUid = createdModule.uid
            courseModule.uid = createdModule.uid
            courseModule.course_uid = createdModule.course_uid
            persistedModuleUidsRef.current.add(createdModule.uid)
          }

          for (const lesson of courseModule.lessons) {
            const lessonUid = lesson.uid ?? lesson.id
            const payload = editableLessonToPayloadInput(lesson, moduleUid)

            if (nextPersistedLessonUids.has(lessonUid)) {
              const savedLesson = await updateLesson(lessonUid, payload)
              lesson.uid = savedLesson.uid
              lesson.id = savedLesson.uid
            } else {
              const savedLesson = await createLesson(payload)
              if (lessonUid !== savedLesson.uid) {
                lessonUidMap.set(lessonUid, savedLesson.uid)
              }
              lesson.uid = savedLesson.uid
              lesson.id = savedLesson.uid
              nextPersistedLessonUids.add(savedLesson.uid)
              initialLessonModuleMapRef.current.set(savedLesson.uid, moduleUid)
            }
          }
        }

        if (activeLessonId) {
          const remappedActiveLessonId = lessonUidMap.get(activeLessonId)
          if (remappedActiveLessonId) setActiveLessonId(remappedActiveLessonId)
        }

        setModules(workingModules)
        setModifiedLessons(new Set())
        setPersistedLessonUids(nextPersistedLessonUids)

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: lessonKeys.all }),
          queryClient.invalidateQueries({ queryKey: moduleKeys.all }),
          queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) }),
        ])

        if (!opts?.silent) toast.success('Perubahan berhasil disimpan.')
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Gagal menyimpan perubahan.',
        )
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [
      modules,
      courseData.uid,
      isSaving,
      activeLessonId,
      queryClient,
      persistedLessonUids,
    ],
  )

  const handlePublish = useCallback(async () => {
    try {
      await handleSave({ silent: true, redirect: false })
      setCourse((previous) =>
        previous ? { ...previous, is_published: true } : previous,
      )
      toast.success('Kursus berhasil dipublikasikan.')
      navigate(`${routeBasePath}/courses/${courseData.uid}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal mempublikasikan kursus.',
      )
    }
  }, [handleSave, courseData.uid, routeBasePath, navigate])

  const confirmSave = useCallback(() => {
    setIsConfirmOpen(false)
    void handleSave()
  }, [handleSave])

  return {
    course,
    outlineModules,
    activeModuleId,
    activeLessonId,
    activeLesson,
    activeOutlineModule,
    editorReady,
    modifiedLessons,
    isSaving,
    isConfirmOpen,
    isCreateModuleOpen,
    renameModuleId,
    renameModuleTitle,
    shouldLoadLessonDetail,
    isLessonDetailLoading: lessonDetailQuery.isLoading && shouldLoadLessonDetail,
    routeBasePath,
    courseUid: courseData.uid,
    setActiveLessonId,
    setIsConfirmOpen,
    setIsCreateModuleOpen,
    setRenameModuleId,
    handleSelectModule,
    handleCreateModule,
    handleRenameModule,
    handleDeleteModule,
    handleAddLesson,
    handleRenameLesson,
    handleDeleteLesson,
    handleChangeLessonType,
    handlePublish,
    confirmSave,
    patchLocalLesson,
  }
}
