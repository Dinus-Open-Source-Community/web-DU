import { useEffect, useMemo, useState } from 'react'

import { formatAssignmentDeadlineRemaining } from '@/lib/lesson-assignment/deadline-format'

export function useAssignmentDeadlineTimer(deadlineAt?: string | null) {
  const deadlineMs = useMemo(() => {
    if (!deadlineAt) return null
    const parsed = new Date(deadlineAt).getTime()
    return Number.isNaN(parsed) ? null : parsed
  }, [deadlineAt])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!deadlineMs) return undefined

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [deadlineMs])

  const remainingMs = deadlineMs == null ? null : Math.max(0, deadlineMs - now)
  const isExpired = deadlineMs != null && now > deadlineMs

  return {
    remainingLabel: remainingMs == null ? null : formatAssignmentDeadlineRemaining(remainingMs),
    isExpired,
    remainingMs,
  }
}
