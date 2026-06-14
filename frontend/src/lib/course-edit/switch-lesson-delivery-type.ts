import type { EditableLesson } from '@/lib/course-edit/types'
import type { LessonDeliveryType } from '@/lib/types/lesson'

function snapshotCurrentContent(lesson: EditableLesson) {
  if (lesson.contentType === 'text') {
    return {
      ...lesson.contentDrafts,
      textContentHtml: lesson.contentHtml,
    }
  }

  return {
    ...lesson.contentDrafts,
    videoUrl: lesson.videoUrl,
    videoDescriptionHtml: lesson.contentHtml ?? '',
  }
}

function buildTextLesson(
  lesson: EditableLesson,
  drafts: NonNullable<EditableLesson['contentDrafts']>,
): EditableLesson {
  return {
    ...lesson,
    contentType: 'text',
    contentHtml: drafts.textContentHtml ?? '',
    contentFormat: lesson.contentFormat ?? 'tiptap',
    contentDrafts: drafts,
  }
}

function buildVideoLesson(
  lesson: EditableLesson,
  drafts: NonNullable<EditableLesson['contentDrafts']>,
): EditableLesson {
  return {
    ...lesson,
    contentType: 'video',
    videoUrl: drafts.videoUrl ?? '',
    contentHtml: drafts.videoDescriptionHtml ?? '',
    contentFormat: lesson.contentFormat ?? 'tiptap',
    contentDrafts: drafts,
  }
}

export function switchLessonDeliveryType(
  lesson: EditableLesson,
  targetType: LessonDeliveryType,
): EditableLesson {
  if (lesson.contentType === targetType) return lesson

  const drafts = snapshotCurrentContent(lesson)

  return targetType === 'text'
    ? buildTextLesson(lesson, drafts)
    : buildVideoLesson(lesson, drafts)
}

export function resolveTextContentHtml(lesson?: EditableLesson): string {
  if (!lesson) return ''
  if (lesson.contentType === 'text') return lesson.contentHtml
  return lesson.contentDrafts?.textContentHtml ?? ''
}

export function resolveVideoFields(lesson?: EditableLesson, fallbackVideoUrl = '') {
  if (!lesson) {
    return { videoUrl: fallbackVideoUrl, descriptionHtml: '' }
  }

  if (lesson.contentType === 'video') {
    return {
      videoUrl: lesson.videoUrl,
      descriptionHtml: lesson.contentHtml ?? '',
    }
  }

  return {
    videoUrl: lesson.contentDrafts?.videoUrl ?? fallbackVideoUrl,
    descriptionHtml: lesson.contentDrafts?.videoDescriptionHtml ?? '',
  }
}
