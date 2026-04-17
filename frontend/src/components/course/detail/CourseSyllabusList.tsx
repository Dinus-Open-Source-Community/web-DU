import { BookOpen } from 'lucide-react'

export interface SyllabusSection {
  title: string
  lessonsCount: number
  durationLabel?: string
}

interface CourseSyllabusListProps {
  title?: string
  sections: SyllabusSection[]
}

export function CourseSyllabusList({ title = 'Course Syllabus', sections }: CourseSyllabusListProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <ul className="divide-y divide-slate-100">
        {sections.map((section, index) => (
          <li
            key={`${section.title}-${index}`}
            className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">
                  Section {index + 1}: {section.title}
                </span>
                {section.durationLabel && (
                  <span className="text-xs text-slate-400">{section.durationLabel}</span>
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {section.lessonsCount} lessons
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
