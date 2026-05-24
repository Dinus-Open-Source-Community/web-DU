type Uid = string

const BACKEND_URL = 'http://localhost:8080'

export const API_ROUTES = {
  auth: {
    login: `${BACKEND_URL}/login`,
    register: `${BACKEND_URL}/register`,
    oauth: {
      googleLogin: `${BACKEND_URL}/oauth/google/login`,
      googleCallback: `${BACKEND_URL}/oauth/google/callback`,
    },
  },
  avatar: {
    upload: `${BACKEND_URL}/avatar`,
  },
  user: {
    updateProfile: `${BACKEND_URL}/user/profile`,
    changePassword: `${BACKEND_URL}/user/password`,
    getSelfData: `${BACKEND_URL}/user/data`,
    getAllManagedUsers: `${BACKEND_URL}/user/manage/all`,
    updateManagedUserByUid: (uid: Uid) => `${BACKEND_URL}/user/manage/${uid}`,
    updateUserRoleByUid: (uid: Uid) => `${BACKEND_URL}/user/role/${uid}`,
    getUserByUid: (uid: Uid) => `${BACKEND_URL}/user/${uid}`,
  },
  mentor: {
    getAll: `${BACKEND_URL}/mentor/all`,
    getByUid: (uid: Uid) => `${BACKEND_URL}/mentor/${uid}`,
  },
  courses: {
    getAll: `${BACKEND_URL}/courses`,
    create: `${BACKEND_URL}/courses`,
    getByUid: (uid: Uid) => `${BACKEND_URL}/courses/${uid}`,
    joinByUid: (uid: Uid) => `${BACKEND_URL}/courses/${uid}/join`,
    createReviewByUid: (uid: Uid) => `${BACKEND_URL}/courses/${uid}/review`,
    replyReviewByUid: (courseUid: Uid, reviewUid: Uid) => `${BACKEND_URL}/courses/${courseUid}/review/${reviewUid}/reply`,
    updateStatusByUid: (uid: Uid) => `${BACKEND_URL}/courses/${uid}/status`,
    assignMentorsByUid: (uid: Uid) => `${BACKEND_URL}/courses/${uid}/mentors/assign`,
    getStudentsByUid: (uid: Uid) => `${BACKEND_URL}/courses/${uid}/students`,
  },
  courseCategories: {
    getAll: `${BACKEND_URL}/course-categories`,
    create: `${BACKEND_URL}/course-categories`,
    getByUid: (uid: Uid) => `${BACKEND_URL}/course-categories/${uid}`,
  },
  courseTypes: {
    getAll: `${BACKEND_URL}/course-types`,
    create: `${BACKEND_URL}/course-types`,
    getByUid: (uid: Uid) => `${BACKEND_URL}/course-types/${uid}`,
  },
  modules: {
    create: `${BACKEND_URL}/modules`,
    getByUid: (uid: Uid) => `${BACKEND_URL}/modules/${uid}`,
    getByCourseUid: (courseUid: Uid) => `${BACKEND_URL}/modules/course/${courseUid}`,
  },
  lessons: {
    getAll: `${BACKEND_URL}/lessons`,
    create: `${BACKEND_URL}/lessons`,
    getByUid: (uid: Uid) => `${BACKEND_URL}/lessons/${uid}`,
    assignment: {
      getByLessonUid: (lessonUid: Uid) => `${BACKEND_URL}/lessons/${lessonUid}/assignment`,
    },
    attendances: {
      create: `${BACKEND_URL}/lessons/attendances`,
      checkStatus: `${BACKEND_URL}/lessons/attendances/check-status`,
      getMyHistory: `${BACKEND_URL}/lessons/attendances/my-history`,
      getByUid: (uid: Uid) => `${BACKEND_URL}/lessons/attendances/${uid}`,
      getByLessonUid: (lessonUid: Uid) => `${BACKEND_URL}/lessons/attendances/lesson/${lessonUid}`,
    },
  },
  invoices: {
    getInvoiceUrl: `${BACKEND_URL}/invoices/url`,
    getByEnrollmentUid: (enrollmentUid: Uid) => `${BACKEND_URL}/invoices/${enrollmentUid}`,
  },
  payment: {
    create: `${BACKEND_URL}/payment/create`,
    getAll: `${BACKEND_URL}/payment`,
    callback: `${BACKEND_URL}/payment/callback`,
  },
  swagger: {
    ui: `${BACKEND_URL}/swagger/index.html`,
  },
}
