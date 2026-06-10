import { useMemo } from 'react'

import {
  resolveStaffGraderFromDirectory,
  type StaffGraderDirectoryEntry,
} from '@/lib/course-detail/staff-grader-directory'
import {
  presentSubmissionGrader,
  type StaffSubmissionGraderView,
  type StaffSubmissionViewer,
} from '@/lib/course-detail/staff-submission-grader-presenter'

type UseSubmissionGraderProfileOptions = {
  gradedByUid: string | null
  staffViewer: StaffSubmissionViewer | null
  staffDirectory?: StaffGraderDirectoryEntry[]
}

export function useSubmissionGraderProfile({
  gradedByUid,
  staffViewer,
  staffDirectory = [],
}: UseSubmissionGraderProfileOptions): StaffSubmissionGraderView | null {
  return useMemo(() => {
    const resolved = resolveStaffGraderFromDirectory(gradedByUid, staffDirectory)

    return presentSubmissionGrader(
      gradedByUid,
      staffViewer,
      resolved
        ? {
            uid: resolved.uid,
            name: resolved.name,
            avatar_url: resolved.avatar_url,
            role: resolved.role,
          }
        : null,
    )
  }, [gradedByUid, staffDirectory, staffViewer])
}
