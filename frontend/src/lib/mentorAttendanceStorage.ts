import type {
  IMentorAttendanceSessionState,
  IMentorClassScheduleEntry,
  IMentorTodayClassCard,
  MentorAttendanceApprovalMode,
  MentorSessionAttendanceStatus,
} from '@/lib/types'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { getMergedMentorCourses, getCourseMeetingCount } from '@/lib/mentorCourseStorage'
import type { IMentorCourse } from '@/lib/types'
import { getMentorCourseStudents } from '@/lib/mentorCourseStudents'

const SCHEDULES_KEY = 'mentor_class_schedules_v1'
const SESSION_KEY_PREFIX = 'mentor_attendance_session_v1::'

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `sch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function sessionStorageKey(courseUid: string, isoDate: string) {
  return `${SESSION_KEY_PREFIX}${courseUid}::${isoDate}`
}

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function readSchedulesRaw(): IMentorClassScheduleEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as IMentorClassScheduleEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSchedules(entries: IMentorClassScheduleEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(entries))
}

/** Seed jadwal contoh hanya saat fixture mock aktif (pengembangan / `NEXT_PUBLIC_USE_MOCK_DATA=true`). */
function ensureScheduleSeed() {
  if (typeof window === 'undefined') return
  if (!isMockDataEnabled()) return
  if (localStorage.getItem(SCHEDULES_KEY) != null) return
  const seed: IMentorClassScheduleEntry[] = [
    { id: 'seed-mc001', courseUid: 'crs-001', weekday: 1, timeLabel: '09:00' },
    { id: 'seed-mc002', courseUid: 'crs-002', weekday: 1, timeLabel: '14:00' },
  ]
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(seed))
}

export function getMentorClassSchedules(): IMentorClassScheduleEntry[] {
  ensureScheduleSeed()
  return readSchedulesRaw()
}

export function upsertMentorClassSchedule(
  entry: Omit<IMentorClassScheduleEntry, 'id'> & { id?: string }
): IMentorClassScheduleEntry {
  const list = readSchedulesRaw()
  const id = entry.id ?? createId()
  const next: IMentorClassScheduleEntry = {
    id,
    courseUid: entry.courseUid,
    weekday: Math.min(6, Math.max(0, entry.weekday)),
    timeLabel: entry.timeLabel.trim() || '—',
  }
  const i = list.findIndex((e) => e.id === id)
  if (i >= 0) list[i] = next
  else list.push(next)
  writeSchedules(list)
  return next
}

export function deleteMentorClassSchedule(id: string) {
  const list = readSchedulesRaw().filter((e) => e.id !== id)
  writeSchedules(list)
}

function courseByUid(uid: string): IMentorCourse | undefined {
  return getMergedMentorCourses().find((c) => c.uid === uid)
}

/** Kelas yang dijadwalkan hari ini: kursus published + jadwal cocok weekday */
export function getTodayMentorClassCards(date: Date = new Date()): IMentorTodayClassCard[] {
  ensureScheduleSeed()
  const weekday = date.getDay()
  const schedules = readSchedulesRaw().filter((s) => s.weekday === weekday)
  const cards: IMentorTodayClassCard[] = []
  for (const s of schedules) {
    const course = courseByUid(s.courseUid)
    if (!course || !course.published) continue
    cards.push({
      scheduleId: s.id,
      courseUid: s.courseUid,
      timeLabel: s.timeLabel,
      title: course.title,
      header: course.header,
      image: course.image,
    })
  }
  return cards.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel, 'id'))
}

function defaultSessionState(courseUid: string, _isoDate: string): IMentorAttendanceSessionState {
  const students = getMentorCourseStudents(courseUid)
  const byStudent: IMentorAttendanceSessionState['byStudent'] = {}
  for (let i = 0; i < students.length; i++) {
    const s = students[i]
    byStudent[s.uid] = { effective: 'belum', pendingKind: null }
  }
  // Demo: dua siswa pertama punya permintaan hadir pending (hanya jika session baru)
  if (students.length >= 1) {
    byStudent[students[0].uid] = { effective: 'belum', pendingKind: 'hadir' }
  }
  if (students.length >= 2) {
    byStudent[students[1].uid] = { effective: 'belum', pendingKind: 'izin' }
  }
  return {
    meetingNumber: 1,
    approvalMode: 'review',
    byStudent,
  }
}

function readSession(courseUid: string, isoDate: string): IMentorAttendanceSessionState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(sessionStorageKey(courseUid, isoDate))
    if (!raw) return null
    return JSON.parse(raw) as IMentorAttendanceSessionState
  } catch {
    return null
  }
}

function writeSession(courseUid: string, isoDate: string, state: IMentorAttendanceSessionState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(sessionStorageKey(courseUid, isoDate), JSON.stringify(state))
}

/** Pastikan semua siswa terdaftar ada di byStudent */
function mergeStudentKeys(
  courseUid: string,
  state: IMentorAttendanceSessionState
): IMentorAttendanceSessionState {
  const students = getMentorCourseStudents(courseUid)
  const next = { ...state, byStudent: { ...state.byStudent } }
  for (const s of students) {
    if (!next.byStudent[s.uid]) {
      next.byStudent[s.uid] = { effective: 'belum', pendingKind: null }
    }
  }
  return next
}

export function getMentorAttendanceSession(courseUid: string, isoDate: string): IMentorAttendanceSessionState {
  const course = courseByUid(courseUid)
  if (!course) {
    return { meetingNumber: 1, approvalMode: 'review', byStudent: {} }
  }
  let state = readSession(courseUid, isoDate)
  if (!state) {
    state = defaultSessionState(courseUid, isoDate)
    writeSession(courseUid, isoDate, state)
  }
  const cap = Math.max(1, getCourseMeetingCount(course))
  if (state.meetingNumber < 1 || state.meetingNumber > cap) {
    state = { ...state, meetingNumber: Math.min(cap, Math.max(1, state.meetingNumber)) }
  }
  return mergeStudentKeys(courseUid, state)
}

export function setMentorSessionApprovalMode(
  courseUid: string,
  isoDate: string,
  approvalMode: MentorAttendanceApprovalMode
) {
  const state = getMentorAttendanceSession(courseUid, isoDate)
  const next = { ...state, approvalMode }
  writeSession(courseUid, isoDate, next)
}

export function setMentorSessionMeetingNumber(courseUid: string, isoDate: string, meetingNumber: number) {
  const course = courseByUid(courseUid)
  const cap = course ? Math.max(1, getCourseMeetingCount(course)) : 1
  const n = Math.min(cap, Math.max(1, meetingNumber))
  const state = getMentorAttendanceSession(courseUid, isoDate)
  const next = { ...state, meetingNumber: n }
  writeSession(courseUid, isoDate, next)
}

export function setMentorStudentEffectiveStatus(
  courseUid: string,
  isoDate: string,
  studentUid: string,
  effective: MentorSessionAttendanceStatus
) {
  const state = getMentorAttendanceSession(courseUid, isoDate)
  const prev = state.byStudent[studentUid] ?? { effective: 'belum' as const, pendingKind: null }
  const nextState = {
    ...state,
    byStudent: {
      ...state.byStudent,
      [studentUid]: { ...prev, effective, pendingKind: prev.pendingKind },
    },
  }
  writeSession(courseUid, isoDate, nextState)
}

/** Terima permintaan pending: terapkan ke effective */
export function approveMentorStudentPending(courseUid: string, isoDate: string, studentUid: string) {
  const state = getMentorAttendanceSession(courseUid, isoDate)
  const prev = state.byStudent[studentUid]
  if (!prev?.pendingKind) return
  const effective: MentorSessionAttendanceStatus = prev.pendingKind === 'hadir' ? 'hadir' : 'izin'
  const nextState = {
    ...state,
    byStudent: {
      ...state.byStudent,
      [studentUid]: { effective, pendingKind: null },
    },
  }
  writeSession(courseUid, isoDate, nextState)
}

/** Tolak permintaan: hapus pending, tetap belum */
export function rejectMentorStudentPending(courseUid: string, isoDate: string, studentUid: string) {
  const state = getMentorAttendanceSession(courseUid, isoDate)
  const prev = state.byStudent[studentUid] ?? { effective: 'belum' as const, pendingKind: null }
  const nextState = {
    ...state,
    byStudent: {
      ...state.byStudent,
      [studentUid]: { ...prev, pendingKind: null },
    },
  }
  writeSession(courseUid, isoDate, nextState)
}

/** Mencatat ajuan kehadiran/izin dari siswa (client storage sampai API tersedia). */
export function submitStudentAttendanceRequest(
  courseUid: string,
  isoDate: string,
  studentUid: string,
  kind: 'hadir' | 'izin'
) {
  const state = getMentorAttendanceSession(courseUid, isoDate)
  const prev = state.byStudent[studentUid] ?? { effective: 'belum' as const, pendingKind: null }
  if (state.approvalMode === 'auto') {
    const effective: MentorSessionAttendanceStatus = kind === 'hadir' ? 'hadir' : 'izin'
    const nextState = {
      ...state,
      byStudent: {
        ...state.byStudent,
        [studentUid]: { effective, pendingKind: null },
      },
    }
    writeSession(courseUid, isoDate, nextState)
    return
  }
  const nextState = {
    ...state,
    byStudent: {
      ...state.byStudent,
      [studentUid]: { ...prev, pendingKind: kind },
    },
  }
  writeSession(courseUid, isoDate, nextState)
}
