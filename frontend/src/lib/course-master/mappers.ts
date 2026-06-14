import type {
  CourseMasterFormValues,
  CourseMasterItem,
  CreateCourseMasterPayload,
  UpdateCourseMasterPayload,
} from './types'
import { EMPTY_COURSE_MASTER_FORM } from './types'

export function courseMasterToFormValues(item?: CourseMasterItem | null): CourseMasterFormValues {
  if (!item) return { ...EMPTY_COURSE_MASTER_FORM }

  return {
    name: item.name ?? '',
    description: item.description ?? '',
    isActive: item.is_active ?? true,
  }
}

export function formValuesToCreatePayload(values: CourseMasterFormValues): CreateCourseMasterPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    is_active: values.isActive,
  }
}

export function formValuesToUpdatePayload(values: CourseMasterFormValues): UpdateCourseMasterPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    is_active: values.isActive,
  }
}
