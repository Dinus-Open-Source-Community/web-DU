'use client'

import { useMemo } from 'react'
import { Tiptap, useEditor, useTiptapState } from '@tiptap/react'
import '@/styles/tiptap-editor.css'
import { cn } from '../../lib/utils'
import { createTiptapExtensions } from '../../lib/tiptap-extensions'
import type { TiptapEditorProps } from '../../lib/types/rich-text'
import { TipTapToolbar } from './TipTapToolbar'

function TiptapCharacterCount() {
  const { characters, words } = useTiptapState((ctx) => {
    const storage = ctx.editor.storage.characterCount as { characters?: () => number; words?: () => number } | undefined
    return {
      characters: storage?.characters?.() ?? 0,
      words: storage?.words?.() ?? 0,
    }
  })

  return (
    <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-3 py-1.5 text-[11px] text-slate-500">
      <span>{words} kata</span>
      <span>{characters} karakter</span>
    </div>
  )
}

export type TiptapRichTextEditorProps = TiptapEditorProps

export function TiptapEditor({
  initialContent,
  onChange,
  placeholder = 'Tulis modul dan konten kursus di sini. Gunakan toolbar untuk format dan sisipkan video YouTube.',
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
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  if (!editor) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Memuat editor…</div>
  }

  const shell = variant === 'compact' ? 'rounded-xl border border-slate-200 bg-white' : 'rounded-2xl border border-slate-200 bg-white'

  return (
    <div className={cn('tiptap-editor-root overflow-hidden', shell)}>
      <Tiptap editor={editor}>
        <TipTapToolbar variant={variant} />
        <Tiptap.Content className={cn('bg-white', variant === 'compact' ? 'min-h-[200px]' : 'min-h-[280px]')} />
        <TiptapCharacterCount />
      </Tiptap>
    </div>
  )
}
