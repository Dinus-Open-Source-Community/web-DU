'use client'

import type { Editor } from '@tiptap/core'
import { useMemo } from 'react'
import { Tiptap, useEditor, useTiptapState } from '@tiptap/react'
import '@/styles/tiptap-editor.css'
import { cn } from '../../lib/utils'
import { createTiptapExtensions } from '../../lib/tiptap-extensions'
import type { TiptapEditorProps } from '../../lib/types/rich-text'
import { TipTapToolbar } from './TipTapToolbar'
import { TipTapBubbleMenu } from './tiptap/TipTapBubbleMenu'

function TiptapCharacterCount() {
  const { characters, words } = useTiptapState((ctx) => {
    const storage = ctx.editor.storage.characterCount as { characters?: () => number; words?: () => number } | undefined
    return {
      characters: storage?.characters?.() ?? 0,
      words: storage?.words?.() ?? 0,
    }
  })

  return (
    <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/40 px-4 py-2 text-xs text-slate-400">
      <span>{words} kata</span>
      <span aria-hidden>·</span>
      <span>{characters} karakter</span>
    </div>
  )
}

export type TiptapRichTextEditorProps = TiptapEditorProps

export function TiptapEditor({
  initialContent,
  onChange,
  placeholder = 'Mulai menulis materi lesson di sini…',
  variant = 'default',
}: TiptapEditorProps) {
  const extensions = useMemo(() => createTiptapExtensions(placeholder), [placeholder])

  const editor = useEditor({
    extensions,
    content: initialContent?.trim() || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn('max-w-none focus:outline-none', variant === 'compact' && 'min-h-[160px]'),
      },
    },
    onUpdate: ({ editor: ed }: { editor: Editor }) => {
      onChange(ed.getHTML())
    },
  })

  if (!editor) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Memuat editor…</div>
  }

  const shell =
    variant === 'compact'
      ? 'rounded-xl border border-slate-200 bg-white shadow-sm'
      : 'rounded-xl border border-slate-200 bg-white shadow-sm'

  return (
    <div className={cn('tiptap-editor-root overflow-hidden', shell, variant === 'compact' && 'tiptap-editor-root--compact')}>
      <Tiptap editor={editor}>
        <TipTapToolbar variant={variant} />
        <Tiptap.Content
          className={cn(
            'bg-white',
            variant === 'compact' ? 'min-h-[200px]' : 'min-h-[360px]',
          )}
        />
        <TipTapBubbleMenu />
        <TiptapCharacterCount />
      </Tiptap>
    </div>
  )
}
