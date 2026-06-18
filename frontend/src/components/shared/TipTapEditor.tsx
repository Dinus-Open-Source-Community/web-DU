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

function TiptapCharacterCount({ isDark }: { isDark: boolean }) {
  const { characters, words } = useTiptapState((ctx) => {
    const storage = ctx.editor.storage.characterCount as { characters?: () => number; words?: () => number } | undefined
    return {
      characters: storage?.characters?.() ?? 0,
      words: storage?.words?.() ?? 0,
    }
  })

  return (
    <div
      className={cn(
        'tiptap-character-count flex items-center justify-end gap-3 border-t px-4 py-2 text-xs',
        isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-500' : 'border-slate-100 bg-slate-50/40 text-slate-400',
      )}
    >
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
  theme = 'light',
}: TiptapEditorProps) {
  const isDark = theme === 'dark'
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
    return (
      <div
        className={cn(
          'rounded-xl border p-10 text-center text-sm',
          isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-400' : 'border-slate-200 bg-white text-slate-500',
        )}
      >
        Memuat editor…
      </div>
    )
  }

  return (
    <div
      className={cn(
        'tiptap-editor-root overflow-hidden rounded-xl border shadow-sm',
        isDark ? 'tiptap-editor-root--dark border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white',
        variant === 'compact' && 'tiptap-editor-root--compact',
      )}
    >
      <Tiptap editor={editor}>
        <TipTapToolbar variant={variant} theme={theme} />
        <Tiptap.Content
          className={cn(
            variant === 'compact' ? 'min-h-[200px]' : 'min-h-[360px]',
            isDark ? 'bg-zinc-950' : 'bg-white',
          )}
        />
        <TipTapBubbleMenu />
        <TiptapCharacterCount isDark={isDark} />
      </Tiptap>
    </div>
  )
}
