'use client'

import { useMemo } from 'react'
import hljs from 'highlight.js/lib/common'
import { Check, Copy, TriangleAlert } from 'lucide-react'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import {
  getCodeLanguageLabel,
  isPlainTextLanguage,
  normalizeCodeLanguage,
} from '@/lib/tiptap-code-languages'
import { cn } from '@/lib/utils'

type ReadOnlyCodeBlockProps = {
  code: string
  language?: string | null
  title?: string | null
  className?: string
}

const COPY_KEY = 'code-block'

export function ReadOnlyCodeBlock({
  code,
  language,
  title,
  className,
}: ReadOnlyCodeBlockProps) {
  const normalizedLanguage = normalizeCodeLanguage(language)
  const languageLabel = getCodeLanguageLabel(normalizedLanguage)
  const plainText = isPlainTextLanguage(normalizedLanguage)
  const lines = useMemo(() => code.split('\n'), [code])
  const highlighted = useMemo(() => {
    if (plainText || !hljs.getLanguage(normalizedLanguage)) return null
    try {
      return hljs.highlight(code, {
        language: normalizedLanguage,
        ignoreIllegals: true,
      }).value
    } catch {
      return null
    }
  }, [code, normalizedLanguage, plainText])
  const { copiedKey, failedKey, copy } = useCopyToClipboard()
  const copied = copiedKey === COPY_KEY
  const failed = failedKey === COPY_KEY
  const trimmedTitle = title?.trim()

  return (
    <div className={cn('code-block code-block--readonly', className)}>
      <div className="code-block__header">
        <div className="code-block__heading">
          {trimmedTitle ? <p className="code-block__title">{trimmedTitle}</p> : null}
          <span className="code-block__language">{languageLabel}</span>
        </div>
        <button
          type="button"
          className="code-block__copy"
          aria-label={copied ? 'Tersalin' : failed ? 'Gagal menyalin' : 'Salin kode'}
          onClick={() => void copy(COPY_KEY, code)}
        >
          {copied ? (
            <Check className="size-4" aria-hidden />
          ) : failed ? (
            <TriangleAlert className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          <span>{copied ? 'Tersalin' : failed ? 'Gagal menyalin' : 'Salin'}</span>
        </button>
      </div>
      <div className="code-block__body">
        <div className="code-block__gutter" aria-hidden="true">
          {lines.map((_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <pre className="code-block__pre">
          {highlighted ? (
            <code
              className="code-block__code"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          ) : (
            <code className="code-block__code">{code}</code>
          )}
        </pre>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Kode tersalin' : failed ? 'Gagal menyalin kode' : ''}
      </span>
    </div>
  )
}
