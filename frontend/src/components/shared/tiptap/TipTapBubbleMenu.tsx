'use client'

import { useTiptap, useTiptapState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import {
  Bold,
  Code,
  Highlighter,
  Italic,
  Link2,
  Strikethrough,
  Underline as UnderlineIcon,
} from 'lucide-react'

import { TipTapMediaDialog } from '@/components/shared/TipTapMediaDialog'
import { TIPTAP_HIGHLIGHT_COLORS } from '@/lib/tiptap-extensions'
import { shouldShowTiptapBubbleMenu } from '@/lib/tiptap-toolbar-actions'
import { selectTiptapToolbarState } from '@/lib/tiptap-toolbar-state'
import { cn } from '@/lib/utils'

import { TipTapBlockTypeSelect } from './TipTapBlockTypeSelect'
import { ToolbarDivider, ToolbarGroup, ToolbarIconButton } from './toolbar-primitives'
import { useTiptapMediaDialog } from '@/hooks/tiptap/use-tiptap-media-dialog'

export function TipTapBubbleMenu() {
  const { editor } = useTiptap()
  const toolbar = useTiptapState(selectTiptapToolbarState)
  const media = useTiptapMediaDialog(editor)

  return (
    <>
      <BubbleMenu
        editor={editor}
        appendTo={() => document.body}
        updateDelay={80}
        className="tiptap-bubble-menu"
        shouldShow={({ editor: ed, from, to }) =>
          shouldShowTiptapBubbleMenu({ editor: ed, from, to })
        }
      >
        <div
          role="toolbar"
          aria-label="Format teks terpilih"
          className="flex items-center gap-0.5 rounded-xl border border-slate-200/90 bg-white px-1 py-1 shadow-lg ring-1 ring-slate-900/5"
        >
          <ToolbarGroup>
            <TipTapBlockTypeSelect size="bubble" />
          </ToolbarGroup>

          <ToolbarDivider dense />

          <ToolbarGroup>
            <ToolbarIconButton
              label="Tebal"
              size="bubble"
              active={toolbar.isBold}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="size-3.5" />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Miring"
              size="bubble"
              active={toolbar.isItalic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="size-3.5" />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Garis bawah"
              size="bubble"
              active={toolbar.isUnderline}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="size-3.5" />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Coret"
              size="bubble"
              active={toolbar.isStrike}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="size-3.5" />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Kode inline"
              size="bubble"
              active={toolbar.isCode}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="size-3.5" />
            </ToolbarIconButton>
          </ToolbarGroup>

          <ToolbarDivider dense />

          <ToolbarGroup>
            <ToolbarIconButton
              label="Tautan"
              size="bubble"
              active={toolbar.isLink}
              onClick={() => media.openMediaDialog('link')}
            >
              <Link2 className="size-3.5" />
            </ToolbarIconButton>
          </ToolbarGroup>

          <ToolbarDivider dense />

          <ToolbarGroup>
            {TIPTAP_HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                aria-label={`Sorot ${color.label}`}
                className={cn(
                  'size-6 shrink-0 rounded-md border border-slate-200 transition-transform active:scale-95',
                  toolbar.isHighlight &&
                    toolbar.highlightColor === color.value &&
                    'ring-2 ring-primary ring-offset-1',
                )}
                style={{ backgroundColor: color.value }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() =>
                  editor.chain().focus().toggleHighlight({ color: color.value }).run()
                }
              />
            ))}
            <ToolbarIconButton
              label="Hapus sorotan"
              size="bubble"
              active={toolbar.isHighlight}
              onClick={() => editor.chain().focus().unsetHighlight().run()}
            >
              <Highlighter className="size-3.5" />
            </ToolbarIconButton>
          </ToolbarGroup>
        </div>
      </BubbleMenu>

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
