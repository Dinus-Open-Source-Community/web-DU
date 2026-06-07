import type { IQuiz } from '@/lib/types/lesson'

import { normalizeQuizPayload } from './quiz-payload'
import type { QuizAnswersMap, QuizReviewSummary } from './types'

function findOptionLabel(options: { id: string; label: string }[], optionId: string) {
  return options.find((option) => option.id === optionId)?.label ?? 'Tidak dijawab'
}

export function buildQuizReviewSummary(
  quiz: IQuiz | null,
  answers: QuizAnswersMap,
  grading?: {
    scorePercent: number | null
    passed: boolean | null
    quizCorrectCount: number | null
    quizQuestionCount: number | null
  },
): QuizReviewSummary | null {
  const normalizedQuiz = normalizeQuizPayload(quiz)
  if (!normalizedQuiz?.questions.length) return null

  const passingScore = normalizedQuiz.passingScore ?? 70
  const totalQuestions = normalizedQuiz.questions.length
  const pointsPerQuestion = totalQuestions > 0 ? 100 / totalQuestions : 0

  const questions = normalizedQuiz.questions.map((question) => {
    const selectedOptionId = answers[question.id] ?? ''
    const isCorrect = selectedOptionId !== '' && selectedOptionId === question.correctOptionId

    return {
      questionId: question.id,
      prompt: question.promptHtml,
      selectedOptionId,
      selectedLabel: findOptionLabel(question.options, selectedOptionId),
      correctOptionId: question.correctOptionId,
      correctLabel: findOptionLabel(question.options, question.correctOptionId),
      isCorrect,
      pointsEarned: isCorrect ? pointsPerQuestion : 0,
      maxPoints: pointsPerQuestion,
    }
  })

  const totalEarned = questions.reduce((sum, item) => sum + item.pointsEarned, 0)
  const totalMax = questions.reduce((sum, item) => sum + item.maxPoints, 0)

  return {
    questions,
    totalEarned,
    totalMax,
    scorePercent: grading?.scorePercent ?? (totalMax > 0 ? Math.round((totalEarned / totalMax) * 1000) / 10 : null),
    passed: grading?.passed ?? (totalMax > 0 ? totalEarned >= (passingScore / 100) * totalMax : null),
    passingScore,
  }
}
