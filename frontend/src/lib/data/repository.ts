/**
 * Repository sinkron — single entry point untuk seluruh seed data.
 *
 * Membaca JSON saat module pertama kali di-import, lalu meng-index ke Map
 * untuk lookup cepat. Mengembalikan objek yang sudah di-join (mentor +
 * category di-embed pada course) supaya konsumen tidak perlu join manual.
 *
 * Upgrade ke async repository (API route / database):
 *   cukup ganti implementasi function di file ini; signature tetap.
 */

import type {
  ICardData,
  IModule,
  IMentorCourse,
  BadgeVariant,
  CourseStatus,
} from '@/lib/types'

import usersRaw from './json/users.json'
import mentorsRaw from './json/mentors.json'
import categoriesRaw from './json/categories.json'
import coursesRaw from './json/courses.json'
import reviewsRaw from './json/reviews.json'
import qaThreadsRaw from './json/qa-threads.json'

// ─── Raw JSON shapes ────────────────────────────────────────────────────────

interface RawUser {
  id: string
  nama: string
  role: string
  email: string
  avatar?: string
}

interface RawMentor {
  id: string
  bio?: string
  specializations: string[]
  studentsCount: number
  totalCourses: number
  status: string
  createdAt: string
  updatedAt: string
}

interface RawCategory {
  id: string
  name: string
  description?: string
  status: string
  colorVariant: string
}

interface RawCourse {
  uid: string
  variantBadge: string
  title: string
  description: string
  category: string
  mentorId: string
  rating: number
  totalReviews: number
  image: string
  price: number
  strikePrice?: number
  status: string
  enrolled: number
  duration: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
  modules: IModule[]
}

interface RawReview {
  uid: string
  courseUid: string
  courseTitle: string
  studentName: string
  studentAvatar: string
  rating: number
  comment: string
  createdAt: string
  reply?: { author: string; comment: string; createdAt: string }
}

interface RawQaReply {
  uid: string
  author: string
  authorAvatar: string
  role: 'student' | 'mentor' | 'admin'
  body: string
  createdAt: string
}

interface RawQaThread {
  uid: string
  courseUid: string
  courseTitle: string
  title: string
  author: string
  authorAvatar: string
  body: string
  createdAt: string
  repliesCount: number
  status: 'answered' | 'unanswered'
  replies: RawQaReply[]
}

// ─── Typed re-export shapes (match admin-fixtures contracts) ─────────────────

export interface RepoUser {
  id: string
  nama: string
  role: string
  email: string
  avatar?: string
}

export interface RepoMentor {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  totalCourses: number
  rating: number
  totalReviews: number
  status: string
  specializations: string[]
  bio?: string
  studentsCount: number
}

export interface RepoCategory {
  uid: string
  name: string
  description?: string
  status: string
  colorVariant: string
  coursesCount: number
}

export type RepoReview = RawReview
export type RepoQaThread = RawQaThread

// ─── Index building ──────────────────────────────────────────────────────────

const users = usersRaw as RawUser[]
const mentorProfiles = mentorsRaw as RawMentor[]
const categories = categoriesRaw as RawCategory[]
const rawCourses = coursesRaw as RawCourse[]
const reviews = reviewsRaw as RawReview[]
const qaThreads = qaThreadsRaw as RawQaThread[]

const userById = new Map(users.map((u) => [u.id, u]))
const mentorById = new Map(mentorProfiles.map((m) => [m.id, m]))

function resolveAuthor(mentorId: string): { name: string; avatar: string } {
  const u = userById.get(mentorId)
  if (u) return { name: u.nama, avatar: u.avatar ?? '' }
  return { name: 'Unknown', avatar: '' }
}

function formatDate(iso: string): string {
  if (!iso || iso === 'Draft') return iso
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

const coursesIndex: ICardData[] = rawCourses.map((rc) => {
  const author = resolveAuthor(rc.mentorId)
  return {
    uid: rc.uid,
    variantBadge: rc.variantBadge as BadgeVariant,
    title: rc.title,
    description: rc.description,
    category: rc.category,
    author,
    rating: rc.rating,
    totalReviews: rc.totalReviews,
    image: rc.image,
    price: rc.price,
    strikePrice: rc.strikePrice,
    status: rc.status as CourseStatus,
    mentorUid: rc.mentorId,
    enrolled: rc.enrolled,
    modules: rc.modules,
    duration: rc.duration,
    createdAt: rc.createdAt,
    updatedAt: rc.updatedAt,
    submittedAt: rc.submittedAt,
  }
})

const courseByUid = new Map(coursesIndex.map((c) => [c.uid, c]))
const reviewsByCourse = new Map<string, RepoReview[]>()
for (const r of reviews) {
  const arr = reviewsByCourse.get(r.courseUid) ?? []
  arr.push(r)
  reviewsByCourse.set(r.courseUid, arr)
}
const qaByCourse = new Map<string, RepoQaThread[]>()
for (const t of qaThreads) {
  const arr = qaByCourse.get(t.courseUid) ?? []
  arr.push(t)
  qaByCourse.set(t.courseUid, arr)
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function listUsers(): RepoUser[] {
  return users
}

export function getUserById(id: string): RepoUser | undefined {
  return userById.get(id)
}

export function listMentors(): RepoMentor[] {
  return mentorProfiles.map((mp) => {
    const u = userById.get(mp.id)
    return {
      uid: mp.id,
      name: u?.nama ?? mp.id,
      email: u?.email ?? '',
      avatar: u?.avatar ?? '',
      joinedAt: formatDate(mp.createdAt),
      totalCourses: mp.totalCourses,
      rating: 0,
      totalReviews: 0,
      status: mp.status,
      specializations: mp.specializations,
      bio: mp.bio,
      studentsCount: mp.studentsCount,
    }
  })
}

export function getMentorById(id: string): RepoMentor | undefined {
  return listMentors().find((m) => m.uid === id)
}

export function listCategories(): RepoCategory[] {
  return categories.map((cat) => ({
    uid: cat.id,
    name: cat.name,
    description: cat.description,
    status: cat.status,
    colorVariant: cat.colorVariant,
    coursesCount: coursesIndex.filter((c) => c.category === cat.name).length,
  }))
}

export function listCourses(): ICardData[] {
  return coursesIndex
}

export function getCourseByUid(uid: string): ICardData | undefined {
  return courseByUid.get(uid)
}

export function listCoursesByMentor(mentorId: string): ICardData[] {
  return coursesIndex.filter((c) => c.mentorUid === mentorId)
}

export function listCoursesByCategory(categoryName: string): ICardData[] {
  return coursesIndex.filter((c) => c.category === categoryName)
}

export function listPopularCourses(limit = 8): ICardData[] {
  return coursesIndex
    .filter((c) => c.status === 'published')
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, limit)
}

export function listAllReviews(): RepoReview[] {
  return reviews
}

export function listReviewsForCourse(courseId: string): RepoReview[] {
  return reviewsByCourse.get(courseId) ?? []
}

export function listAllQaThreads(): RepoQaThread[] {
  return qaThreads
}

export function listQaThreadsForCourse(courseId: string): RepoQaThread[] {
  return qaByCourse.get(courseId) ?? []
}

/**
 * Derive silabus dari modul+lesson yang ada di course.
 * Mengembalikan array section untuk `CourseSyllabusList`.
 */
export function getSyllabusFromCourse(
  course: ICardData,
): { title: string; lessonsCount: number; durationLabel: string }[] {
  return course.modules.map((m) => {
    const totalMin = m.lessons.reduce((acc, l) => acc + l.durationMinutes, 0)
    const hrs = Math.floor(totalMin / 60)
    const mins = totalMin % 60
    const durationLabel = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`
    return {
      title: m.title,
      lessonsCount: m.lessons.length,
      durationLabel,
    }
  })
}

/**
 * Project course ke bentuk `IMentorCourse` untuk mentor course list.
 */
export function toMentorCourseView(c: ICardData): IMentorCourse {
  return {
    uid: c.uid,
    title: c.title,
    header: c.description.slice(0, 80),
    description: c.description,
    image: c.image,
    published: c.status === 'published',
    moduleCount: c.modules.length,
    studentCount: c.enrolled,
    rating: c.rating,
    totalReviews: c.totalReviews,
    updatedAt: c.updatedAt,
  }
}
