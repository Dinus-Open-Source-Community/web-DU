import {
  appPageSubtitleClassName,
  appPageTitleClassName,
} from '@/lib/design/app-shell-tokens'

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <section className={className ?? 'mb-6 space-y-2'}>
      <h1 className={appPageTitleClassName}>{title}</h1>
      {subtitle ? <p className={appPageSubtitleClassName}>{subtitle}</p> : null}
    </section>
  )
}
