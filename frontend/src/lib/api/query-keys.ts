export const queryKeys = {
  user: {
    all: ['user'] as const,
    self: () => [...queryKeys.user.all, 'self'] as const,
    byUid: (uid: string) => [...queryKeys.user.all, uid] as const,
    managed: (filters?: Record<string, unknown>) => [...queryKeys.user.all, 'managed', filters] as const,
  },

  mentor: {
    all: ['mentor'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.mentor.all, 'list', filters] as const,
    byUid: (uid: string) => [...queryKeys.mentor.all, uid] as const,
  },

  courses: {
    all: ['courses'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.courses.all, 'list', filters] as const,
    byUid: (uid: string) => [...queryKeys.courses.all, uid] as const,
    students: (courseUid: string, filters?: Record<string, unknown>) =>
      [...queryKeys.courses.all, courseUid, 'students', filters] as const,
  },

  courseCategories: {
    all: ['course-categories'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.courseCategories.all, 'list', filters] as const,
    byUid: (uid: string) => [...queryKeys.courseCategories.all, uid] as const,
  },

  courseTypes: {
    all: ['course-types'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.courseTypes.all, 'list', filters] as const,
    byUid: (uid: string) => [...queryKeys.courseTypes.all, uid] as const,
  },

  modules: {
    all: ['modules'] as const,
    byUid: (uid: string) => [...queryKeys.modules.all, uid] as const,
    byCourse: (courseUid: string, filters?: Record<string, unknown>) =>
      [...queryKeys.modules.all, 'course', courseUid, filters] as const,
  },

  lessons: {
    all: ['lessons'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.lessons.all, 'list', filters] as const,
    byUid: (uid: string) => [...queryKeys.lessons.all, uid] as const,
    assignment: (lessonUid: string) => [...queryKeys.lessons.all, lessonUid, 'assignment'] as const,
    attendances: {
      all: ['lesson-attendances'] as const,
      byUid: (uid: string) => ['lesson-attendances', uid] as const,
      byLesson: (lessonUid: string) => ['lesson-attendances', 'lesson', lessonUid] as const,
      checkStatus: (lessonId: string, enrollmentId: string) =>
        ['lesson-attendances', 'check', lessonId, enrollmentId] as const,
      myHistory: (enrollmentId?: string) => ['lesson-attendances', 'my-history', enrollmentId] as const,
    },
  },

  invoices: {
    all: ['invoices'] as const,
    url: (enrollmentId: string, userId: string, courseId: string) =>
      [...queryKeys.invoices.all, 'url', enrollmentId, userId, courseId] as const,
    byEnrollment: (enrollmentUid: string) => [...queryKeys.invoices.all, enrollmentUid] as const,
  },

  payment: {
    all: ['payment'] as const,
    byRef: (reference: string) => [...queryKeys.payment.all, 'ref', reference] as const,
    byEnrollment: (enrollmentId: string) => [...queryKeys.payment.all, 'enrollment', enrollmentId] as const,
  },
} as const
