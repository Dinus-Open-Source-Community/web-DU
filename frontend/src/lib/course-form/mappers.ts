import type { ICourseDetailItem } from '@/lib/types/course'
import { normalizeApiLevel } from './level'
import {
  COURSE_CREATE_AS_DRAFT,
  type CourseFormValues,
  type CreateCoursePayload,
  type UpdateCoursePayload,
} from './types'

export function courseDetailToFormValues(course: ICourseDetailItem): CourseFormValues {
  return {
    title: course.title ?? '',
    subtitle: course.subtitle ?? '',
    description: course.description ?? '',
    categoryUid: course.category?.uid ?? '',
    courseTypeUid: course.course_type?.uid ?? '',
    level: normalizeApiLevel(course.level),
    whatYouLearn: Array.isArray(course.what_you_learn) ? course.what_you_learn : [],
    slot: course.slot > 0 ? course.slot : '',
    coverFile: null,
    coverPreviewUrl: course.cover_url || course.thumbnail_url || undefined,
  }
}

export function formValuesToCreatePayload(values: CourseFormValues): CreateCoursePayload {
  const slot = typeof values.slot === 'number' ? values.slot : undefined

  return {
    title: values.title.trim(),
    subtitle: values.subtitle.trim(),
    description: values.description.trim(),
    category_uid: values.categoryUid,
    course_type_uid: values.courseTypeUid,
    level: values.level,
    what_you_learn: values.whatYouLearn,
    slot,
    is_published: COURSE_CREATE_AS_DRAFT,
    cover: values.coverFile ?? undefined,
  }
}

export function formValuesToUpdatePayload(values: CourseFormValues): UpdateCoursePayload {
  const slot = typeof values.slot === 'number' ? values.slot : undefined

  return {
    title: values.title.trim(),
    subtitle: values.subtitle.trim(),
    description: values.description.trim(),
    category_uid: values.categoryUid,
    course_type_uid: values.courseTypeUid,
    level: values.level,
    what_you_learn: values.whatYouLearn,
    slot,
    cover: values.coverFile ?? undefined,
  }
}
