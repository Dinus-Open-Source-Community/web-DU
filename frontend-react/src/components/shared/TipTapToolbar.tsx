'use client'

import type { MouseEvent } from 'react'
import { useTiptap, useTiptapState } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Braces,
  ChevronDown,
  Columns2,
  Eraser,
  ImagePlus,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  MoreHorizontal,
  Plus,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows2,
  Subscript,
  Superscript,
  Table2,
  Trash2,
  Undo2,
  Video,
} from 'lucide-react'

import { TipTapMediaDialog } from '@/components/shared/TipTapMediaDialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TIPTAP_FONT_FAMILIES, TIPTAP_HIGHLIGHT_COLORS } from '@/lib/tiptap-extensions'
import { selectTiptapToolbarState } from '@/lib/tiptap-toolbar-state'
import type { TiptapEditorVariant } from '@/lib/types/rich-text'
import { cn } from '@/lib/utils'

import { TipTapBlockTypeSelect } from './tiptap/TipTapBlockTypeSelect'
import { ToolbarDivider, ToolbarGroup, ToolbarIconButton } from './tiptap/toolbar-primitives'
import { useTiptapMediaDialog } from './tiptap/use-tiptap-media-dialog'

type TipTapToolbarProps = {
  variant: TiptapEditorVariant
}

function preventEditorBlur(event: MouseEvent) {
  event.preventDefault()
}

export function TipTapToolbar({ variant }: TipTapToolbarProps) {
  const { editor } = useTiptap()
  const toolbar = useTiptapState(selectTiptapToolbarState)
  const media = useTiptapMediaDialog(editor)
  const compact = variant === 'compact'
  const iconClass = compact ? 'size-3.5' : 'size-4'
  const controlSize = compact ? 'compact' : 'default'

  return (
    <>
      <div
        role="toolbar"
        aria-label="Toolbar editor"
        className="sticky top-0 z-10 border-b border-slate-200 bg-white"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Format
            </p>
            <TipTapBlockTypeSelect size={controlSize} />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <ToolbarIconButton
              label="Urungkan"
              disabled={!toolbar.canUndo}
              size={controlSize}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 className={iconClass} />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Ulangi"
              disabled={!toolbar.canRedo}
              size={controlSize}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 className={iconClass} />
            </ToolbarIconButton>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            compact ? 'py-1.5' : 'py-2',
          )}
        >
          <ToolbarGroup>
            <ToolbarIconButton
              label="Daftar bullet"
              size={controlSize}
              active={toolbar.isBulletList}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className={iconClass} />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Daftar bernomor"
              size={controlSize}
              active={toolbar.isOrderedList}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className={iconClass} />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Daftar checklist"
              size={controlSize}
              active={toolbar.isTaskList}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <ListTodo className={iconClass} />
            </ToolbarIconButton>
          </ToolbarGroup>

          <ToolbarDivider />

          <ToolbarGroup>
            <ToolbarIconButton
              label="Kutipan"
              size={controlSize}
              active={toolbar.isBlockquote}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className={iconClass} />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Blok kode"
              size={controlSize}
              active={toolbar.isCodeBlock}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Braces className={iconClass} />
            </ToolbarIconButton>
          </ToolbarGroup>

          <ToolbarDivider />

          <ToolbarGroup>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onMouseDown={preventEditorBlur}
                  className={cn(
                    'shrink-0 gap-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[state=open]:bg-slate-100',
                    compact ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm',
                  )}
                >
                  <Plus className={iconClass} aria-hidden />
                  Sisipkan
                  <ChevronDown className="size-3.5 opacity-60" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[11rem]">
                <DropdownMenuLabel className="text-xs text-slate-500">
                  Media & elemen
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => media.openMediaDialog('link')}>
                  <Link2 className="size-4" />
                  Tautan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => media.openMediaDialog('image')}>
                  <ImagePlus className="size-4" />
                  Gambar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => media.openMediaDialog('youtube')}>
                  <Video className="size-4" />
                  Video YouTube
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run()
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
          </ToolbarGroup>

          {toolbar.isTable && (
            <>
              <ToolbarDivider />
              <ToolbarGroup>
                <span className="px-1 text-[11px] font-medium text-slate-400">Tabel</span>
                <ToolbarIconButton
                  label="Tambah baris"
                  size={controlSize}
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  <Rows2 className={iconClass} />
                </ToolbarIconButton>
                <ToolbarIconButton
                  label="Tambah kolom"
                  size={controlSize}
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  <Columns2 className={iconClass} />
                </ToolbarIconButton>
                <ToolbarIconButton
                  label="Hapus tabel"
                  size={controlSize}
                  onClick={() => editor.chain().focus().deleteTable().run()}
                >
                  <Trash2 className={iconClass} />
                </ToolbarIconButton>
              </ToolbarGroup>
            </>
          )}

          <ToolbarDivider />

          <Popover modal={false}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={preventEditorBlur}
                className={cn(
                  'shrink-0 gap-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[state=open]:bg-slate-100',
                  compact ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm',
                )}
              >
                <MoreHorizontal className={iconClass} aria-hidden />
                Lainnya
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-72 gap-0 rounded-xl p-0 shadow-md ring-slate-200"
            >
              <div className="space-y-4 p-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">Perataan</p>
                  <div className="flex items-center gap-0.5">
                    {(
                      [
                        ['left', AlignLeft, toolbar.isAlignLeft],
                        ['center', AlignCenter, toolbar.isAlignCenter],
                        ['right', AlignRight, toolbar.isAlignRight],
                        ['justify', AlignJustify, toolbar.isAlignJustify],
                      ] as const
                    ).map(([align, Icon, active]) => (
                      <ToolbarIconButton
                        key={align}
                        label={`Rata ${align}`}
                        active={active}
                        size="compact"
                        onClick={() => editor.chain().focus().setTextAlign(align).run()}
                      >
                        <Icon className="size-3.5" />
                      </ToolbarIconButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">Font</p>
                  <select
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700"
                    aria-label="Font family"
                    value={toolbar.fontFamily}
                    onChange={(event) => {
                      const value = event.target.value
                      if (!value) editor.chain().focus().unsetFontFamily().run()
                      else editor.chain().focus().setFontFamily(value).run()
                    }}
                  >
                    {TIPTAP_FONT_FAMILIES.map((font) => (
                      <option key={font.label} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">Warna & sorotan</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="color"
                      className="size-9 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
                      aria-label="Warna teks"
                      onChange={(event) =>
                        editor.chain().focus().setColor(event.target.value).run()
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 px-2.5 text-xs"
                      onClick={() => editor.chain().focus().unsetColor().run()}
                    >
                      <Eraser className="size-3.5" />
                      Reset warna
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TIPTAP_HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        aria-label={`Sorot ${color.label}`}
                        className={cn(
                          'size-7 rounded-md border border-slate-200 transition-shadow',
                          toolbar.isHighlight &&
                            toolbar.highlightColor === color.value &&
                            'ring-2 ring-primary ring-offset-1',
                        )}
                        style={{ backgroundColor: color.value }}
                        onClick={() =>
                          editor.chain().focus().toggleHighlight({ color: color.value }).run()
                        }
                      />
                    ))}
                    <ToolbarIconButton
                      label="Hapus sorotan"
                      active={toolbar.isHighlight}
                      size="compact"
                      onClick={() => editor.chain().focus().unsetHighlight().run()}
                    >
                      <RemoveFormatting className="size-3.5" />
                    </ToolbarIconButton>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">Lanjutan</p>
                  <div className="flex items-center gap-0.5">
                    <ToolbarIconButton
                      label="Subscript"
                      active={toolbar.isSubscript}
                      size="compact"
                      onClick={() => editor.chain().focus().toggleSubscript().run()}
                    >
                      <Subscript className="size-3.5" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                      label="Superscript"
                      active={toolbar.isSuperscript}
                      size="compact"
                      onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    >
                      <Superscript className="size-3.5" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                      label="Hapus format"
                      size="compact"
                      onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    >
                      <RemoveFormatting className="size-3.5" />
                    </ToolbarIconButton>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <TipTapMediaDialog
        open={media.mediaDialog.open}
        kind={media.mediaDialog.kind}
        initialUrl={media.mediaDialog.initialUrl}
        allowRemove={media.mediaDialog.allowRemove}
        onOpenChange={media.closeMediaDialog}
        onConfirm={media.confirmMediaDialog}
        onRemove={media.removeLink}
      />
    </>
  )
}
