import type { EditableLesson } from './types'

export type LessonContentBaseline = {
  contentType: string
  contentHtml?: string
  videoUrl?: string
}

export type AssignmentBaseline = {
  hasHomework: boolean
  homeworkTitle: string
  homeworkType: 'text' | 'quiz'
  homeworkDescriptionHtml: string
  homeworkQuizJson: string
  homeworkRulesJson: string
}

export function normalizeRichText(html?: string | null): string {
  if (!html) return ''
  const trimmed = html.trim()
  if (
    trimmed === '<p></p>' ||
    trimmed === '<p><br></p>' ||
    trimmed === '<p><br/></p>' ||
    trimmed === '<p> </p>' ||
    trimmed === '<p><br class="ProseMirror-trailingBreak"></p>'
  ) {
    return ''
  }

  if (typeof document !== 'undefined') {
    const div = document.createElement('div')
    div.innerHTML = trimmed

    // Unwrap <p> inside <li> when it's the only block child
    div.querySelectorAll('li > p:only-child').forEach((p) => {
      p.replaceWith(...Array.from(p.childNodes))
    })

    // Standardize bold/italic tags
    div.querySelectorAll('b').forEach((b) => {
      const strong = document.createElement('strong')
      strong.innerHTML = b.innerHTML
      b.replaceWith(strong)
    })
    div.querySelectorAll('i').forEach((i) => {
      const em = document.createElement('em')
      em.innerHTML = i.innerHTML
      i.replaceWith(em)
    })

    // Remove ProseMirror specific elements / classes
    div.querySelectorAll('.ProseMirror-trailingBreak').forEach((br) => br.remove())

    // Remove empty paragraphs
    div.querySelectorAll('p').forEach((p) => {
      if (!p.textContent?.trim() && !p.querySelector('img, video, iframe, br')) {
        p.remove()
      }
    })

    return div.innerHTML
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()
  }

  // Fallback regex normalization if document is not available
  return trimmed
    .replace(/<li><p>(.*?)<\/p><\/li>/gi, '<li>$1</li>')
    .replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>')
    .replace(/<i>(.*?)<\/i>/gi, '<em>$1</em>')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p><br\s*\/?>\s*<\/p>/g, '')
    .trim()
}

export function getLessonVideoUrl(lesson: EditableLesson): string {
  if (lesson.contentType === 'video') {
    return lesson.videoUrl ?? ''
  }
  return ''
}

export function createLessonContentBaseline(
  lesson: EditableLesson,
): LessonContentBaseline {
  return {
    contentType: lesson.contentType,
    contentHtml: lesson.contentHtml ?? '',
    videoUrl: getLessonVideoUrl(lesson),
  }
}

export function isLessonContentEqual(
  a: EditableLesson,
  b: EditableLesson,
): boolean {
  if (a === b) return true
  if (a.contentType !== b.contentType) return false

  if (a.contentType === 'video') {
    const urlA = getLessonVideoUrl(a).trim()
    const urlB = getLessonVideoUrl(b).trim()
    if (urlA !== urlB) return false
  }

  const htmlA = normalizeRichText(a.contentHtml)
  const htmlB = normalizeRichText(b.contentHtml)
  return htmlA === htmlB
}

export function isLessonContentChanged(
  current: EditableLesson,
  baseline?: LessonContentBaseline | null,
): boolean {
  if (!baseline) return false

  if (current.contentType !== baseline.contentType) return true

  if (current.contentType === 'video') {
    const currentUrl = getLessonVideoUrl(current).trim()
    const baselineUrl = (baseline.videoUrl ?? '').trim()
    if (currentUrl !== baselineUrl) return true
  }

  const currentHtml = normalizeRichText(current.contentHtml)
  const baselineHtml = normalizeRichText(baseline.contentHtml)
  return currentHtml !== baselineHtml
}

export function normalizeHomeworkRules(rules?: EditableLesson['homeworkRules'] | null): string {
  if (!rules) return ''
  return JSON.stringify({
    allowFileSubmission: Boolean(rules.allowFileSubmission),
    allowPlainTextSubmission: Boolean(rules.allowPlainTextSubmission),
    allowRichTextSubmission: Boolean(rules.allowRichTextSubmission),
    requireFileDescription: Boolean(rules.requireFileDescription),
    deadlineAt: rules.deadlineAt ?? '',
    status: rules.status ?? 'DRAFT',
    autoCloseAfterDeadline: Boolean(rules.autoCloseAfterDeadline),
    allowResubmit: Boolean(rules.allowResubmit),
    maxResubmitCount: rules.maxResubmitCount ?? null,
    instructionAttachments: (rules.instructionAttachments ?? []).map((att) => ({
      name: att.name ?? '',
      url: att.url ?? '',
    })),
  })
}

export function normalizeQuiz(quiz?: EditableLesson['homeworkQuiz'] | null): string {
  if (!quiz?.questions || quiz.questions.length === 0) return ''
  return JSON.stringify({
    passingScore: quiz.passingScore ?? 70,
    questions: quiz.questions.map((q) => ({
      prompt: typeof q.prompt === 'string' ? q.prompt.trim() : (q.prompt?.contentHtml ?? '').trim(),
      options: (q.options ?? []).map((o) => ({
        label: (o.label ?? '').trim(),
      })),
      correctOptionId: q.correctOptionId,
    })),
  })
}

export function createAssignmentBaseline(
  lesson: EditableLesson,
): AssignmentBaseline {
  return {
    hasHomework: Boolean(lesson.hasHomework),
    homeworkTitle: (lesson.homeworkTitle ?? '').trim(),
    homeworkType: lesson.homeworkType ?? 'text',
    homeworkDescriptionHtml: normalizeRichText(lesson.homeworkDescriptionHtml),
    homeworkQuizJson: normalizeQuiz(lesson.homeworkQuiz),
    homeworkRulesJson: normalizeHomeworkRules(lesson.homeworkRules),
  }
}

export function isAssignmentEqual(
  a: EditableLesson,
  b: EditableLesson,
): boolean {
  if (a === b) return true
  if (Boolean(a.hasHomework) !== Boolean(b.hasHomework)) return false
  if ((a.homeworkTitle ?? '').trim() !== (b.homeworkTitle ?? '').trim()) return false
  if ((a.homeworkType ?? 'text') !== (b.homeworkType ?? 'text')) return false

  const descA = normalizeRichText(a.homeworkDescriptionHtml)
  const descB = normalizeRichText(b.homeworkDescriptionHtml)
  if (descA !== descB) return false

  if (normalizeQuiz(a.homeworkQuiz) !== normalizeQuiz(b.homeworkQuiz)) return false
  if (normalizeHomeworkRules(a.homeworkRules) !== normalizeHomeworkRules(b.homeworkRules)) return false

  return true
}

export function isAssignmentChanged(
  current: EditableLesson,
  baseline?: AssignmentBaseline | null,
): boolean {
  if (!baseline) return false
  if (Boolean(current.hasHomework) !== baseline.hasHomework) return true
  if ((current.homeworkTitle ?? '').trim() !== baseline.homeworkTitle) return true
  if ((current.homeworkType ?? 'text') !== baseline.homeworkType) return true

  const currentDesc = normalizeRichText(current.homeworkDescriptionHtml)
  if (currentDesc !== baseline.homeworkDescriptionHtml) return true

  if (normalizeQuiz(current.homeworkQuiz) !== baseline.homeworkQuizJson) return true
  if (normalizeHomeworkRules(current.homeworkRules) !== baseline.homeworkRulesJson) return true

  return false
}
