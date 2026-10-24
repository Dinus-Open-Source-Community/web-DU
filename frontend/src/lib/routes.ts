import { DASHBOARD_PATH } from './dashboard-route'

export interface RouteChildItem {
  name: string
  path: string
}

export interface RouteItem {
  name: string
  path?: string
  children?: RouteChildItem[]
}

function dash(...segments: string[]) {
  return [DASHBOARD_PATH, ...segments.filter(Boolean)].join('/')
}

/** Path menu di dalam shell dashboard (tanpa prefix role di URL). */
export const dashboardMenu = {
  users: {
    students: dash('users', 'students'),
    studentDetail: (userUid: string) => dash('users', 'students', userUid),
    mentors: dash('users', 'mentors'),
    mentorDetail: (userUid: string) => dash('users', 'mentors', userUid),
    administrators: dash('users', 'administrators'),
    administratorDetail: (userUid: string) => dash('users', 'administrators', userUid),
  },
  courses: dash('courses'),
  courseCategories: dash('course-categories'),
  courseTypes: dash('course-types'),
  /** CRUD galeri gambar landing (dummy lokal — backend belum tersedia). */
  gallery: dash('gallery'),
  courseDetail: (courseUid: string) => dash('courses', courseUid),
  courseEdit: (courseUid: string) => dash('courses', courseUid, 'edit'),
  /** Halaman ringkasan tugas per kursus (mentor). */
  courseAssignmentHub: (courseUid: string) => dash('courses', courseUid, 'assignments'),
  assignmentSubmissions: (courseUid: string, lessonUid: string) =>
    dash('courses', courseUid, 'assignments', lessonUid),
  assignmentSubmissionDetail: (
    courseUid: string,
    lessonUid: string,
    submissionUid: string,
  ) => dash('courses', courseUid, 'assignments', lessonUid, 'submissions', submissionUid),
  reviewsAndQa: dash('reviews-and-qa'),
  learning: dash('learning'),
  learningCourse: (courseUid: string) => dash('learning', 'courses', courseUid),
  assignments: dash('assignments'),
  certificates: dash('certificates'),
}

export const ROUTES = {
  home: '/',
  gallery: '/gallery',
  mentors: '/mentors',
  dashboard: DASHBOARD_PATH,
  profile: '/settings',
  courses: '/course',
  courseDetail: (courseUid: string) => `/course/${courseUid}`,
  viewModuleAndLessons: (courseUid: string) => `/course/${courseUid}/view`,
  courseLessons: (courseUid: string) => `/course/${courseUid}/lessons`,
  login: '/auth/login',
  register: '/auth/register',
  verifyOtp: '/auth/verify-otp',
  redeem: '/redeem',
  oauthCallback: '/auth/oauth/callback',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  dashboardMenu,
  admin: {
    dashboard: DASHBOARD_PATH,
    users: dashboardMenu.users,
    courses: dashboardMenu.courses,
    courseCategories: dashboardMenu.courseCategories,
    courseTypes: dashboardMenu.courseTypes,
    gallery: dashboardMenu.gallery,
    detailCourseAdmin: dashboardMenu.courseDetail,
    assignmentSubmissions: dashboardMenu.assignmentSubmissions,
    assignmentSubmissionDetail: dashboardMenu.assignmentSubmissionDetail,
    courseEditAdmin: dashboardMenu.courseEdit,
    reviewsAndQaPath: dashboardMenu.reviewsAndQa,
    reviewsAndQa: (courseUid?: string) =>
      `${dashboardMenu.reviewsAndQa}${courseUid ? `?courseUid=${encodeURIComponent(courseUid)}` : ''}`,
  },
  mentor: {
    dashboard: DASHBOARD_PATH,
    courses: dashboardMenu.courses,
    detailCourseMentor: dashboardMenu.courseDetail,
    assignmentSubmissions: dashboardMenu.assignmentSubmissions,
    assignmentSubmissionDetail: dashboardMenu.assignmentSubmissionDetail,
    courseEditMentor: dashboardMenu.courseEdit,
    assignments: dashboardMenu.courseAssignmentHub,
    reviewsAndQaPath: dashboardMenu.reviewsAndQa,
    reviewsAndQa: (courseUid?: string) =>
      `${dashboardMenu.reviewsAndQa}${courseUid ? `?courseUid=${encodeURIComponent(courseUid)}` : ''}`,
  },
  student: {
    dashboard: DASHBOARD_PATH,
    learning: dashboardMenu.learning,
    learningCourse: dashboardMenu.learningCourse,
    assignments: dashboardMenu.assignments,
    certificates: dashboardMenu.certificates,
  },
} as const

export const routeGroups: Record<string, RouteItem[]> = {
  Admin: [
    { name: 'Dasbor', path: ROUTES.admin.dashboard },
    {
      name: 'Katalog Kursus',
      children: [
        { name: 'Kursus', path: ROUTES.admin.courses },
        { name: 'Kategori', path: ROUTES.admin.courseCategories },
        { name: 'Tipe Kursus', path: ROUTES.admin.courseTypes },
      ],
    },
    {
      name: 'Galeri',
      path: ROUTES.admin.gallery,
    },
    {
      name: 'Ulasan & Tanya Jawab',
      path: ROUTES.admin.reviewsAndQaPath,
    },
  ],
  SuperAdmin: [
    { name: 'Dasbor', path: ROUTES.admin.dashboard },
    {
      name: 'Kelola Pengguna',
      children: [
        { name: 'Siswa', path: ROUTES.admin.users.students },
        { name: 'Mentor', path: ROUTES.admin.users.mentors },
        { name: 'Administrator', path: ROUTES.admin.users.administrators },
      ],
    },
    {
      name: 'Katalog Kursus',
      children: [
        { name: 'Kursus', path: ROUTES.admin.courses },
        { name: 'Kategori', path: ROUTES.admin.courseCategories },
        { name: 'Tipe Kursus', path: ROUTES.admin.courseTypes },
      ],
    },
    { name: 'Galeri', path: ROUTES.admin.gallery },
    { name: 'Ulasan & Tanya Jawab', path: ROUTES.admin.reviewsAndQaPath },
  ],
  Mentor: [
    { name: 'Dasbor', path: ROUTES.mentor.dashboard },
    {
      name: 'Kursus',
      path: ROUTES.mentor.courses,
    },
    { name: 'Ulasan & Tanya Jawab', path: ROUTES.mentor.reviewsAndQaPath },
  ],
  Student: [
    { name: 'Dasbor', path: ROUTES.student.dashboard },
    {
      name: 'Pembelajaran Saya',
      children: [
        { name: 'Kursus', path: ROUTES.student.learning },
        { name: 'Tugas', path: ROUTES.student.assignments },
      ],
    },
  ],
}
