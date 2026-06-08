import type { IQuiz, ILessonDetailAssignment } from '../data/lesson'
import type { IRichTextEnvelope } from '../data/rich-text'

export type QuizAnswersMap = Record<string, string>

export interface ILessonAssignmentGrading {
  scorePercent: number | null
  passed: boolean | null
  feedback: string
  hasFeedback: boolean
  isGraded: boolean
  gradedAt: string | null
  isAutoGraded: boolean
  quizCorrectCount: number | null
  quizQuestionCount: number | null
}

export interface ILessonAssignmentSubmissionRecord {
  uid: string
  plainText: string
  richText: IRichTextEnvelope | string | null
  fileUrl: string
  fileOriginalFilename: string
  fileDescription: string
  quizAnswers: QuizAnswersMap
  attemptCount: number
  createdAt: string
  updatedAt: string
  grading: ILessonAssignmentGrading
}

export type StudentSubmissionPhase = 'not_submitted' | 'pending_review' | 'graded'

export interface IQuizQuestionReview {
  questionId: string
  prompt: string
  selectedOptionId: string
  selectedLabel: string
  correctOptionId: string
  correctLabel: string
  isCorrect: boolean
  pointsEarned: number
  maxPoints: number
}

export interface IQuizReviewSummary {
  questions: IQuizQuestionReview[]
  totalEarned: number
  totalMax: number
  scorePercent: number | null
  passed: boolean | null
  passingScore: number
}

export type CourseViewerPane = 'lesson' | 'assignment' | 'assignment-work' | 'assignment-detail'

export interface IAssignmentContext {
  assignment: ILessonDetailAssignment
  quiz: IQuiz | null
  submission: ILessonAssignmentSubmissionRecord | null
  phase: StudentSubmissionPhase
}

/** Alias backward-compat. */
export type LessonAssignmentGrading = ILessonAssignmentGrading
export type LessonAssignmentSubmissionRecord = ILessonAssignmentSubmissionRecord
export type QuizQuestionReview = IQuizQuestionReview
export type QuizReviewSummary = IQuizReviewSummary
export type AssignmentContext = IAssignmentContext
