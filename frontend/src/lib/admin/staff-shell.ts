import type { StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'

/** Chrome UI dashboard admin (underline tabs, label admin, dll.) — admin & mentor. */
export function isAdminStaffRole(role: StaffAssignmentRole) {
  return role === 'admin' || role === 'mentor'
}
