import { Link } from 'react-router-dom'

type RoutePageProps = {
  title: string
  description: string
  path: string
  badge?: string
  ctaLabel?: string
  ctaTo?: string
}

export default function RoutePage({ title, description, path, badge, ctaLabel, ctaTo }: RoutePageProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">{badge ?? 'React Router setup'}</p>
        <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current path</p>
          <p className="mt-2 break-all text-lg font-medium text-slate-900">{path}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reusable routes</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Semua route mengambil nilai dari <span className="font-medium text-slate-900">src/lib/routes.ts</span> supaya endpoint lebih mudah diubah.
          </p>
        </article>
      </div>

      {ctaLabel && ctaTo ? (
        <div>
          <Link to={ctaTo} className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </section>
  )
}
