import { StudentSidebarProvider } from '@/components/shared/Sidebar'
import { StudentAssignmentsSection, type StudentAssignmentSectionItem } from '@/components/student/AssignmentSection'

const buildDeadline = (daysFromNow: number, hour = 17) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const assignmentItems: StudentAssignmentSectionItem[] = [
  {
    courseTitle: 'Database Design dan SQL',
    assignment: {
      uid: 'assign-db-001',
      courseId: '05830f78',
      meetingNumber: 1,
      title: 'Rancang ERD Sistem Perpustakaan',
      taskType: 'text',
      description: 'Buat rancangan ERD sederhana dan jelaskan relasi utama antar tabel.',
      deadlineAt: buildDeadline(3),
      status: 'published',
      autoCloseAfterDeadline: true,
      allowResubmit: true,
      maxAttempts: 2,
      submissionConfig: {
        allowFile: true,
        allowPlainText: true,
        allowRichText: true,
        requireFileDescription: false,
      },
    },
    latestSubmission: null,
  },
  {
    courseTitle: 'DevOps Essentials',
    assignment: {
      uid: 'assign-devops-001',
      courseId: '6f43bd95',
      meetingNumber: 2,
      title: 'Setup Pipeline CI/CD Dasar',
      taskType: 'text',
      description: 'Dokumentasikan tahapan pipeline CI/CD untuk aplikasi web sederhana.',
      deadlineAt: buildDeadline(1, 20),
      status: 'published',
      autoCloseAfterDeadline: true,
      allowResubmit: false,
      submissionConfig: {
        allowFile: true,
        allowPlainText: false,
        allowRichText: true,
        requireFileDescription: true,
      },
    },
    latestSubmission: {
      uid: 'sub-devops-001',
      assignmentUid: 'assign-devops-001',
      courseId: '6f43bd95',
      studentUid: '304eca1b',
      studentName: 'Budi Santoso',
      studentAvatar: 'https://via.placeholder.com/150?text=Budi',
      submittedAt: buildDeadline(-1, 12),
      attemptNumber: 1,
      contentBlocks: [{ type: 'text', text: 'Pipeline sudah dibuat dan didokumentasikan.' }],
      reviewStatus: 'pending_review',
      rating: null,
      mentorComment: null,
      reviewedAt: null,
    },
  },
  {
    courseTitle: 'REST API Development',
    assignment: {
      uid: 'assign-api-001',
      courseId: 'eca32b12',
      meetingNumber: 3,
      title: 'Implementasi Endpoint CRUD',
      taskType: 'text',
      description: 'Buat endpoint CRUD untuk resource produk dan sertakan dokumentasi singkat.',
      deadlineAt: buildDeadline(-2),
      status: 'published',
      autoCloseAfterDeadline: true,
      allowResubmit: true,
      maxAttempts: 3,
      submissionConfig: {
        allowFile: true,
        allowPlainText: true,
        allowRichText: true,
        requireFileDescription: false,
      },
    },
    latestSubmission: {
      uid: 'sub-api-001',
      assignmentUid: 'assign-api-001',
      courseId: 'eca32b12',
      studentUid: '304eca1b',
      studentName: 'Budi Santoso',
      studentAvatar: 'https://via.placeholder.com/150?text=Budi',
      submittedAt: buildDeadline(-3, 10),
      attemptNumber: 1,
      contentBlocks: [{ type: 'link', url: 'https://example.com/repo', label: 'Repository' }],
      reviewStatus: 'graded',
      rating: 88,
      mentorComment: 'Struktur endpoint sudah rapi.',
      reviewedAt: buildDeadline(-1, 9),
    },
  },
]

const Assignments = () => {
  return (
    <StudentSidebarProvider>
      <StudentAssignmentsSection items={assignmentItems} />
    </StudentSidebarProvider>
  )
}

export default Assignments
