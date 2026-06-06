import type { CourseMasterFormValues } from './types'

export function validateCourseMasterForm(values: CourseMasterFormValues): string | null {
  if (!values.name.trim()) {
    return 'Nama wajib diisi.'
  }

  if (values.name.trim().length > 120) {
    return 'Nama maksimal 120 karakter.'
  }

  return null
}
