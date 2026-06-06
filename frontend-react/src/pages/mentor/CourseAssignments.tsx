import { MentorCourseAssignmentsClient } from '@/components/shared/Assignments'
import type { ICourseDetailItem } from '@/lib/types/course'
import type { IMentorAssignmentSubmission, IMentorCourseAssignment } from '@/lib/types/course'
import { useParams } from 'react-router-dom'

export default function MentorCourseAssignmentsPage() {
  const { courseUid } = useParams()
  console.log('Course UID:', courseUid)
  const assignmentData: IMentorCourseAssignment[] = [
    {
      uid: 'assign-001',
      courseId: '6f43bd95',
      meetingNumber: 1,
      title: 'Setup Docker Environment',
      description: 'Instal Docker & jalankan container pertama.',
      deadlineAt: '2026-05-20T23:59:59.000Z',
      status: 'closed',
      autoCloseAfterDeadline: true,
      allowResubmit: false,
      instructionAttachments: [
        {
          fileName: 'panduan-docker.pdf',
          url: 'https://example.com/files/panduan-docker.pdf',
          mime: 'application/pdf',
        },
      ],
    },
    {
      uid: 'assign-002',
      courseId: '6f43bd95',
      meetingNumber: 2,
      title: 'Membuat Dockerfile',
      description: 'Buat Dockerfile untuk aplikasi sederhana.',
      deadlineAt: '2026-05-24T23:59:59.000Z',
      status: 'draft',
      autoCloseAfterDeadline: true,
      allowResubmit: true,
      maxAttempts: 3,
    },
    {
      uid: 'assign-003',
      courseId: '6f43bd95',
      meetingNumber: 3,
      title: 'Pipeline CI/CD Dasar',
      description: 'Konfigurasi pipeline sederhana untuk build & test.',
      deadlineAt: '2026-05-28T23:59:59.000Z',
      status: 'published',
      autoCloseAfterDeadline: false,
      allowResubmit: true,
      maxAttempts: 5,
      instructionAttachments: [
        {
          fileName: 'contoh-pipeline.yml',
          url: 'https://example.com/files/contoh-pipeline.yml',
          mime: 'text/yaml',
        },
      ],
    },
  ]

  const courseData: ICourseDetailItem = {
    category: {
      created_at: '2026-05-12T19:06:39.048745Z',
      description: 'Kategori untuk course pengembangan web',
      is_active: true,
      name: 'Web Development',
      uid: '83676583',
      updated_at: '2026-05-12T19:06:39.048745Z',
    },
    course_type: {
      created_at: '2026-05-12T19:06:39.056161Z',
      description: 'Kelas intensif dengan project',
      is_active: true,
      name: 'Bootcamp',
      uid: '949923d1',
      updated_at: '2026-05-12T19:06:39.056161Z',
    },
    cover_url: 'https://via.placeholder.com/400x300?text=DevOps',
    created_at: '2026-05-12T19:06:39.074659Z',
    description: 'Pelajari deployment, Docker, dan CI/CD pipeline untuk production',
    event_uid: null,
    is_premium: true,
    is_published: true,
    level: 'LANJUTAN',
    mentors: [
      {
        avatar_url: 'https://via.placeholder.com/150?text=Dimas',
        created_at: '2026-05-12T19:06:38.996285Z',
        description: 'Mentor DevOps dan cloud deployment',
        email: 'dimas.mentor@doscom.id',
        is_verified: true,
        name: 'Dimas Saputra',
        role: 'mentor',
        uid: '2f49d823',
        updated_at: '2026-05-12T19:36:49.442267Z',
      },
    ],
    modules: [
      {
        course_uid: '6f43bd95',
        created_at: '2026-05-12T19:06:39.108838Z',
        lessons: [
          {
            created_at: '2026-05-12T19:06:39.200634Z',
            module_uid: '38ae27a2',
            order_index: 1,
            title: 'Pengenalan Docker',
            uid: 'd23601da',
            updated_at: '2026-05-12T19:06:39.200634Z',
          },
          {
            created_at: '2026-05-12T19:06:39.203752Z',
            module_uid: '38ae27a2',
            order_index: 2,
            title: 'Membuat Dockerfile',
            uid: '8ca72ea1',
            updated_at: '2026-05-12T19:06:39.203752Z',
          },
          {
            created_at: '2026-05-12T19:06:39.207852Z',
            module_uid: '38ae27a2',
            order_index: 3,
            title: 'Docker Compose Dasar',
            uid: '6ed755d4',
            updated_at: '2026-05-12T19:06:39.207852Z',
          },
        ],
        order_index: 1,
        title: 'Docker Fundamentals',
        uid: '38ae27a2',
      },
      {
        course_uid: '6f43bd95',
        created_at: '2026-05-12T19:06:39.111355Z',
        lessons: [
          {
            created_at: '2026-05-12T19:06:39.211129Z',
            module_uid: '129f691c',
            order_index: 1,
            title: 'Konsep CI/CD',
            uid: 'ca91192d',
            updated_at: '2026-05-12T19:06:39.211129Z',
          },
          {
            created_at: '2026-05-12T19:06:39.213454Z',
            module_uid: '129f691c',
            order_index: 2,
            title: 'Setup Pipeline Otomatis',
            uid: 'ae1fdd9b',
            updated_at: '2026-05-12T19:06:39.213454Z',
          },
        ],
        order_index: 2,
        title: 'CI/CD Pipeline',
        uid: '129f691c',
      },
      {
        course_uid: '6f43bd95',
        created_at: '2026-05-12T19:06:39.113729Z',
        lessons: [
          {
            created_at: '2026-05-12T19:06:39.215637Z',
            module_uid: 'a7759a81',
            order_index: 1,
            title: 'Arsitektur Kubernetes',
            uid: 'f41d335b',
            updated_at: '2026-05-12T19:06:39.215637Z',
          },
          {
            created_at: '2026-05-12T19:06:39.218225Z',
            module_uid: 'a7759a81',
            order_index: 2,
            title: 'Deploy Aplikasi ke Cluster',
            uid: '6720d9bb',
            updated_at: '2026-05-12T19:06:39.218225Z',
          },
        ],
        order_index: 3,
        title: 'Kubernetes Basics',
        uid: 'a7759a81',
      },
    ],
    price: 329000,
    price_strike: 429000,
    slot: 20,
    slug: 'devops-essentials',
    status: 'DRAFT',
    subtitle: 'Deploy aplikasi dengan pipeline modern',
    thumbnail_url: 'https://via.placeholder.com/400x300?text=DevOps',
    title: 'DevOps Essentials',
    uid: '6f43bd95',
    updated_at: '2026-05-12T19:06:39.074659Z',
    what_you_learn: ['Pengenalan konsep utama', 'Studi kasus dunia nyata'],
  }

  const submissionData: IMentorAssignmentSubmission[] = [
    {
      uid: 'sub-001',
      assignmentUid: 'assign-001',
      courseId: '6f43bd95',
      studentUid: 'stu-001',
      studentName: 'Raka Pratama',
      studentAvatar: 'https://via.placeholder.com/150?text=Raka',
      submittedAt: '2026-05-18T10:15:00.000Z',
      attemptNumber: 1,
      contentBlocks: [
        {
          type: 'text',
          text: 'Saya sudah install Docker dan menjalankan container hello-world.',
        },
        {
          type: 'file',
          fileName: 'screenshot-docker.png',
          url: 'https://example.com/files/screenshot-docker.png',
          mime: 'image/png',
        },
      ],
      reviewStatus: 'graded',
      rating: 4,
      mentorComment: 'Bagus, pastikan juga memahami perintah dasar Docker.',
      reviewedAt: '2026-05-19T08:30:00.000Z',
    },
    {
      uid: 'sub-002',
      assignmentUid: 'assign-002',
      courseId: '6f43bd95',
      studentUid: 'stu-002',
      studentName: 'Nadia Putri',
      studentAvatar: 'https://via.placeholder.com/150?text=Nadia',
      submittedAt: '2026-05-22T14:40:00.000Z',
      attemptNumber: 2,
      contentBlocks: [
        {
          type: 'text',
          text: 'Dockerfile sudah dibuat untuk aplikasi Node.js sederhana.',
        },
        {
          type: 'file',
          fileName: 'Dockerfile',
          url: 'https://example.com/files/Dockerfile',
          mime: 'text/plain',
        },
      ],
      reviewStatus: 'pending_review',
      rating: null,
      mentorComment: null,
      reviewedAt: null,
    },
    {
      uid: 'sub-003',
      assignmentUid: 'assign-003',
      courseId: '6f43bd95',
      studentUid: 'stu-003',
      studentName: 'Bima Ananda',
      studentAvatar: 'https://via.placeholder.com/150?text=Bima',
      submittedAt: '2026-05-26T09:05:00.000Z',
      attemptNumber: 1,
      contentBlocks: [
        {
          type: 'text',
          text: 'Pipeline sudah bisa build & test dengan GitHub Actions.',
        },
        {
          type: 'file',
          fileName: 'ci.yml',
          url: 'https://example.com/files/ci.yml',
          mime: 'text/yaml',
        },
      ],
      reviewStatus: 'graded',
      rating: 3,
      mentorComment: 'Tambahkan cache untuk dependency agar build lebih cepat.',
      reviewedAt: '2026-05-27T11:20:00.000Z',
    },
  ]

  return <MentorCourseAssignmentsClient courseData={courseData} assignmentData={assignmentData} submissionData={submissionData} />
}
