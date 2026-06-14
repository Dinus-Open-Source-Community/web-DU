'use client'

import type { Editor } from '@tiptap/core'
import {
  ImagePlus,
  Link2,
  Minus,
  Plus,
  Table2,
  Video,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  ToolbarMenuButton,
  type ToolbarControlSize,
} from './toolbar-primitives'

type TipTapInsertMenuProps = {
  editor: Editor
  size?: ToolbarControlSize
  onInsertLink: () => void
  onInsertImage: () => void
  onInsertYoutube: () => void
}

export function TipTapInsertMenu({
  editor,
  size = 'default',
  onInsertLink,
  onInsertImage,
  onInsertYoutube,
}: TipTapInsertMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarMenuButton
          label="Sisipkan"
          controlSize={size}
          icon={<Plus className={size === 'compact' ? 'size-3.5' : 'size-4'} aria-hidden />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[11.5rem]">
        <DropdownMenuLabel className="text-xs font-normal text-slate-500">
          Media & elemen
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onInsertLink}>
          <Link2 className="size-4" />
          Tautan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onInsertImage}>
          <ImagePlus className="size-4" />
          Gambar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onInsertYoutube}>
          <Video className="size-4" />
          Video YouTube
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <Table2 className="size-4" />
          Tabel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="size-4" />
          Garis pemisah
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
