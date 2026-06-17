import { format } from 'date-fns'
import { id } from 'date-fns/locale'

import type {
  AdminModerationReviewReplyRaw,
  AdminQaReplyRaw,
  AdminQaThreadRaw,
  AdminReviewRaw,
} from '@/lib/admin-moderation/api-types'
import type { AdminQaReply, AdminQaThread, AdminReview } from '@/lib/types/course'

function formatModerationDate(value: string | Date | undefined | null) {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)

  return format(date, 'd MMM yyyy, HH:mm', { locale: id })
}

function mapReviewReply(raw: AdminModerationReviewReplyRaw | undefined): AdminReview['reply'] | undefined {
  if (!raw) return undefined

  const comment = typeof raw.comment === 'string' ? raw.comment : ''
  if (!comment.trim()) return undefined

  return {
    author: typeof raw.author === 'string' ? raw.author : 'Admin',
    comment,
    createdAt: formatModerationDate(raw.createdAt),
  }
}

export function mapAdminReviewItem(raw: AdminReviewRaw): AdminReview | null {
  const uid = typeof raw.uid === 'string' ? raw.uid : ''
  if (!uid) return null

  const courseUid = typeof raw.courseUid === 'string' ? raw.courseUid : ''
  const courseTitle = typeof raw.courseTitle === 'string' ? raw.courseTitle : '-'
  const studentName = typeof raw.studentName === 'string' ? raw.studentName : 'Siswa'
  const studentAvatar = typeof raw.studentAvatar === 'string' ? raw.studentAvatar : ''
  const comment = typeof raw.comment === 'string' ? raw.comment : ''
  const rating = typeof raw.rating === 'number' ? raw.rating : Number(raw.rating ?? 0)

  return {
    uid,
    courseUid,
    studentUid: typeof raw.studentUid === 'string' ? raw.studentUid : undefined,
    courseTitle,
    studentName,
    studentAvatar,
    rating: Number.isFinite(rating) ? rating : 0,
    comment,
    createdAt: formatModerationDate(raw.createdAt),
    reply: mapReviewReply(raw.reply),
  }
}

function mapQaReplyItem(raw: AdminQaReplyRaw): AdminQaReply | null {
  const uid = typeof raw.uid === 'string' ? raw.uid : ''
  const body = typeof raw.body === 'string' ? raw.body : ''
  if (!uid || !body.trim()) return null

  const role = raw.role === 'mentor' || raw.role === 'admin' ? raw.role : 'student'

  return {
    uid,
    author: typeof raw.author === 'string' ? raw.author : 'Pengguna',
    authorAvatar: typeof raw.authorAvatar === 'string' ? raw.authorAvatar : '',
    role,
    body,
    createdAt: formatModerationDate(raw.createdAt),
  }
}

export function mapAdminQaThreadItem(raw: AdminQaThreadRaw): AdminQaThread | null {
  const uid = typeof raw.uid === 'string' ? raw.uid : ''
  if (!uid) return null

  const replies = Array.isArray(raw.replies)
    ? raw.replies.map(mapQaReplyItem).filter((reply): reply is AdminQaReply => reply !== null)
    : []

  const status = raw.status === 'answered' ? 'answered' : 'unanswered'

  return {
    uid,
    courseUid: typeof raw.courseUid === 'string' ? raw.courseUid : '',
    authorUid: typeof raw.authorUid === 'string' ? raw.authorUid : undefined,
    courseTitle: typeof raw.courseTitle === 'string' ? raw.courseTitle : '-',
    title: typeof raw.title === 'string' ? raw.title : 'Pertanyaan',
    author: typeof raw.author === 'string' ? raw.author : 'Pengguna',
    authorAvatar: typeof raw.authorAvatar === 'string' ? raw.authorAvatar : '',
    body: typeof raw.body === 'string' ? raw.body : '',
    createdAt: formatModerationDate(raw.createdAt),
    repliesCount:
      typeof raw.repliesCount === 'number'
        ? raw.repliesCount
        : replies.length,
    status,
    replies,
  }
}
