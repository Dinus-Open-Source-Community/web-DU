interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
      {subtitle && (
        <p className="max-w-3xl text-sm font-medium leading-6 text-slate-500 md:text-base">{subtitle}</p>
      )}
    </div>
  )
}
