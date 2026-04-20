import type { ReactNode } from 'react'

/** Badge & status katalog kursus. */
export type BadgeVariant = 'free' | 'premium' | 'event' | 'draft'

export type CourseStatus = 'published' | 'draft' | 'pending' | 'rejected'

export type CourseLevel = 'Pemula' | 'Menengah' | 'Lanjutan'

export type CourseClassType = 'Free' | 'Premium' | 'Event'

export type CourseCategory = 'Pengembangan Web' | 'Desain UI/UX' | 'Data Science & AI' | 'Bisnis & Manajemen' | 'Cybersecurity'

/** Quiz & lesson (modul kursus). */
export interface IQuizOption {
  id: string
  label: string
}

export interface IQuizQuestion {
  id: string
  prompt: string
  options: IQuizOption[]
  correctOptionId: string
  explanation?: string
}

export interface IQuiz {
  questions: IQuizQuestion[]
  passingScore?: number
}

export type LessonContentType = 'tiptap' | 'video' | 'quiz'
export type HomeworkTaskType = 'text' | 'quiz'

interface ILessonBase {
  id: string
  title: string
  order: number
  durationMinutes: number
  hasHomework?: boolean
  homeworkType?: HomeworkTaskType
  homeworkDescriptionHtml?: string
  homeworkQuiz?: IQuiz
}

export type ILesson =
  | (ILessonBase & { contentType: 'tiptap'; contentHtml: string })
  | (ILessonBase & { contentType: 'video'; videoUrl: string; contentHtml?: string })
  | (ILessonBase & { contentType: 'quiz'; quiz: IQuiz })

export interface IModule {
  id: string
  title: string
  order: number
  lessons: ILesson[]
}

/** @deprecated Alias — gunakan `IModule` untuk kode baru. */
export type ICourseModule = IModule

export interface ICourseModulesState {
  version: 2
  modules: IModule[]
}

export interface ICardData {
  uid: string
  variantBadge: BadgeVariant
  title: string
  description: string
  /** FK ke `categories[].id` di seed/API; optional untuk kompatibilitas. */
  categoryId?: string
  category?: string
  author: {
    name: string
    avatar: string
  }
  rating: number
  totalReviews: number
  image: string
  price: number
  status: CourseStatus
  mentorUid: string
  enrolled: number
  modules: IModule[]
  duration: string
  strikePrice?: number
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

export interface IProgramFeatures {
  title: string
  description: string
  icon: ReactNode
}

/** Breakdown bintang untuk kartu / analytics kursus. */
export interface CourseFeedbackBreakdown {
  stars: number
  percent: number
}

export interface CourseExtrasData {
  whatYouLearn: string[]
  feedbackBreakdown: CourseFeedbackBreakdown[]
  mentorSpecColors: Record<string, string>
}
