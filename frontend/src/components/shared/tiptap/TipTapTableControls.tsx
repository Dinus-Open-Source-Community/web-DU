'use client'

import { useTiptap } from '@tiptap/react'
import { Columns2, Rows2, Trash2 } from 'lucide-react'

import type { TiptapEditorTheme } from '@/lib/types/rich-text'
import { cn } from '@/lib/utils'

import {
  ToolbarGroup,
  ToolbarIconButton,
  toolbarIconSize,
  type ToolbarControlSize,
} from './toolbar-primitives'

type TipTapTableControlsProps = {
  size?: ToolbarControlSize
  theme?: TiptapEditorTheme
}

export function TipTapTableControls({ size = 'default', theme = 'light' }: TipTapTableControlsProps) {
  const { editor } = useTiptap()
  const iconClass = toolbarIconSize(size)
  const isDark = theme === 'dark'

  return (
    <ToolbarGroup>
      <span className={cn('px-1 text-[11px] font-medium', isDark ? 'text-zinc-500' : 'text-slate-400')}>
        Tabel
      </span>
      <ToolbarIconButton
        label="Tambah baris"
        size={size}
        theme={theme}
        onClick={() => editor.chain().focus().addRowAfter().run()}
      >
        <Rows2 className={iconClass} />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Tambah kolom"
        size={size}
        theme={theme}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <Columns2 className={iconClass} />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Hapus tabel"
        size={size}
        theme={theme}
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <Trash2 className={iconClass} />
      </ToolbarIconButton>
    </ToolbarGroup>
  )
}
