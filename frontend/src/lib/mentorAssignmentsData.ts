import type {
  DeadlineUrgency,
  IMentorAssignmentStats,
  IMentorAssignmentSubmission,
  IMentorCourseAssignment,
  MentorAssignmentLifecycleStatus,
} from '@/lib/types'

const REVIEW_STORAGE_KEY = 'mentor_assignment_submission_reviews_v1'
const EXTRA_ASSIGNMENTS_KEY = 'mentor_assignments_extra_v1'
/** Edit/hapus tugas seed (demo) — disimpan di localStorage */
const SEED_ASSIGNMENT_STATE_KEY = 'mentor_assignments_seed_state_v1'

type SeedAssignmentState = {
  removedUids: string[]
  overrides: Record<string, IMentorCourseAssignment>
}

function readSeedAssignmentState(): SeedAssignmentState {
  if (typeof window === 'undefined') return { removedUids: [], overrides: {} }
  try {
    const raw = localStorage.getItem(SEED_ASSIGNMENT_STATE_KEY)
    if (!raw) return { removedUids: [], overrides: {} }
    const parsed = JSON.parse(raw) as Partial<SeedAssignmentState>
    const removedUids = Array.isArray(parsed.removedUids) ? parsed.removedUids.filter((x) => typeof x === 'string') : []
    const overrides =
      parsed.overrides && typeof parsed.overrides === 'object' && parsed.overrides !== null
        ? (parsed.overrides as Record<string, IMentorCourseAssignment>)
        : {}
    return { removedUids, overrides }
  } catch {
    return { removedUids: [], overrides: {} }
  }
}

function writeSeedAssignmentState(state: SeedAssignmentState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SEED_ASSIGNMENT_STATE_KEY, JSON.stringify(state))
}

export const ASSIGNMENT_SEED: IMentorCourseAssignment[] = [
  {
    uid: 'asg-mc001-1',
    courseId: 'mc-001',
    meetingNumber: 4,
    title: 'Mini project: REST API + auth',
    description: 'Bangun endpoint CRUD dengan JWT refresh token.',
    deadlineAt: '2026-04-15T23:59:59.000Z',
    status: 'published',
    autoCloseAfterDeadline: true,
    allowResubmit: true,
    maxAttempts: 3,
  },
  {
    uid: 'asg-mc001-2',
    courseId: 'mc-001',
    meetingNumber: 3,
    title: 'Essay: arsitektur App Router',
    description: 'Ringkas pola RSC vs client components.',
    deadlineAt: '2026-04-10T12:00:00.000Z',
    status: 'published',
    autoCloseAfterDeadline: true,
    allowResubmit: false,
  },
  {
    uid: 'asg-mc001-3',
    courseId: 'mc-001',
    meetingNumber: 5,
    title: 'Workshop UI (draf)',
    description: 'Akan dipublikasikan minggu depan.',
    deadlineAt: '2026-05-01T23:59:59.000Z',
    status: 'draft',
    autoCloseAfterDeadline: false,
    allowResubmit: true,
  },
  {
    uid: 'asg-mc002-1',
    courseId: 'mc-002',
    meetingNumber: 2,
    title: 'Design tokens & dokumentasi',
    description: 'Ekspor token ke CSS variables.',
    deadlineAt: '2026-04-18T18:00:00.000Z',
    status: 'published',
    autoCloseAfterDeadline: true,
    allowResubmit: true,
    maxAttempts: 2,
  },
]

const SEED_UIDS = new Set(ASSIGNMENT_SEED.map((a) => a.uid))

export function isSeedAssignmentUid(uid: string): boolean {
  return SEED_UIDS.has(uid)
}

function readExtraAssignments(): IMentorCourseAssignment[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(EXTRA_ASSIGNMENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as IMentorCourseAssignment[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeExtraAssignments(list: IMentorCourseAssignment[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(EXTRA_ASSIGNMENTS_KEY, JSON.stringify(list))
}

function sortByDeadline(list: IMentorCourseAssignment[]): IMentorCourseAssignment[] {
  return [...list].sort((a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime())
}

function getSeedAssignmentsForCourse(courseId: string): IMentorCourseAssignment[] {
  const state = readSeedAssignmentState()
  const removed = new Set(state.removedUids)
  return ASSIGNMENT_SEED.filter((a) => a.courseId === courseId && !removed.has(a.uid)).map(
    (a) => state.overrides[a.uid] ?? a
  )
}

export function getAssignmentsForCourse(courseId: string): IMentorCourseAssignment[] {
  const seed = getSeedAssignmentsForCourse(courseId)
  const extra = readExtraAssignments().filter((a) => a.courseId === courseId)
  return sortByDeadline([...seed, ...extra])
}

export function countAssignmentsForCourse(courseId: string): number {
  return getAssignmentsForCourse(courseId).length
}

/** Gabungan tugas dari semua kursus (untuk hub /mentor/assignments). */
export type IMentorAssignmentHubRow = IMentorCourseAssignment & { courseTitle: string }

export function listAllAssignmentsForHub(courses: { uid: string; title: string }[]): IMentorAssignmentHubRow[] {
  const out: IMentorAssignmentHubRow[] = []
  for (const c of courses) {
    for (const a of getAssignmentsForCourse(c.uid)) {
      out.push({ ...a, courseTitle: c.title })
    }
  }
  return out.sort((a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime())
}

export type MentorAssignmentInput = Omit<IMentorCourseAssignment, 'uid' | 'courseId'>

export function createMentorAssignment(courseId: string, input: MentorAssignmentInput): IMentorCourseAssignment {
  const uid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `asg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
  const row: IMentorCourseAssignment = {
    uid,
    courseId,
    ...input,
  }
  const list = readExtraAssignments()
  list.push(row)
  writeExtraAssignments(list)
  return row
}

export function updateMentorAssignment(uid: string, input: MentorAssignmentInput): IMentorCourseAssignment | null {
  if (isSeedAssignmentUid(uid)) {
    const base = ASSIGNMENT_SEED.find((a) => a.uid === uid)
    if (!base) return null
    const next: IMentorCourseAssignment = { uid, courseId: base.courseId, ...input }
    const state = readSeedAssignmentState()
    state.overrides[uid] = next
    writeSeedAssignmentState(state)
    return next
  }
  const list = readExtraAssignments()
  const i = list.findIndex((a) => a.uid === uid)
  if (i < 0) return null
  const courseId = list[i].courseId
  const next: IMentorCourseAssignment = { uid, courseId, ...input }
  list[i] = next
  writeExtraAssignments(list)
  return next
}

export function deleteMentorAssignment(uid: string): boolean {
  if (isSeedAssignmentUid(uid)) {
    if (!ASSIGNMENT_SEED.some((a) => a.uid === uid)) return false
    const state = readSeedAssignmentState()
    if (state.removedUids.includes(uid)) return false
    state.removedUids = [...state.removedUids, uid]
    delete state.overrides[uid]
    writeSeedAssignmentState(state)
    return true
  }
  const list = readExtraAssignments()
  const next = list.filter((a) => a.uid !== uid)
  if (next.length === list.length) return false
  writeExtraAssignments(next)
  return true
}

export const SUBMISSION_SEED: IMentorAssignmentSubmission[] = [
  {
    uid: 'sub-mc001-1',
    assignmentUid: 'asg-mc001-1',
    courseId: 'mc-001',
    studentUid: 'stu-1',
    studentName: 'Rina Kusuma',
    studentAvatar: 'https://i.pravatar.cc/150?img=32',
    submittedAt: '2026-04-12T08:30:00.000Z',
    attemptNumber: 2,
    reviewStatus: 'pending_review',
    rating: null,
    mentorComment: null,
    reviewedAt: null,
    contentBlocks: [
      { type: 'text', text: 'Berikut lampiran tugas saya. Saya sudah menambahkan refresh token di cookie httpOnly.' },
      {
        type: 'link',
        url: 'https://github.com/example/next-api-demo',
        label: 'Repositori GitHub',
      },
      {
        type: 'file',
        fileName: 'postman-collection.json',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mime: 'application/json',
      },
      {
        type: 'videoEmbed',
        provider: 'youtube',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'Demo API',
      },
    ],
  },
  {
    uid: 'sub-mc001-2',
    assignmentUid: 'asg-mc001-1',
    courseId: 'mc-001',
    studentUid: 'stu-2',
    studentName: 'Bagas Pratama',
    studentAvatar: 'https://i.pravatar.cc/150?img=12',
    submittedAt: '2026-04-11T14:00:00.000Z',
    attemptNumber: 1,
    reviewStatus: 'graded',
    rating: 4,
    mentorComment: 'Struktur rapi, pertimbangkan rate limiting.',
    reviewedAt: '2026-04-11T16:00:00.000Z',
    contentBlocks: [
      { type: 'text', text: 'Saya lampirkan screenshot Postman dan skema DB.' },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/asg1/800/450',
        alt: 'Screenshot arsitektur',
      },
    ],
  },
  {
    uid: 'sub-mc001-3',
    assignmentUid: 'asg-mc001-2',
    courseId: 'mc-001',
    studentUid: 'stu-1',
    studentName: 'Rina Kusuma',
    studentAvatar: 'https://i.pravatar.cc/150?img=32',
    submittedAt: '2026-04-09T10:00:00.000Z',
    attemptNumber: 1,
    reviewStatus: 'returned',
    rating: 3,
    mentorComment: 'Perdalam bagian caching; revisi dan kirim ulang.',
    reviewedAt: '2026-04-09T15:00:00.000Z',
    contentBlocks: [{ type: 'text', text: 'Essay versi pertama — fokus pada layout nesting.' }],
  },
  {
    uid: 'sub-mc002-1',
    assignmentUid: 'asg-mc002-1',
    courseId: 'mc-002',
    studentUid: 'stu-3',
    studentName: 'Dewi Lestari',
    studentAvatar: 'https://i.pravatar.cc/150?img=45',
    submittedAt: '2026-04-13T09:00:00.000Z',
    attemptNumber: 1,
    reviewStatus: 'pending_review',
    rating: null,
    mentorComment: null,
    reviewedAt: null,
    contentBlocks: [
      { type: 'text', text: 'Token warna diekspor ke JSON dan CSS.' },
      {
        type: 'file',
        fileName: 'tokens.json',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mime: 'application/json',
      },
    ],
  },
]

function readReviewOverrides(): Record<
  string,
  Pick<IMentorAssignmentSubmission, 'rating' | 'mentorComment' | 'reviewStatus' | 'reviewedAt'>
> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Partial<IMentorAssignmentSubmission>>
    return parsed as Record<
      string,
      Pick<IMentorAssignmentSubmission, 'rating' | 'mentorComment' | 'reviewStatus' | 'reviewedAt'>
    >
  } catch {
    return {}
  }
}

export function saveSubmissionReview(
  submissionUid: string,
  patch: Pick<IMentorAssignmentSubmission, 'rating' | 'mentorComment' | 'reviewStatus' | 'reviewedAt'>
) {
  if (typeof window === 'undefined') return
  const prev = readReviewOverrides()
  prev[submissionUid] = patch
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(prev))
}

export function getSubmissionsForCourse(courseId: string): IMentorAssignmentSubmission[] {
  const overrides = readReviewOverrides()
  return SUBMISSION_SEED.filter((s) => s.courseId === courseId).map((s) => {
    const o = overrides[s.uid]
    if (!o) return s
    return { ...s, ...o }
  })
}

const DUE_SOON_MS = 72 * 60 * 60 * 1000

export function getEffectiveAssignmentStatus(
  a: IMentorCourseAssignment,
  now: Date = new Date()
): MentorAssignmentLifecycleStatus {
  if (a.status === 'draft' || a.status === 'closed') return a.status
  const end = new Date(a.deadlineAt).getTime()
  if (a.autoCloseAfterDeadline && now.getTime() > end) return 'closed'
  return a.status
}

export function getDeadlineUrgency(a: IMentorCourseAssignment, now: Date = new Date()): DeadlineUrgency {
  const effective = getEffectiveAssignmentStatus(a, now)
  if (effective === 'closed' || a.status === 'draft') return effective === 'draft' ? 'ok' : 'closed'
  const end = new Date(a.deadlineAt).getTime()
  const t = now.getTime()
  if (t > end) return 'overdue'
  if (end - t <= DUE_SOON_MS) return 'due_soon'
  return 'ok'
}

export function computeAssignmentStats(
  assignments: IMentorCourseAssignment[],
  submissions: IMentorAssignmentSubmission[],
  now: Date = new Date()
): IMentorAssignmentStats {
  const published = assignments.filter((a) => a.status === 'published')
  const activeAssignments = published.filter((a) => getEffectiveAssignmentStatus(a, now) !== 'closed').length

  const awaitingReview = submissions.filter((s) => s.reviewStatus === 'pending_review').length

  const dueSoonCount = published.filter((a) => getDeadlineUrgency(a, now) === 'due_soon').length

  const resubmitAwaitingReview = submissions.filter(
    (s) => s.reviewStatus === 'pending_review' && s.attemptNumber > 1
  ).length

  return {
    activeAssignments,
    awaitingReview,
    dueSoonCount,
    resubmitAwaitingReview,
  }
}

export type SubmissionFilterStatus = 'all' | 'pending_review' | 'graded' | 'returned'

export function filterSubmissions(
  submissions: IMentorAssignmentSubmission[],
  opts: {
    assignmentUid: string | 'all'
    status: SubmissionFilterStatus
    from?: string
    to?: string
  }
): IMentorAssignmentSubmission[] {
  let list = submissions
  if (opts.assignmentUid !== 'all') {
    list = list.filter((s) => s.assignmentUid === opts.assignmentUid)
  }
  if (opts.status !== 'all') {
    list = list.filter((s) => s.reviewStatus === opts.status)
  }
  if (opts.from) {
    const fromT = new Date(opts.from).getTime()
    list = list.filter((s) => new Date(s.submittedAt).getTime() >= fromT)
  }
  if (opts.to) {
    const toT = new Date(opts.to)
    toT.setHours(23, 59, 59, 999)
    list = list.filter((s) => new Date(s.submittedAt).getTime() <= toT.getTime())
  }
  return list
}
