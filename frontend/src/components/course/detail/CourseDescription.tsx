import type { ReactNode } from 'react'

interface CourseDescriptionProps {
  title?: string
  children: ReactNode
}

export function CourseDescription({ title = 'Course Description', children }: CourseDescriptionProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">{children}</div>
    </section>
  )
}
