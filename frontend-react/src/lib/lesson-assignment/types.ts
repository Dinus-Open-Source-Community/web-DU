import type { IQuiz, LessonDetailAssignment } from '@/lib/types/lesson'

export type QuizAnswersMap = Record<string, string>

export type LessonAssignmentGrading = {
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

export type LessonAssignmentSubmissionRecord = {
  uid: string
  plainText: string
  richText: unknown
  fileUrl: string
  fileOriginalFilename: string
  fileDescription: string
  quizAnswers: QuizAnswersMap
  attemptCount: number
  createdAt: string
  updatedAt: string
  grading: LessonAssignmentGrading
}

export type StudentSubmissionPhase = 'not_submitted' | 'pending_review' | 'graded'

export type QuizQuestionReview = {
  questionId: string
  /** HTML prompt — sudah dinormalisasi dari string atau rich text envelope. */
  prompt: string
  selectedOptionId: string
  selectedLabel: string
  correctOptionId: string
  correctLabel: string
  isCorrect: boolean
  pointsEarned: number
  maxPoints: number
}

export type QuizReviewSummary = {
  questions: QuizQuestionReview[]
  totalEarned: number
  totalMax: number
  scorePercent: number | null
  passed: boolean | null
  passingScore: number
}

export type CourseViewerPane = 'lesson' | 'assignment' | 'assignment-work' | 'assignment-detail'

export type AssignmentContext = {
  assignment: LessonDetailAssignment
  quiz: IQuiz | null
  submission: LessonAssignmentSubmissionRecord | null
  phase: StudentSubmissionPhase
}
