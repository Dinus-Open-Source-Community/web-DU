'use client'

import type { Editor } from '@tiptap/core'
import { useMemo } from 'react'
import { Tiptap, useEditor, useTiptapState } from '@tiptap/react'
import '@/styles/tiptap-editor.css'
import { cn } from '../../lib/utils'
import { createTiptapExtensions } from '../../lib/tiptap-extensions'
import { useAppTheme } from '@/providers/theme-provider'
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
    <div
      className={cn(
        'tiptap-character-count flex items-center justify-end gap-3 border-t border-border bg-muted px-4 py-2 text-xs text-muted-foreground',
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
  theme: themeProp,
}: TiptapEditorProps) {
  const { theme: appTheme } = useAppTheme()
  const theme = themeProp ?? appTheme
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
          'border-input bg-card text-muted-foreground',
        )}
      >
        Memuat editor…
      </div>
    )
  }

  return (
    <div
      className={cn(
        'tiptap-editor-root overflow-hidden rounded-xl border shadow-none',
        isDark && 'tiptap-editor-root--dark',
        'border-input bg-card',
        variant === 'compact' && 'tiptap-editor-root--compact',
      )}
    >
      <Tiptap editor={editor}>
        <TipTapToolbar variant={variant} theme={theme} />
        <Tiptap.Content
          className={cn(
            variant === 'compact' ? 'min-h-[200px]' : 'min-h-[360px]',
            'bg-card',
          )}
        />
        <TipTapBubbleMenu />
        <TiptapCharacterCount />
      </Tiptap>
    </div>
  )
}
