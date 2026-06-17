export interface RouteChildItem {
  name: string
  path: string
}

export interface RouteItem {
  name: string
  path?: string
  children?: RouteChildItem[]
}

export const ROUTES = {
  home: '/',
  profile: '/profile',
  courses: '/course',
  checkout: (courseUid: string) => `/checkout/${courseUid}`,
  courseDetail: (courseUid: string) => `/course/${courseUid}`,
  viewModuleAndLessons: (courseUid: string) => `/course/${courseUid}/view`,
  login: '/auth/login',
  register: '/auth/register',
  oauthCallback: '/auth/oauth/callback',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  admin: {
    dashboard: '/admin/dashboard',
    users: {
      students: '/admin/users/students',
      studentDetail: (userUid: string) => `/admin/users/students/${userUid}`,
      mentors: '/admin/users/mentors',
      mentorDetail: (userUid: string) => `/admin/users/mentors/${userUid}`,
      administrators: '/admin/users/administrators',
      administratorDetail: (userUid: string) => `/admin/users/administrators/${userUid}`,
    },
    courses: '/admin/courses',
    courseCategories: '/admin/course-categories',
    courseTypes: '/admin/course-types',
    detailCourseAdmin: (courseId: string) => `/admin/courses/${courseId}`,
    assignmentSubmissions: (courseUid: string, lessonUid: string) =>
      `/admin/courses/${courseUid}/assignments/${lessonUid}`,
    assignmentSubmissionDetail: (
      courseUid: string,
      lessonUid: string,
      submissionUid: string,
    ) => `/admin/courses/${courseUid}/assignments/${lessonUid}/submissions/${submissionUid}`,
    courseEditAdmin: (courseId: string) => `/admin/courses/${courseId}/edit`,
    transactions: '/admin/transactions',
    financial: '/admin/financial',
    /** Pathname untuk <Route>; query `courseUid` opsional di-set lewat navigasi/link. */
    reviewsAndQaPath: '/admin/reviews-and-qa',
    reviewsAndQa: (courseUid?: string) => `${'/admin/reviews-and-qa'}${courseUid ? `?courseUid=${encodeURIComponent(courseUid)}` : ''}`,
  },
  mentor: {
    dashboard: '/mentor/dashboard',
    courses: '/mentor/courses',
    detailCourseMentor: (courseId: string) => `/mentor/courses/${courseId}`,
    assignmentSubmissions: (courseUid: string, lessonUid: string) =>
      `/mentor/courses/${courseUid}/assignments/${lessonUid}`,
    assignmentSubmissionDetail: (
      courseUid: string,
      lessonUid: string,
      submissionUid: string,
    ) => `/mentor/courses/${courseUid}/assignments/${lessonUid}/submissions/${submissionUid}`,
    courseEditMentor: (courseId: string) => `/mentor/courses/${courseId}/edit`,
    assignments: (courseId: string) => `/mentor/courses/${courseId}/assignments`,
  },
  student: {
    dashboard: '/student/dashboard',
    learning: '/student/learning',
    learningCourse: (courseUid: string) => `/student/learning/course/${courseUid}`,
    assignments: '/student/assignments',
    browse: '/student/browse',
    certificates: '/student/certificates',
    transactions: '/student/transactions',
    transactionPaymentPath: '/student/transactions/payment',
    transactionPayment: (query: { reference?: string; merchantRef?: string }) => {
      const params = new URLSearchParams()
      if (query.reference) params.set('reference', query.reference)
      if (query.merchantRef) params.set('merchant_ref', query.merchantRef)
      const queryString = params.toString()
      return queryString
        ? `${ROUTES.student.transactionPaymentPath}?${queryString}`
        : ROUTES.student.transactionPaymentPath
    },
  },
} as const

export const routeGroups: Record<string, RouteItem[]> = {
  Admin: [
    { name: 'Dashboard', path: ROUTES.admin.dashboard },
    {
      name: 'Users Management',
      children: [
        { name: 'Students', path: ROUTES.admin.users.students },
        { name: 'Mentors', path: ROUTES.admin.users.mentors },
        { name: 'Administrators', path: ROUTES.admin.users.administrators },
      ],
    },
    {
      name: 'Course Catalog',
      children: [
        { name: 'All Courses', path: ROUTES.admin.courses },
        { name: 'Categories', path: ROUTES.admin.courseCategories },
        { name: 'Course Types', path: ROUTES.admin.courseTypes },
      ],
    },
    {
      name: 'Transactions',
      path: ROUTES.admin.transactions,
    },
    {
      name: 'Reviews & Q&A',
      path: ROUTES.admin.reviewsAndQaPath,
    },
    {
      name: 'Financial Reports',
      path: ROUTES.admin.financial,
    },
  ],
  Mentor: [
    { name: 'Dashboard', path: ROUTES.mentor.dashboard },
    {
      name: 'Courses',
      path: ROUTES.mentor.courses,
    },
  ],
  Student: [
    { name: 'Dashboard', path: ROUTES.student.dashboard },
    {
      name: 'My Learning',
      children: [
        { name: 'Course', path: ROUTES.student.learning },
        { name: 'Assignment', path: ROUTES.student.assignments },
      ],
    },
    { name: 'Browse Courses', path: ROUTES.student.browse },
    { name: 'Certificates', path: ROUTES.student.certificates },
    { name: 'Transactions', path: ROUTES.student.transactions },
  ],
}
