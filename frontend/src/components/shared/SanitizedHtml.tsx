import { sanitizeInlineHtml, sanitizeRichHtml } from '@/lib/security/sanitize-html'
import { cn } from '@/lib/utils'

type SanitizedHtmlProps = {
  html: string
  className?: string
  variant?: 'rich' | 'inline'
}

export function SanitizedHtml({ html, className, variant = 'rich' }: SanitizedHtmlProps) {
  const clean = variant === 'inline' ? sanitizeInlineHtml(html) : sanitizeRichHtml(html)

  return (
    <div
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
