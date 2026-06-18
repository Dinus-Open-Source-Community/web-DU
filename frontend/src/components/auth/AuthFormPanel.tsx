import type { ReactNode } from 'react'

import { AuthBrandMark } from './AuthBrandMark'

type AuthFormPanelProps = {
  children: ReactNode
}

export function AuthFormPanel({ children }: AuthFormPanelProps) {
  return (
    <div className="mx-auto w-full max-w-md xl:max-w-lg">
      <div className="rounded-[24px] border border-border/70 bg-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <AuthBrandMark />
        <div className="flex flex-col gap-7">{children}</div>
      </div>
    </div>
  )
}
