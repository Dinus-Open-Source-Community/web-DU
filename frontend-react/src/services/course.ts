import { useQuery } from '@tanstack/react-query'
import { api } from './axios'
import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type { ICategoryListResponse, ICourseListResponse, ICourseTypeListResponse } from '@/lib/types/course'

const useGetAllCourses = (params?: IQueryParamsPayload) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const response = await api.get<IResponse<ICourseListResponse>>(API_ROUTES.courses.getAll(params))
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

const useGetCourseTypes = (params?: IQueryParamsPayload) => {
  return useQuery({
    queryKey: ['course-types', params],
    queryFn: async () => {
      const response = await api.get<IResponse<ICourseTypeListResponse>>(API_ROUTES.courseTypes.getAll(params))
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

export { useGetAllCourses, useGetCategoriest, useGetCourseTypes, useCombinedCourseCategoriesAndTypes }
