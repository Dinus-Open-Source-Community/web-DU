import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type RollingDigitProps = {
  digit: string
  className?: string
}

const rollDurationMs = 320

export function RollingDigit({ digit, className }: RollingDigitProps) {
  const prevRef = useRef(digit)
  const [stack, setStack] = useState<string[]>([digit])
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (digit === prevRef.current) return

    setStack([prevRef.current, digit])
    setOffset(0)

    const frame = window.requestAnimationFrame(() => setOffset(1))
    const timer = window.setTimeout(() => {
      prevRef.current = digit
      setStack([digit])
      setOffset(0)
    }, rollDurationMs)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [digit])

  return (
    <span
      className={cn(
        'relative inline-flex h-[1.15em] w-[0.62em] overflow-hidden align-middle tabular-nums',
        className,
      )}
      aria-hidden
    >
      <span
        className={cn(
          'flex w-full flex-col motion-reduce:transition-none',
          offset === 1 && 'transition-transform duration-320 ease-in-out',
        )}
        style={{ transform: `translateY(-${offset * 100}%)` }}
      >
        {stack.map((value, index) => (
          <span
            key={`${index}-${value}`}
            className="flex h-[1.15em] w-full items-center justify-center leading-none"
          >
            {value}
          </span>
        ))}
      </span>
    </span>
  )
}

type RollingNumberProps = {
  value: number
  pad?: number
  className?: string
}

export function RollingNumber({ value, pad = 2, className }: RollingNumberProps) {
  const digits = String(Math.max(0, value)).padStart(pad, '0').split('')

  return (
    <span className={cn('inline-flex items-center', className)} aria-hidden>
      {digits.map((digit, index) => (
        <RollingDigit key={`${pad}-${index}`} digit={digit} />
      ))}
    </span>
  )
}
