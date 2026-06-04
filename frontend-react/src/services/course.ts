import { useQuery } from '@tanstack/react-query'
import { api } from './axios'
import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type { ICategoryItem, ICategoryListResponse, ICourseListResponse, ICourseTypeListResponse, IDetailCourseResponse, IModulesByCourseUidResponse } from '@/lib/types/course'

const useGetAllCourses = (params?: IQueryParamsPayload, enabled = true) => {
  return useQuery({
    queryKey: ['courses', params],
    enabled,
    queryFn: async () => {
      const response = await api.get<IResponse<ICourseListResponse>>(API_ROUTES.courses.getAll(params))
      return response.data.data
    },
  })
}

const useGetCourseDetail = (uid: string) => {
  return useQuery({
    queryKey: ['courses', uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const response = await api.get<IResponse<IDetailCourseResponse>>(API_ROUTES.courses.getByUid(uid))
      return response.data.data
    },
  })
}

const useGetCategoriest = (params?: IQueryParamsPayload) => {
  return useQuery({
    queryKey: ['course-categories', params],
    queryFn: async () => {
      const response = await api.get<IResponse<ICategoryListResponse>>(API_ROUTES.courseCategories.getAll(params))
      return response.data.data
    },
  })
}

const useGetCategoryById = (id: string) => {
  return useQuery({
    queryKey: ['course-category', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get<IResponse<ICategoryItem>>(API_ROUTES.courseCategories.getByUid(id))
      return response.data.data
    },
  })
}

const useGetCourseTypes = (params?: IQueryParamsPayload) => {
  return useQuery({
    queryKey: ['course-types', params],
    queryFn: async () => {
      const response = await api.get<IResponse<ICourseTypeListResponse>>(API_ROUTES.courseTypes.getAll(params))
      return response.data.data
    },
  })
}

const useGetModules = (uid: string) => {
  return useQuery({
    queryKey: ['modules', uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const response = await api.get<IResponse<IModulesByCourseUidResponse>>(API_ROUTES.modules.getByCourseUid(uid))
      return response.data.data
    },
  })
}

const useGetAllModulesByCourseUid = (courseUid: string) => {
  return useQuery({
    queryKey: ['modules', courseUid],
    enabled: Boolean(courseUid),
    queryFn: async () => {
      const response = await api.get<IResponse<IModulesByCourseUidResponse>>(API_ROUTES.modules.getByCourseUid(courseUid))
      return response.data.data
    },
  })
}

const useCombinedCourseCategoriesAndTypes = (params?: IQueryParamsPayload) => {
  const courseCategoriesQuery = useGetCategoriest(params)
  const courseTypesQuery = useGetCourseTypes(params)
  const courseList = useGetAllCourses(params)

  const isLoading = courseCategoriesQuery.isLoading || courseTypesQuery.isLoading || courseList.isLoading
  const error = courseCategoriesQuery.error || courseTypesQuery.error || courseList.error

  return {
    courseCategories: courseCategoriesQuery.data,
    courseTypes: courseTypesQuery.data,
    courses: courseList.data,
    isLoading,
    error,
  }
}

const useGetCourseWithModules = (uid: string) => {
  const courseDetail = useGetCourseDetail(uid)
  const modules = useGetModules(uid)

  const isLoading = courseDetail.isLoading || modules.isLoading
  const error = courseDetail.error || modules.error

  return {
    courseDetail,
    modules,
    isLoading,
    error,
  }
}

const useGetCourseDetailWithCategories = (uid: string) => {
  const courseDetail = useGetCourseDetail(uid)
  const courseCategories = useGetCategoryById(courseDetail.data?.category.uid ?? '')
  const categoryUid = courseDetail.data?.category.uid
  const popularCourses = useGetAllCourses({ course_category_id: categoryUid, per_page: 5 }, Boolean(categoryUid))

  const isLoading = courseDetail.isLoading || courseCategories.isLoading || popularCourses.isLoading
  const error = courseDetail.error || courseCategories.error || popularCourses.error

  return {
    courseDetail,
    courseCategories,
    popularCourses,
    isLoading,
    error,
  }
}

export {
  useGetAllCourses,
  useGetCategoriest,
  useGetCourseTypes,
  useCombinedCourseCategoriesAndTypes,
  useGetCourseDetail,
  useGetModules,
  useGetAllModulesByCourseUid,
  useGetCategoryById,
  useGetCourseDetailWithCategories,
  useGetCourseWithModules,
}
