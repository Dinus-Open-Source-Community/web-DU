import type { ReactNode } from 'react'

import { AuthBrandMark } from './AuthBrandMark'

type AuthFormPanelProps = {
  children: ReactNode
}

export function AuthFormPanel({ children }: AuthFormPanelProps) {
  return (
    <div className="mx-auto w-full max-w-md xl:max-w-lg">
      <div className="rounded-[10px] border-2 border-border bg-background p-6 shadow-md sm:p-8">
        <AuthBrandMark />
        <div className="flex flex-col gap-7">{children}</div>
      </div>
    </div>
  )
}
