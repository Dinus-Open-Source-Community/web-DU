import DOMPurify from 'isomorphic-dompurify'
import type { Config } from 'dompurify'

import { resolveSafeExternalHref, resolveSafeImageSrc } from '@/lib/security/safe-external-url'

const RICH_TEXT_ALLOWED_TAGS = [
  'a',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
] as const

const RICH_TEXT_ALLOWED_ATTR = [
  'alt',
  'class',
  'colspan',
  'href',
  'rel',
  'rowspan',
  'src',
  'target',
  'title',
  'width',
  'height',
] as const

const INLINE_ALLOWED_TAGS = ['a', 'b', 'br', 'em', 'i', 'p', 'span', 'strong', 'u'] as const
const INLINE_ALLOWED_ATTR = ['class', 'href', 'rel', 'target', 'title'] as const

let uriSanitizerHookInstalled = false

function ensureUriSanitizerHook() {
  if (uriSanitizerHookInstalled) return
  uriSanitizerHookInstalled = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.hasAttribute('href')) {
      const safeHref = resolveSafeExternalHref(node.getAttribute('href') ?? '')
      if (safeHref) {
        node.setAttribute('href', safeHref)
        if (node.getAttribute('target') === '_blank') {
          node.setAttribute('rel', 'noopener noreferrer')
        }
      } else {
        node.removeAttribute('href')
      }
    }

    if (node.tagName === 'IMG' && node.hasAttribute('src')) {
      const safeSrc = resolveSafeImageSrc(node.getAttribute('src') ?? '')
      if (safeSrc) {
        node.setAttribute('src', safeSrc)
      } else {
        node.removeAttribute('src')
      }
    }
  })
}

function sanitize(html: string, config: Config) {
  if (!html.trim()) return ''
  ensureUriSanitizerHook()
  return DOMPurify.sanitize(html, config)
}

/** TipTap / lesson / submission HTML from API. */
export function sanitizeRichHtml(html: string) {
  return sanitize(html, {
    ALLOWED_TAGS: [...RICH_TEXT_ALLOWED_TAGS],
    ALLOWED_ATTR: [...RICH_TEXT_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  })
}

/** Short payment instruction snippets. */
export function sanitizeInlineHtml(html: string) {
  return sanitize(html, {
    ALLOWED_TAGS: [...INLINE_ALLOWED_TAGS],
    ALLOWED_ATTR: [...INLINE_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  })
}
