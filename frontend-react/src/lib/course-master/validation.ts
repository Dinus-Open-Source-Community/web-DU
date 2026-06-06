import type { CourseMasterFormValues } from './types'
import { getCourseMasterFormValidationMessage } from '@/lib/validator/course-master'

export function validateCourseMasterForm(values: CourseMasterFormValues): string | null {
  return getCourseMasterFormValidationMessage(values)
}
