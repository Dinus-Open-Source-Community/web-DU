type Uid = string

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
export const API_BASE_URL = (rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : 'http://localhost:8080').replace(/\/+$/, '')

export const API_ROUTES = {
  auth: {
    login: `${API_BASE_URL}/login`,
    register: `${API_BASE_URL}/register`,
    oauth: {
      googleLogin: `${API_BASE_URL}/oauth/google/login`,
      googleCallback: `${API_BASE_URL}/oauth/google/callback`,
    },
  },
  avatar: {
    upload: `${API_BASE_URL}/avatar`,
  },
  user: {
    updateProfile: `${API_BASE_URL}/user/profile`,
    changePassword: `${API_BASE_URL}/user/password`,
    getSelfData: `${API_BASE_URL}/user/data`,
    getAllManagedUsers: `${API_BASE_URL}/user/manage/all`,
    updateManagedUserByUid: (uid: Uid) => `${API_BASE_URL}/user/manage/${uid}`,
    updateUserRoleByUid: (uid: Uid) => `${API_BASE_URL}/user/role/${uid}`,
    getUserByUid: (uid: Uid) => `${API_BASE_URL}/user/${uid}`,
  },
  mentor: {
    getAll: `${API_BASE_URL}/mentor/all`,
    getByUid: (uid: Uid) => `${API_BASE_URL}/mentor/${uid}`,
  },
  courses: {
    getAll: `${API_BASE_URL}/courses`,
    create: `${API_BASE_URL}/courses`,
    getByUid: (uid: Uid) => `${API_BASE_URL}/courses/${uid}`,
    joinByUid: (uid: Uid) => `${API_BASE_URL}/courses/${uid}/join`,
    createReviewByUid: (uid: Uid) => `${API_BASE_URL}/courses/${uid}/review`,
    replyReviewByUid: (courseUid: Uid, reviewUid: Uid) => `${API_BASE_URL}/courses/${courseUid}/review/${reviewUid}/reply`,
    updateStatusByUid: (uid: Uid) => `${API_BASE_URL}/courses/${uid}/status`,
    assignMentorsByUid: (uid: Uid) => `${API_BASE_URL}/courses/${uid}/mentors/assign`,
    getStudentsByUid: (uid: Uid) => `${API_BASE_URL}/courses/${uid}/students`,
  },
  courseCategories: {
    getAll: `${API_BASE_URL}/course-categories`,
    create: `${API_BASE_URL}/course-categories`,
    getByUid: (uid: Uid) => `${API_BASE_URL}/course-categories/${uid}`,
  },
  courseTypes: {
    getAll: `${API_BASE_URL}/course-types`,
    create: `${API_BASE_URL}/course-types`,
    getByUid: (uid: Uid) => `${API_BASE_URL}/course-types/${uid}`,
  },
  modules: {
    create: `${API_BASE_URL}/modules`,
    getByUid: (uid: Uid) => `${API_BASE_URL}/modules/${uid}`,
    getByCourseUid: (courseUid: Uid) => `${API_BASE_URL}/modules/course/${courseUid}`,
  },
  lessons: {
    getAll: `${API_BASE_URL}/lessons`,
    create: `${API_BASE_URL}/lessons`,
    getByUid: (uid: Uid) => `${API_BASE_URL}/lessons/${uid}`,
    assignment: {
      getByLessonUid: (lessonUid: Uid) => `${API_BASE_URL}/lessons/${lessonUid}/assignment`,
    },
    attendances: {
      create: `${API_BASE_URL}/lessons/attendances`,
      checkStatus: `${API_BASE_URL}/lessons/attendances/check-status`,
      getMyHistory: `${API_BASE_URL}/lessons/attendances/my-history`,
      getByUid: (uid: Uid) => `${API_BASE_URL}/lessons/attendances/${uid}`,
      getByLessonUid: (lessonUid: Uid) => `${API_BASE_URL}/lessons/attendances/lesson/${lessonUid}`,
    },
  },
  invoices: {
    getInvoiceUrl: `${API_BASE_URL}/invoices/url`,
    getByEnrollmentUid: (enrollmentUid: Uid) => `${API_BASE_URL}/invoices/${enrollmentUid}`,
  },
  payment: {
    create: `${API_BASE_URL}/payment/create`,
    getAll: `${API_BASE_URL}/payment`,
    callback: `${API_BASE_URL}/payment/callback`,
  },
  swagger: {
    ui: `${API_BASE_URL}/swagger/index.html`,
  },
} as const

export type ApiRoutes = typeof API_ROUTES
