import { useEffect, useMemo, useState } from 'react'

type PaymentDeadlineParts = {
  hours: number
  minutes: number
  seconds: number
  remainingMs: number
  isExpired: boolean
}

function getDeadlineParts(deadlineMs: number | null, now: number): PaymentDeadlineParts {
  if (deadlineMs == null) {
    return { hours: 0, minutes: 0, seconds: 0, remainingMs: 0, isExpired: true }
  }

  const remainingMs = Math.max(0, deadlineMs - now)
  const isExpired = now >= deadlineMs
  const totalSeconds = Math.floor(remainingMs / 1000)

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    remainingMs,
    isExpired,
  }
}

export function usePaymentDeadlineCountdown(expiredAt: string | null) {
  const deadlineMs = useMemo(() => {
    if (!expiredAt) return null
    const parsed = new Date(expiredAt).getTime()
    return Number.isNaN(parsed) ? null : parsed
  }, [expiredAt])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!deadlineMs) return undefined

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [deadlineMs])

  return getDeadlineParts(deadlineMs, now)
}
