import { CheckCircle2 } from 'lucide-react'

interface CourseWhatYouLearnProps {
  title?: string
  items: string[]
}

export function CourseWhatYouLearn({
  title = "What you'll learn",
  items,
}: CourseWhatYouLearnProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
