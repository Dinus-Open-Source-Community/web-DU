'use client'

import { useEffect, useState } from 'react'
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { FileCode2, Trash2 } from 'lucide-react'

import { CODE_LANGUAGES, normalizeCodeLanguage } from '@/lib/tiptap-code-languages'
import { cn } from '@/lib/utils'

export function CodeBlockView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const language = normalizeCodeLanguage(node.attrs.language)
  const [title, setTitle] = useState(() => String(node.attrs.codeTitle ?? ''))
  const lines = node.textContent.split('\n')

  useEffect(() => {
    setTitle(String(node.attrs.codeTitle ?? ''))
  }, [node.attrs.codeTitle])

  const commitTitle = () => {
    const next = title.trim()
    if (String(node.attrs.codeTitle ?? '') !== next) {
      updateAttributes({ codeTitle: next || null })
    }
  }

  return (
    <NodeViewWrapper className="code-block code-block--editable" data-language={language}>
      <div className="code-block__header" contentEditable={false}>
        <div className="code-block__filename">
          <FileCode2 className="code-block__filename-icon size-4" aria-hidden />
          <input
            type="text"
            className="code-block__title"
            value={title}
            placeholder="Judul blok kode (opsional)"
            aria-label="Judul blok kode"
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitTitle()
                event.currentTarget.blur()
              }
            }}
          />
        </div>
        <div className="code-block__actions">
          <select
            className="code-block__language-select"
            value={language}
            aria-label="Bahasa blok kode"
            onChange={(event) => updateAttributes({ language: event.target.value })}
          >
            {CODE_LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="code-block__delete"
            aria-label="Hapus blok kode"
            onClick={() => deleteNode()}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      <div className="code-block__body">
        <div className="code-block__gutter" contentEditable={false} aria-hidden="true">
          {lines.map((_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <pre className="code-block__pre">
          <NodeViewContent<'code'>
            as="code"
            className={cn('code-block__code', `language-${language}`)}
          />
        </pre>
      </div>
    </NodeViewWrapper>
  )
}
