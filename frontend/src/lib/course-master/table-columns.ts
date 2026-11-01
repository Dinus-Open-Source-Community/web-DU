export type CourseMasterColumnId = 'name' | 'status' | 'courses' | 'updated' | 'actions'
export type CourseMasterColumnAlign = 'left' | 'center' | 'right'

export type CourseMasterColumnSpec = {
  id: CourseMasterColumnId
  header: string
  align?: CourseMasterColumnAlign
}

/**
 * Satu sumber urutan/header/penyelarasan kolom tabel kategori & tipe kursus.
 * Dipakai `CourseMasterManagementPanel` (tabel asli) dan
 * `CourseMasterTableSkeleton` (placeholder loading) agar bentuknya selalu sama.
 */
export const COURSE_MASTER_COLUMN_SPECS: CourseMasterColumnSpec[] = [
  { id: 'name', header: 'Nama' },
  { id: 'status', header: 'Status' },
  { id: 'courses', header: 'Kursus', align: 'center' },
  { id: 'updated', header: 'Diperbarui' },
  { id: 'actions', header: 'Aksi', align: 'right' },
]
