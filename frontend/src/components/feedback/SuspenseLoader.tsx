'use client'

import { Suspense } from 'react'
import { DuLoader } from './DuLoader'

type SuspenseLoaderProps = {
  children: React.ReactNode
  label?: string
  className?: string
}

export function SuspenseLoader({ children, label = 'Memuat data', className }: SuspenseLoaderProps) {
  return (
    <Suspense
      fallback={
        <div className={className ?? 'flex min-h-48 items-center justify-center'}>
          <DuLoader size={40} label={label} />
        </div>
      }>
      {children}
    </Suspense>
  )
}
