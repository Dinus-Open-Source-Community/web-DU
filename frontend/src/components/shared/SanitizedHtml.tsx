'use client'

import { useMemo } from 'react'
import parse, { Element, type DOMNode } from 'html-react-parser'

import { ReadOnlyCodeBlock } from '@/components/shared/tiptap/ReadOnlyCodeBlock'
import { sanitizeInlineHtml, sanitizeRichHtml } from '@/lib/security/sanitize-html'
import { cn } from '@/lib/utils'

type SanitizedHtmlProps = {
  html: string
  className?: string
  variant?: 'rich' | 'inline'
}

function readNodeText(node: DOMNode): string {
  if (node.type === 'text') return node.data
  if ('children' in node) return (node.children as DOMNode[]).map(readNodeText).join('')
  return ''
}

function findElement(node: DOMNode, tagName: string): Element | null {
  if (node.type === 'tag') {
    const element = node as Element
    if (element.name === tagName) return element
  }
  if ('children' in node) {
    for (const child of (node.children as DOMNode[])) {
      const found = findElement(child, tagName)
      if (found) return found
    }
  }
  return null
}

function readLanguage(codeNode: Element | null): string | null {
  const className = codeNode?.attribs.class ?? ''
  const match = className.match(/(?:^|\s)language-([^\s]+)/)
  return match?.[1] ?? null
}

function renderRichHtml(clean: string) {
  return parse(clean, {
    replace: (domNode) => {
      if (domNode.type !== 'tag' || domNode.name !== 'pre') return
      const codeNode = findElement(domNode, 'code')
      const code = codeNode ? readNodeText(codeNode) : readNodeText(domNode)
      const title = domNode.attribs['data-code-title'] ?? null
      return (
        <ReadOnlyCodeBlock
          code={code}
          language={readLanguage(codeNode)}
          title={title}
        />
      )
    },
  })
}

export function SanitizedHtml({ html, className, variant = 'rich' }: SanitizedHtmlProps) {
  const clean = useMemo(
    () => (variant === 'inline' ? sanitizeInlineHtml(html) : sanitizeRichHtml(html)),
    [html, variant],
  )
  const parsed = useMemo(
    () => (variant === 'rich' ? renderRichHtml(clean) : null),
    [clean, variant],
  )

  if (variant === 'inline') {
    return <div className={cn(className)} dangerouslySetInnerHTML={{ __html: clean }} />
  }

  return <div className={cn(className)}>{parsed}</div>
}
