import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { parseLessonContent, toCourseDetailLesson } from '@/lib/rich-text'
import type { RichTextContentFormat } from '@/lib/types/rich-text'
import type { ICourseDetailItem, ICourseDetailModule } from '@/lib/types/course'
import type {
  CourseDetailLesson,
  IQuiz,
  LessonPayloadInput,
} from '@/lib/types/lesson'
import type { EditableLesson, EditableModule, LessonApiItem } from './types'
import { createDefaultHomeworkRules } from '@/lib/course-edit/homework-rules'
import {
  resolveTextContentHtml,
  resolveVideoFields,
} from '@/lib/course-edit/switch-lesson-delivery-type'

export function createLocalId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createDefaultQuiz(): IQuiz {
  return { questions: [], passingScore: 70 }
}

export function createFallbackLesson(order = 1): EditableLesson {
  return {
    id: createLocalId('lesson'),
    title: `Lesson ${order}`,
    order,
    durationMinutes: 10,
    hasHomework: false,
    homeworkTitle: '',
    homeworkAssignmentUid: null,
    homeworkType: 'text',
    homeworkDescriptionHtml: '<p></p>',
    homeworkQuiz: createDefaultQuiz(),
    homeworkRules: createDefaultHomeworkRules('text'),
    contentType: 'text',
    contentHtml: '',
    contentFormat: 'tiptap',
  }
}

export function createFallbackModule(order_index = 1): EditableModule {
  return {
    uid: createLocalId('module'),
    course_uid: '',
    created_at: '',
    order_index,
    title: `Modul ${order_index}`,
    lessons: [createFallbackLesson(1)],
  }
}

export function getLessonKey(lesson: { uid?: string; id: string }) {
  return lesson.uid ?? lesson.id
}

export function findLesson(
  modules: EditableModule[],
  lessonId: string,
): EditableLesson | null {
  for (const courseModule of modules) {
    const lesson = courseModule.lessons.find(
      (item) => item.id === lessonId || item.uid === lessonId,
    )
    if (lesson) return lesson
  }
  return null
}

export function toMentorCourse(course: ICourseDetailItem): Partial<ICourseDetailItem> {
  const category = course.category
  const courseType = course.course_type

  return {
    uid: course.uid ?? '',
    title: course.title ?? '',
    subtitle: course.subtitle ?? '',
    description: course.description ?? '',
    cover_url: course.cover_url ?? course.thumbnail_url ?? '',
    status: course.status ?? '',
    is_published: isCoursePublished(course),
    updated_at: course.updated_at ?? '',
    category: category?.name ? category : undefined,
    level: course.level ?? undefined,
    course_type: courseType?.name ? courseType : undefined,
    price: typeof course.price === 'number' ? course.price : undefined,
    price_strike: typeof course.price_strike === 'number' ? course.price_strike : undefined,
    what_you_learn: Array.isArray(course.what_you_learn)
      ? course.what_you_learn.filter((item): item is string => typeof item === 'string')
      : undefined,
  }
}

export function toLesson(item: LessonApiItem, fallbackOrder: number): EditableLesson {
  const parsedContent = parseLessonContent(item.content)
  const lessonContentType =
    item.content_type === 'video' || Boolean(item.video_url) ? 'video' : 'text'

  const base = {
    id: item.uid ?? `lesson-${fallbackOrder}`,
    uid: item.uid,
    title: item.title ?? `Lesson ${fallbackOrder}`,
    order: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    durationMinutes: 10,
    hasHomework: false,
    homeworkTitle: item.title ?? `Lesson ${fallbackOrder}`,
    homeworkAssignmentUid: null,
    homeworkType: 'text' as const,
    homeworkDescriptionHtml: '<p></p>',
    homeworkQuiz: createDefaultQuiz(),
    homeworkRules: createDefaultHomeworkRules('text'),
  }

  const contentHtml = parsedContent.contentHtml
  const contentFormat: RichTextContentFormat = parsedContent.contentFormat

  if (lessonContentType === 'video') {
    return {
      ...base,
      contentType: 'video',
      videoUrl: item.video_url ?? '',
      contentHtml,
      contentFormat,
    }
  }

  return {
    ...base,
    contentType: 'text',
    contentHtml,
    contentFormat,
  }
}

export function mergeLessonDetailFromApi(
  existing: EditableLesson,
  hydrated: EditableLesson,
  lessonUid: string,
): EditableLesson {
  return {
    ...hydrated,
    id: existing.id,
    uid: existing.uid ?? lessonUid,
    hasHomework: existing.hasHomework,
    homeworkTitle: existing.homeworkTitle,
    homeworkAssignmentUid: existing.homeworkAssignmentUid,
    homeworkType: existing.homeworkType,
    homeworkDescriptionHtml: existing.homeworkDescriptionHtml,
    homeworkQuiz: existing.homeworkQuiz,
    homeworkRules: existing.homeworkRules,
  }
}

export function toModule(
  item: ICourseDetailModule,
  lessons: EditableLesson[],
  fallbackOrder: number,
): EditableModule {
  return {
    uid: item.uid,
    course_uid: (item.course_uid as string) ?? '',
    title: (item.title as string) ?? `Modul ${fallbackOrder}`,
    order_index: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    created_at: (item.created_at as string) ?? '',
    lessons: lessons.length > 0 ? lessons : [createFallbackLesson(1)],
  }
}

export function editableLessonToPayloadInput(
  lesson: EditableLesson,
  moduleUid: string,
): LessonPayloadInput {
  const deliveryType = lesson.contentType === 'video' ? 'video' : 'text'

  return {
    module_uid: moduleUid,
    title: lesson.title.trim(),
    order_index: lesson.order,
    deliveryType,
    contentHtml:
      deliveryType === 'text' && lesson.contentType === 'text'
        ? lesson.contentHtml
        : undefined,
    contentFormat: lesson.contentFormat ?? 'tiptap',
    videoUrl:
      deliveryType === 'video' && lesson.contentType === 'video'
        ? lesson.videoUrl
        : undefined,
  }
}

function buildEditableLessonFromOutline(
  outlineLesson: CourseDetailLesson,
  lessonIndex: number,
  prevLesson?: EditableLesson,
): EditableLesson {
  const deliveryType = outlineLesson.content_type === 'video' ? 'video' : 'text'
  const shared = {
    id: prevLesson?.id ?? outlineLesson.uid,
    uid: outlineLesson.uid,
    title: outlineLesson.title,
    order: outlineLesson.order_index ?? lessonIndex + 1,
    durationMinutes: prevLesson?.durationMinutes ?? 10,
    hasHomework: prevLesson?.hasHomework ?? false,
    homeworkTitle: prevLesson?.homeworkTitle ?? outlineLesson.title,
    homeworkAssignmentUid: prevLesson?.homeworkAssignmentUid ?? null,
    homeworkType: prevLesson?.homeworkType ?? ('text' as const),
    homeworkDescriptionHtml: prevLesson?.homeworkDescriptionHtml ?? '<p></p>',
    homeworkQuiz: prevLesson?.homeworkQuiz ?? createDefaultQuiz(),
    homeworkRules:
      prevLesson?.homeworkRules ??
      createDefaultHomeworkRules(prevLesson?.homeworkType ?? 'text'),
    contentFormat: prevLesson?.contentFormat ?? ('tiptap' as const),
    contentDrafts: prevLesson?.contentDrafts,
  }

  if (deliveryType === 'video') {
    const { videoUrl, descriptionHtml } = resolveVideoFields(
      prevLesson,
      outlineLesson.video_url ?? '',
    )

    return {
      ...shared,
      contentType: 'video',
      videoUrl,
      contentHtml: descriptionHtml,
    }
  }

  return {
    ...shared,
    contentType: 'text',
    contentHtml: resolveTextContentHtml(prevLesson),
  }
}

export function mergeOutlineModules(
  previous: EditableModule[],
  outline: ICourseDetailModule[],
): EditableModule[] {
  const previousLessonMap = new Map<string, EditableLesson>()
  const previousModuleMap = new Map<string, EditableModule>()

  for (const mod of previous) {
    if (mod.uid) previousModuleMap.set(mod.uid, mod)
    for (const lesson of mod.lessons) {
      previousLessonMap.set(getLessonKey(lesson), lesson)
    }
  }

  return outline.map((outlineModule, moduleIndex) => {
    const prevModule = previousModuleMap.get(outlineModule.uid)

    return {
      uid: outlineModule.uid,
      course_uid: outlineModule.course_uid || prevModule?.course_uid || '',
      title: outlineModule.title,
      order_index: outlineModule.order_index ?? moduleIndex + 1,
      created_at: outlineModule.created_at ?? prevModule?.created_at ?? '',
      updated_at: outlineModule.updated_at ?? prevModule?.updated_at,
      lessons: (outlineModule.lessons ?? []).map((outlineLesson, lessonIndex) =>
        buildEditableLessonFromOutline(
          outlineLesson,
          lessonIndex + 1,
          previousLessonMap.get(outlineLesson.uid),
        ),
      ),
    }
  })
}

export function toOutlineModules(modules: EditableModule[]): ICourseDetailModule[] {
  return modules.map((module) => ({
    uid: module.uid ?? '',
    course_uid: module.course_uid,
    title: module.title,
    order_index: module.order_index,
    created_at: module.created_at,
    updated_at: module.updated_at,
    lessons: module.lessons.map((lesson, index) =>
      toCourseDetailLesson(lesson, module.uid ?? '', index),
    ),
  }))
}
