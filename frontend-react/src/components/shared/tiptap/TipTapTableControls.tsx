'use client'

import { useTiptap } from '@tiptap/react'
import { Columns2, Rows2, Trash2 } from 'lucide-react'

import {
  ToolbarGroup,
  ToolbarIconButton,
  toolbarIconSize,
  type ToolbarControlSize,
} from './toolbar-primitives'

type TipTapTableControlsProps = {
  size?: ToolbarControlSize
}

export function TipTapTableControls({ size = 'default' }: TipTapTableControlsProps) {
  const { editor } = useTiptap()
  const iconClass = toolbarIconSize(size)

  return (
    <ToolbarGroup>
      <span className="px-1 text-[11px] font-medium text-slate-400">Tabel</span>
      <ToolbarIconButton
        label="Tambah baris"
        size={size}
        onClick={() => editor.chain().focus().addRowAfter().run()}
      >
        <Rows2 className={iconClass} />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Tambah kolom"
        size={size}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <Columns2 className={iconClass} />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Hapus tabel"
        size={size}
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <Trash2 className={iconClass} />
      </ToolbarIconButton>
    </ToolbarGroup>
  )
}
