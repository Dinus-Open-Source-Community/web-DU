import { parseLessonContent } from '@/lib/rich-text'
import type { IQuiz, IQuizOption } from '@/lib/types/lesson'

export type NormalizedQuizQuestion = {
  id: string
  promptHtml: string
  options: IQuizOption[]
  correctOptionId: string
  explanation?: string
}

export type NormalizedQuiz = {
  questions: NormalizedQuizQuestion[]
  passingScore?: number
}

function normalizeQuizPrompt(raw: unknown): string {
  if (typeof raw === 'string') return raw.trim()
  return parseLessonContent(raw).contentHtml
}

export function normalizeQuizPayload(raw: IQuiz | null | undefined): NormalizedQuiz | null {
  if (!raw?.questions?.length) return null

  return {
    passingScore: raw.passingScore,
    questions: raw.questions
      .filter((question) => typeof question.id === 'string' && question.id.trim() !== '')
      .map((question) => ({
        id: question.id,
        promptHtml: normalizeQuizPrompt(question.prompt),
        options: Array.isArray(question.options) ? question.options : [],
        correctOptionId: question.correctOptionId,
        explanation: question.explanation,
      })),
  }
}
