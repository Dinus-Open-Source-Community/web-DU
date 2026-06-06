type Uid = string

export interface IQueryParamsPayload {
  page?: number
  per_page?: number
  mentor_id?: string
  title?: string
  price?: string | number
  is_premium?: boolean
  course_category_id?: string
  course_type_id?: string
  class_type_id?: string
  status?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc' | string
  [key: string]: string | number | boolean | undefined
}

const compactCourseQueryParams = (params: IQueryParamsPayload) =>
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value.trim() !== ''))

export const normalizeCourseQueryParams = (params?: IQueryParamsPayload) => {
  if (!params) return {}

  return Object.fromEntries(compactCourseQueryParams(params)) as Partial<IQueryParamsPayload>
}

const withQuery = (path: string, params?: IQueryParamsPayload) => {
  if (!params) return path

  const query = new URLSearchParams(Object.entries(normalizeCourseQueryParams(params)).map(([key, value]) => [key, String(value)]))
  const qs = query.toString()

  return qs ? `${path}?${qs}` : path
}

export const API_ROUTES = {
  auth: {
    login: `/login`,
    register: `/register`,
    oauth: {
      googleLogin: `/oauth/google`,
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
    getAllManagedUsers: (params?: IQueryParamsPayload) => withQuery(`/user/manage/all`, params),
    deleteManagedUserByUid: (uid: Uid) => `/user/manage/${uid}`,
    updateUserRoleByUid: (uid: Uid) => `/user/role/${uid}`,
    getUserByUid: (uid: Uid) => `/user/${uid}`,
  },
  mentor: {
    getAll: (params?: IQueryParamsPayload) => withQuery(`/mentor/all`, params),
    getByUid: (uid: Uid) => `/mentor/${uid}`,
  },
  courses: {
    getAll: (params?: IQueryParamsPayload) => withQuery(`/courses`, params),
    create: `/courses`,
    updateByUid: (uid: Uid) => `/courses/${uid}`,
    getByUid: (uid: Uid) => `/courses/${uid}`,
    joinByUid: (uid: Uid) => `/courses/${uid}/join`,
    getMentorByUid: (uid: Uid) => `/courses/${uid}/mentor`,
    createReviewByUid: (uid: Uid) => `/courses/${uid}/review`,
    replyReviewByUid: (courseUid: Uid, reviewUid: Uid) => `/courses/${courseUid}/review/${reviewUid}/reply`,
    updateStatusByUid: (uid: Uid) => `/courses/${uid}/status`,
    assignMentorsByUid: (uid: Uid) => `/courses/${uid}/mentors/assign`,
    getProgressByUid: (uid: Uid) => `/courses/${uid}/progress`,
    getStudentsByUid: (uid: Uid, params?: IQueryParamsPayload) => withQuery(`/courses/${uid}/students`, params),
  },
  courseCategories: {
    getAll: (params?: IQueryParamsPayload) => withQuery(`/course-categories`, params),
    create: `/course-categories`,
    getByUid: (uid: Uid) => `/course-categories/${uid}`,
    updateByUid: (uid: Uid) => `/course-categories/${uid}`,
    deleteByUid: (uid: Uid) => `/course-categories/${uid}`,
  },
  courseTypes: {
    getAll: (params?: IQueryParamsPayload) => withQuery(`/course-types`, params),
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
    getByCourseUid: (courseUid: Uid, params?: IQueryParamsPayload) => withQuery(`/modules/course/${courseUid}`, params),
  },
  lessons: {
    getAll: (params?: IQueryParamsPayload) => withQuery(`/lessons`, params),
    create: `/lessons`,
    getByUid: (uid: Uid) => `/lessons/${uid}`,
    updateByUid: (uid: Uid) => `/lessons/${uid}`,
    deleteByUid: (uid: Uid) => `/lessons/${uid}`,
    read: {
      getStatusByLessonUid: (lessonUid: Uid, params?: IQueryParamsPayload) => withQuery(`/lessons/${lessonUid}/read`, params),
      markByLessonUid: (lessonUid: Uid) => `/lessons/${lessonUid}/read`,
    },
    readings: {
      getByLessonUid: (lessonUid: Uid) => `/lessons/readings/lesson/${lessonUid}`,
      getMyHistory: (params?: IQueryParamsPayload) => withQuery(`/lessons/readings/my-history`, params),
    },
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
        getAllByLessonUid: (lessonUid: Uid, params?: IQueryParamsPayload) => withQuery(`/lessons/${lessonUid}/assignment/submissions`, params),
        getByUid: (lessonUid: Uid, submissionUid: Uid) => `/lessons/${lessonUid}/assignment/submissions/${submissionUid}`,
        gradeByUid: (lessonUid: Uid, submissionUid: Uid) => `/lessons/${lessonUid}/assignment/submissions/${submissionUid}/grade`,
      },
    },
    attendances: {
      create: `/lessons/attendances`,
      checkStatus: (params?: IQueryParamsPayload) => withQuery(`/lessons/attendances/check-status`, params),
      getMyHistory: (params?: IQueryParamsPayload) => withQuery(`/lessons/attendances/my-history`, params),
      getByUid: (uid: Uid) => `/lessons/attendances/${uid}`,
      updateByUid: (uid: Uid) => `/lessons/attendances/${uid}`,
      deleteByUid: (uid: Uid) => `/lessons/attendances/${uid}`,
      getByLessonUid: (lessonUid: Uid, params?: IQueryParamsPayload) => withQuery(`/lessons/attendances/lesson/${lessonUid}`, params),
    },
  },
  invoices: {
    getInvoiceUrl: (params?: IQueryParamsPayload) => withQuery(`/invoices/url`, params),
    getByEnrollmentUid: (enrollmentUid: Uid) => `/invoices/${enrollmentUid}`,
  },
  payment: {
    create: `/payment/create`,
    getAll: (params?: IQueryParamsPayload) => withQuery(`/payment`, params),
    method: `/payment/method`,
    tripay: (params?: IQueryParamsPayload) => withQuery(`/payment/tripay`, params),
  },
  swagger: {
    ui: `/swagger/index.html`,
  },
}
