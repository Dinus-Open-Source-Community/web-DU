'use client'

import type { Editor } from '@tiptap/core'
import { useRef } from 'react'
import { useTiptapState } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Eraser,
  MoreHorizontal,
  RemoveFormatting,
  Subscript,
  Superscript,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TIPTAP_FONT_FAMILIES, TIPTAP_HIGHLIGHT_COLORS } from '@/lib/tiptap-extensions'
import {
  getSavedTextSelection,
  runTiptapCommandWithSelection,
  type SavedTextSelection,
} from '@/lib/tiptap-selection'
import { selectTiptapToolbarState } from '@/lib/tiptap-toolbar-state'
import type { TiptapEditorTheme } from '@/lib/types/rich-text'
import { cn } from '@/lib/utils'

import {
  ToolbarGroup,
  ToolbarIconButton,
  ToolbarMenuButton,
  type ToolbarControlSize,
} from './toolbar-primitives'

type TipTapMoreMenuProps = {
  editor: Editor
  size?: ToolbarControlSize
  theme?: TiptapEditorTheme
}

export function TipTapMoreMenu({ editor, size = 'default', theme = 'light' }: TipTapMoreMenuProps) {
  const toolbar = useTiptapState(selectTiptapToolbarState)
  const savedSelectionRef = useRef<SavedTextSelection | null>(null)

  const rememberSelection = () => {
    const current = getSavedTextSelection(editor)
    if (current) savedSelectionRef.current = current
  }

  const runWithSavedSelection = (command: () => boolean) => {
    runTiptapCommandWithSelection(editor, savedSelectionRef.current, command)
  }

  return (
    <Popover
      modal={false}
      onOpenChange={(open) => {
        if (open) savedSelectionRef.current = getSavedTextSelection(editor)
      }}
    >
      <PopoverTrigger asChild>
        <ToolbarMenuButton
          label="Lainnya"
          controlSize={size}
          theme={theme}
          showChevron={false}
          icon={<MoreHorizontal className={size === 'compact' ? 'size-3.5' : 'size-4'} aria-hidden />}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 gap-0 rounded-xl border-input p-0 shadow-lg ring-1 ring-foreground/5"
      >
        <div className="space-y-4 p-3">
          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Perataan</p>
            <ToolbarGroup>
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
            </ToolbarGroup>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Font</p>
            <select
              className="h-9 w-full rounded-xl border border-input bg-card px-2.5 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow,background-color] hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              aria-label="Jenis font"
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
          </section>

          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Warna & sorotan</p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                className="size-9 cursor-pointer rounded-xl border border-input bg-card p-1 outline-none transition-[color,box-shadow,background-color] hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                aria-label="Warna teks"
                onMouseDown={rememberSelection}
                onChange={(event) =>
                  runWithSavedSelection(() =>
                    editor.chain().focus().setColor(event.target.value).run(),
                  )
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 px-2.5 text-xs"
                onMouseDown={(event) => {
                  event.preventDefault()
                  runWithSavedSelection(() => editor.chain().focus().unsetColor().run())
                }}
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
                    'size-7 rounded-md border border-input outline-none transition-shadow active:scale-95 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                    toolbar.isHighlight &&
                      toolbar.highlightColor === color.value &&
                      'ring-2 ring-ring ring-offset-1 ring-offset-card',
                  )}
                  style={{ backgroundColor: color.value }}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    runWithSavedSelection(() =>
                      editor.chain().focus().toggleHighlight({ color: color.value }).run(),
                    )
                  }}
                />
              ))}
              <ToolbarIconButton
                label="Hapus sorotan"
                active={toolbar.isHighlight}
                size="compact"
                actionOnMouseDown
                onClick={() => runWithSavedSelection(() => editor.chain().focus().unsetHighlight().run())}
              >
                <RemoveFormatting className="size-3.5" />
              </ToolbarIconButton>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Lanjutan</p>
            <ToolbarGroup>
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
            </ToolbarGroup>
          </section>
        </div>
      </PopoverContent>
    </Popover>
  )
}
