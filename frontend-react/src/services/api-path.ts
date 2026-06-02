type Uid = string

export const API_ROUTES = {
  auth: {
    login: `/login`,
    register: `/register`,
    oauth: {
      googleLogin: `/oauth/google/login`,
      googleCallback: `/oauth/google/callback`,
    },
  },
  avatar: {
    upload: `/avatar`,
  },
  files: {
    getByBucketAndObject: (bucket: string, object: string) => `/files/${bucket}/${object}`,
  },
  user: {
    updateProfile: `/user/profile`,
    changePassword: `/user/password`,
    getSelfData: `/user/data`,
    getAllManagedUsers: `/user/manage/all`,
    deleteManagedUserByUid: (uid: Uid) => `/user/manage/${uid}`,
    updateUserRoleByUid: (uid: Uid) => `/user/role/${uid}`,
    getUserByUid: (uid: Uid) => `/user/${uid}`,
  },
  mentor: {
    getAll: `/mentor/all`,
    getByUid: (uid: Uid) => `/mentor/${uid}`,
  },
  courses: {
    getAll: `/courses`,
    create: `/courses`,
    getByUid: (uid: Uid) => `/courses/${uid}`,
    joinByUid: (uid: Uid) => `/courses/${uid}/join`,
    getMentorByUid: (uid: Uid) => `/courses/${uid}/mentor`,
    createReviewByUid: (uid: Uid) => `/courses/${uid}/review`,
    replyReviewByUid: (courseUid: Uid, reviewUid: Uid) => `/courses/${courseUid}/review/${reviewUid}/reply`,
    updateStatusByUid: (uid: Uid) => `/courses/${uid}/status`,
    assignMentorsByUid: (uid: Uid) => `/courses/${uid}/mentors/assign`,
    getStudentsByUid: (uid: Uid) => `/courses/${uid}/students`,
  },
  courseCategories: {
    getAll: `/course-categories`,
    create: `/course-categories`,
    getByUid: (uid: Uid) => `/course-categories/${uid}`,
    updateByUid: (uid: Uid) => `/course-categories/${uid}`,
    deleteByUid: (uid: Uid) => `/course-categories/${uid}`,
  },
  courseTypes: {
    getAll: `/course-types`,
    create: `/course-types`,
    getByUid: (uid: Uid) => `/course-types/${uid}`,
    updateByUid: (uid: Uid) => `/course-types/${uid}`,
    deleteByUid: (uid: Uid) => `/course-types/${uid}`,
  },
  modules: {
    create: `/modules`,
    getByUid: (uid: Uid) => `/modules/${uid}`,
    updateByUid: (uid: Uid) => `/modules/${uid}`,
    deleteByUid: (uid: Uid) => `/modules/${uid}`,
    getByCourseUid: (courseUid: Uid) => `/modules/course/${courseUid}`,
  },
  lessons: {
    getAll: `/lessons`,
    create: `/lessons`,
    getByUid: (uid: Uid) => `/lessons/${uid}`,
    updateByUid: (uid: Uid) => `/lessons/${uid}`,
    deleteByUid: (uid: Uid) => `/lessons/${uid}`,
    assignment: {
      getByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/assignment`,
      createByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/assignment`,
      updateByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/assignment`,
      deleteByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/assignment`,
      submission: {
        getByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/assignment/submission`,
        createByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/assignment/submission`,
        updateByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/assignment/submission`,
      },
      submissions: {
        getAllByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/assignment/submissions`,
        getByUid: (lessonUid: Uid, submissionUid: Uid) => `/lessons/${lessonUid}/assignment/submissions/${submissionUid}`,
        gradeByUid: (lessonUid: Uid, submissionUid: Uid) => `/lessons/${lessonUid}/assignment/submissions/${submissionUid}/grade`,
      },
    },
    attendances: {
      create: `/lessons/attendances`,
      checkStatus: `/lessons/attendances/check-status`,
      getMyHistory: `/lessons/attendances/my-history`,
      getByUid: (uid: Uid) => `/lessons/attendances/${uid}`,
      updateByUid: (uid: Uid) => `/lessons/attendances/${uid}`,
      deleteByUid: (uid: Uid) => `/lessons/attendances/${uid}`,
      getByLessonUid: (lessonUid: Uid) => `/lessons/attendances/lesson/${lessonUid}`,
    },
  },
  invoices: {
    getInvoiceUrl: `/invoices/url`,
    getByEnrollmentUid: (enrollmentUid: Uid) => `/invoices/${enrollmentUid}`,
  },
  payment: {
    create: `/payment/create`,
    getAll: `/payment`,
    tripay: `/payment/tripay`,
  },
  swagger: {
    ui: `/swagger/index.html`,
  },
}
