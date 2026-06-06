import type { ICategoryItem, ICourseTypeItem } from '@/lib/types/course'

export type CourseMasterKind = 'category' | 'type'

export type CourseMasterItem = ICategoryItem | ICourseTypeItem

export type CourseMasterFormMode = 'create' | 'edit'

export type CourseMasterFormValues = {
  name: string
  description: string
  isActive: boolean
}

export const EMPTY_COURSE_MASTER_FORM: CourseMasterFormValues = {
  name: '',
  description: '',
  isActive: true,
}

/** Payload POST /course-categories & POST /course-types */
export type CreateCourseMasterPayload = {
  name: string
  description?: string
  is_active?: boolean
}

/** Payload PUT /course-categories/:id & PUT /course-types/:id */
export type UpdateCourseMasterPayload = {
  name?: string
  description?: string
  is_active?: boolean
}

export type CourseMasterLabels = {
  singular: string
  plural: string
  pageTitle: string
  pageSubtitle: string
  createButton: string
  createDialogTitle: string
  editDialogTitle: string
  dialogDescription: string
  emptyTitle: string
  emptyDescription: string
  deleteTitle: string
  deleteDescription: (name: string) => string
}

export const COURSE_MASTER_LABELS: Record<CourseMasterKind, CourseMasterLabels> = {
  category: {
    singular: 'Kategori',
    plural: 'Kategori Kursus',
    pageTitle: 'Kategori Kursus',
    pageSubtitle: 'Kelola kategori untuk mengelompokkan kursus di katalog dan filter pencarian.',
    createButton: 'Tambah Kategori',
    createDialogTitle: 'Tambah Kategori Baru',
    editDialogTitle: 'Edit Kategori',
    dialogDescription: 'Nama kategori dipakai di form kursus dan filter browse. Deskripsi opsional untuk konteks internal.',
    emptyTitle: 'Belum ada kategori',
    emptyDescription: 'Buat kategori pertama agar kursus bisa dikelompokkan dengan rapi.',
    deleteTitle: 'Hapus kategori?',
    deleteDescription: (name) =>
      `Kategori "${name}" akan dihapus permanen. Pastikan tidak ada kursus yang masih memakai kategori ini.`,
  },
  type: {
    singular: 'Tipe',
    plural: 'Tipe Kursus',
    pageTitle: 'Tipe Kursus',
    pageSubtitle: 'Kelola tipe kursus seperti bootcamp, workshop, atau kelas reguler untuk form pembuatan kursus.',
    createButton: 'Tambah Tipe',
    createDialogTitle: 'Tambah Tipe Baru',
    editDialogTitle: 'Edit Tipe',
    dialogDescription: 'Tipe kursus membantu membedakan format belajar. Aktifkan hanya tipe yang siap dipilih mentor.',
    emptyTitle: 'Belum ada tipe kursus',
    emptyDescription: 'Buat tipe pertama agar mentor bisa memilih format kursus saat membuat kursus baru.',
    deleteTitle: 'Hapus tipe kursus?',
    deleteDescription: (name) =>
      `Tipe "${name}" akan dihapus permanen. Pastikan tidak ada kursus yang masih memakai tipe ini.`,
  },
}
