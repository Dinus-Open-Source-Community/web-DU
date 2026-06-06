import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { parseLessonContent, toCourseDetailLesson } from '@/lib/rich-text'
import type { RichTextContentFormat } from '@/lib/types/rich-text'
import type { ICourseDetailItem, ICourseDetailModule } from '@/lib/types/course'
import type {
  CourseDetailLesson,
  EditableLesson,
  EditableModule,
  IQuiz,
  LessonApiItem,
  LessonPayloadInput,
} from './types'
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
    homeworkType: 'text',
    homeworkDescriptionHtml: '<p></p>',
    homeworkQuiz: createDefaultQuiz(),
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
  const category = course.category as { name?: unknown } | undefined
  const courseType = course.course_type as { name?: unknown } | undefined

  return {
    uid: (course.uid as string) ?? '',
    title: (course.title as string) ?? '',
    subtitle: (course.subtitle as string) ?? '',
    description: (course.description as string) ?? '',
    cover_url: (course.cover_url as string) ?? (course.thumbnail_url as string) ?? '',
    status: (course.status as string) ?? '',
    is_published: isCoursePublished(course),
    updated_at: (course.updated_at as string) ?? '',
    category:
      typeof category?.name === 'string'
        ? (category as ICourseDetailItem['category'])
        : undefined,
    level: (course.level as ICourseDetailItem['level']) ?? undefined,
    course_type:
      typeof courseType?.name === 'string'
        ? (courseType as ICourseDetailItem['course_type'])
        : undefined,
    price: typeof course.price === 'number' ? course.price : undefined,
    price_strike:
      typeof course.price_strike === 'number' ? course.price_strike : undefined,
    what_you_learn: Array.isArray(course.what_you_learn)
      ? (course.what_you_learn as unknown[]).filter(
          (item): item is string => typeof item === 'string',
        )
      : undefined,
  }
}

export function toLesson(item: LessonApiItem, fallbackOrder: number): EditableLesson {
  const parsedContent = parseLessonContent(item.content)
  const lessonContentType =
    item.content_type === 'video' || Boolean(item.video_url) ? 'video' : 'text'

  const assignment = item.assignment ?? null
  const taskDescription = assignment?.task_description
  const homeworkDescriptionHtml =
    typeof taskDescription?.contentHtml === 'string'
      ? taskDescription.contentHtml
      : '<p></p>'

  const base = {
    id: item.uid ?? `lesson-${fallbackOrder}`,
    uid: item.uid,
    title: item.title ?? `Lesson ${fallbackOrder}`,
    order: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    durationMinutes: 10,
    hasHomework: Boolean(assignment),
    homeworkType: assignment?.task_type ?? ('text' as const),
    homeworkDescriptionHtml,
    homeworkQuiz: assignment?.quiz_payload ?? createDefaultQuiz(),
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
    homeworkType: prevLesson?.homeworkType ?? ('text' as const),
    homeworkDescriptionHtml: prevLesson?.homeworkDescriptionHtml ?? '<p></p>',
    homeworkQuiz: prevLesson?.homeworkQuiz ?? createDefaultQuiz(),
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
