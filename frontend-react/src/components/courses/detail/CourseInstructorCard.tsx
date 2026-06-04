interface CourseInstructorCardProps {
  name: string
  role: string
  avatar?: string
}

export function CourseInstructorCard({ name, role, avatar }: CourseInstructorCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Your Instructor</h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-20 sm:w-20">
          {avatar ? (
            <img src={avatar} alt={name} loading="lazy" className="object-cover" sizes="80px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-400">
              {name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold text-slate-900">{name}</h3>
            <p className="text-sm text-slate-500">{role}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
