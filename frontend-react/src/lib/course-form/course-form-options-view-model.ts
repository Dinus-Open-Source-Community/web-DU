import type { ICategoryItem, ICourseTypeItem } from '@/lib/types/course'

export type CourseFormOptionsViewModel = {
  categories: ICategoryItem[]
  courseTypes: ICourseTypeItem[]
  optionsLoading: boolean
}
