import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import type { IQueryParamsPayload } from '@/services/api-path'
import type { LessonDetailItem } from '@/lib/types/course'
import {
  applyResolvedImagesToCourseDetail,
  applyResolvedImagesToCourseItem,
  applyResolvedImagesToCourseStudents,
  collectCourseDetailImageReferences,
  collectCourseListImageReferences,
  collectCourseStudentsImageReferences,
} from '@/lib/files'
import { useProtectedFileMap } from '@/hooks/files/use-protected-file-map'
import {
  fetchCourseByUid,
  fetchCourseCategories,
  fetchCourseCategoryByUid,
  fetchCourses,
  fetchCourseProgress,
  fetchCourseStudents,
  fetchCourseTypes,
  stripLessonsFromModules,
} from '@/services/course'
import { fetchLessonsByModuleUid } from '@/services/lessons'
import { courseKeys, lessonKeys } from './query-keys'
import { useModulesByCourse } from './use-modules'

type UseCoursesOptions = {
  enabled?: boolean
}

export function useCourses(
  params?: IQueryParamsPayload,
  options: UseCoursesOptions = {},
) {
  const query = useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => fetchCourses(params),
    enabled: options.enabled,
  })

  const imageReferences = useMemo(
    () => collectCourseListImageReferences(query.data?.courses),
    [query.data?.courses],
  )

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return {
      ...query.data,
      courses: query.data.courses.map((course) =>
        applyResolvedImagesToCourseItem(course, fileMap.getDisplayUrl),
      ),
    }
  }, [fileMap.getDisplayUrl, query.data])

  return {
    ...query,
    data,
    isResolvingImages: fileMap.isLoading || fileMap.isFetching,
  }
}

export function useCourseDetail(uid: string) {
  const query = useQuery({
    queryKey: courseKeys.detail(uid),
    enabled: !!uid,
    queryFn: () => fetchCourseByUid(uid),
  })

  const imageReferences = useMemo(
    () => collectCourseDetailImageReferences(query.data),
    [query.data],
  )

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return applyResolvedImagesToCourseDetail(query.data, fileMap.getDisplayUrl)
  }, [fileMap.getDisplayUrl, query.data])

  return {
    ...query,
    data,
    isResolvingImages: fileMap.isLoading || fileMap.isFetching,
  }
}

export function useCourseCategories(params?: IQueryParamsPayload) {
  return useQuery({
    queryKey: courseKeys.categories(params),
    queryFn: () => fetchCourseCategories(params),
  })
}

export function useCourseCategory(uid: string) {
  return useQuery({
    queryKey: courseKeys.category(uid),
    enabled: Boolean(uid),
    queryFn: () => fetchCourseCategoryByUid(uid),
  })
}

export function useCourseTypes(params?: IQueryParamsPayload) {
  return useQuery({
    queryKey: courseKeys.types(params),
    queryFn: () => fetchCourseTypes(params),
  })
}

export function useCourseStudents(courseUid: string) {
  const query = useQuery({
    queryKey: courseKeys.students(courseUid),
    enabled: !!courseUid,
    queryFn: () => fetchCourseStudents(courseUid),
  })

  const imageReferences = useMemo(
    () => collectCourseStudentsImageReferences(query.data),
    [query.data],
  )

  const fileMap = useProtectedFileMap(imageReferences, {
    enabled: query.isSuccess && imageReferences.length > 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return applyResolvedImagesToCourseStudents(query.data, fileMap.getDisplayUrl)
  }, [fileMap.getDisplayUrl, query.data])

  return {
    ...query,
    data,
    isResolvingImages: fileMap.isLoading || fileMap.isFetching,
  }
}

export function useCourseProgress(courseUid: string, enabled = true) {
  return useQuery({
    queryKey: courseKeys.progress(courseUid),
    enabled: !!courseUid && enabled,
    queryFn: () => fetchCourseProgress(courseUid),
  })
}

export function useCourseDetailWithCategories(uid: string) {
  const courseDetail = useCourseDetail(uid)
  const courseCategories = useCourseCategory(courseDetail.data?.category.uid ?? '')
  const categoryUid = courseDetail.data?.category.uid
  const popularCourses = useCourses({
    course_category_id: categoryUid,
    per_page: 5,
    status: 'ACTIVE',
  })

  const isLoading =
    courseDetail.isLoading || courseCategories.isLoading || popularCourses.isLoading
  const error = courseDetail.error || courseCategories.error || popularCourses.error

  return {
    courseDetail,
    courseCategories,
    popularCourses,
    isLoading,
    error,
  }
}

export function useCourseDetailAdminAndMentor(uid: string) {
  const courseDetail = useCourseDetail(uid)
  const userCourse = useCourseStudents(uid)
  const moduleCourse = useModulesByCourse(uid, { per_page: 100 })

  const isLoading =
    courseDetail.isLoading || userCourse.isLoading || moduleCourse.isLoading
  const error = courseDetail.error || userCourse.error || moduleCourse.error

  return {
    courseDetail,
    userCourse,
    moduleCourse,
    isLoading,
    error,
  }
}

export function useCombinedCourseCategoriesAndTypes(params?: IQueryParamsPayload) {
  const courseCategoriesQuery = useCourseCategories(params)
  const courseTypesQuery = useCourseTypes(params)
  const courseList = useCourses(params)

  const isLoading =
    courseCategoriesQuery.isLoading ||
    courseTypesQuery.isLoading ||
    courseList.isLoading
  const error =
    courseCategoriesQuery.error || courseTypesQuery.error || courseList.error

  return {
    courseCategories: courseCategoriesQuery.data,
    courseTypes: courseTypesQuery.data,
    courses: courseList.data,
    isLoading,
    error,
  }
}

export function useCourseEditModules(courseUid: string) {
  const courseDetail = useCourseDetail(courseUid)
  const modulesQuery = useModulesByCourse(courseUid, { per_page: 100 })

  const modules = useMemo(
    () => stripLessonsFromModules(modulesQuery.data?.modules ?? []),
    [modulesQuery.data?.modules],
  )

  const isLoading = courseDetail.isLoading || modulesQuery.isLoading
  const error = courseDetail.error || modulesQuery.error

  return {
    courseDetail,
    modules,
    isLoading,
    error,
  }
}

export function useCourseEditData(courseUid: string) {
  const courseDetail = useCourseDetail(courseUid)
  const modulesQuery = useModulesByCourse(courseUid, { per_page: 100 })

  const moduleList = useMemo(() => modulesQuery.data?.modules ?? [], [modulesQuery.data?.modules])
  const moduleUids = useMemo(
    () => moduleList.map((module) => module.uid).filter(Boolean),
    [moduleList],
  )

  const lessonQueries = useQueries({
    queries: moduleUids.map((moduleUid) => ({
      queryKey: lessonKeys.byModule(moduleUid, { per_page: 100 }),
      queryFn: () => fetchLessonsByModuleUid(moduleUid, { per_page: 100 }),
      enabled: Boolean(courseUid) && modulesQuery.isSuccess && !!moduleUid,
    })),
  })

  const lessonsByModule = useMemo(() => {
    const result: Record<string, LessonDetailItem[]> = {}
    moduleUids.forEach((moduleUid, index) => {
      result[moduleUid] = lessonQueries[index]?.data?.lessons ?? []
    })
    return result
  }, [moduleUids, lessonQueries])

  const modules = useMemo(() => stripLessonsFromModules(moduleList), [moduleList])

  const isLoadingLessons = lessonQueries.some((query) => query.isLoading)
  const isLoading =
    courseDetail.isLoading || modulesQuery.isLoading || isLoadingLessons
  const error =
    courseDetail.error ||
    modulesQuery.error ||
    lessonQueries.find((query) => query.error)?.error

  return {
    courseDetail,
    modules,
    lessonsByModule,
    isLoading,
    error,
  }
}

export function useCourseWithModules(courseUid: string) {
  const editData = useCourseEditData(courseUid)

  const modulesWithLessons = useMemo(
    () =>
      editData.modules.map((module) => ({
        ...module,
        lessons: editData.lessonsByModule[module.uid] ?? [],
      })),
    [editData.modules, editData.lessonsByModule],
  )

  const modulesData = useMemo(() => {
    if (editData.isLoading) return undefined
    return {
      modules: modulesWithLessons,
      meta: {
        current_page: 1,
        per_page: Math.max(modulesWithLessons.length, 1),
        total: modulesWithLessons.length,
        total_pages: 1,
      },
    }
  }, [editData.isLoading, modulesWithLessons])

  return {
    courseDetail: editData.courseDetail,
    modules: {
      data: modulesData,
      isLoading: editData.isLoading,
      error: editData.error,
      isSuccess:
        editData.courseDetail.isSuccess && !editData.isLoading && !editData.error,
    },
    lessonsByModule: editData.lessonsByModule,
    isLoading: editData.isLoading,
    error: editData.error,
  }
}

export function useCreateOrEditModuleAndLesson(uid: string, moduleId: string) {
  const courseDetail = useCourseDetail(uid)
  const modules = useModulesByCourse(uid, { per_page: 100 })
  const lessons = useQueries({
    queries: [
      {
        queryKey: ['lessons', 'module', moduleId, { per_page: 100 }],
        queryFn: () => fetchLessonsByModuleUid(moduleId, { per_page: 100 }),
        enabled: !!moduleId,
      },
    ],
  })[0]

  const isLoading =
    courseDetail.isLoading || modules.isLoading || lessons.isLoading
  const error = courseDetail.error || modules.error || lessons.error

  return {
    courseDetail,
    modules,
    lesson: lessons,
    isLoading,
    error,
  }
}
