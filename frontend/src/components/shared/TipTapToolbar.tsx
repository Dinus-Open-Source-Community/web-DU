'use client'

import { useTiptap, useTiptapState } from '@tiptap/react'
import { Braces, List, ListOrdered, ListTodo, Quote, Redo2, Undo2 } from 'lucide-react'

import { TipTapMediaDialog } from '@/components/shared/TipTapMediaDialog'
import { selectTiptapToolbarState } from '@/lib/tiptap-toolbar-state'
import type { TiptapEditorVariant } from '@/lib/types/rich-text'
import { cn } from '@/lib/utils'

import { TipTapBlockTypeSelect } from './tiptap/TipTapBlockTypeSelect'
import { TipTapInsertMenu } from './tiptap/TipTapInsertMenu'
import { TipTapMoreMenu } from './tiptap/TipTapMoreMenu'
import { TipTapTableControls } from './tiptap/TipTapTableControls'
import {
  ToolbarDivider,
  ToolbarGroup,
  ToolbarIconButton,
  ToolbarRow,
  ToolbarShell,
  toolbarIconSize,
} from './tiptap/toolbar-primitives'
import { useTiptapMediaDialog } from '@/hooks/tiptap/use-tiptap-media-dialog'

type TipTapToolbarProps = {
  variant: TiptapEditorVariant
}

export function TipTapToolbar({ variant }: TipTapToolbarProps) {
  const { editor } = useTiptap()
  const toolbar = useTiptapState(selectTiptapToolbarState)
  const media = useTiptapMediaDialog(editor)
  const compact = variant === 'compact'
  const controlSize = compact ? 'compact' : 'default'
  const iconClass = toolbarIconSize(controlSize)

  return (
    <>
      <ToolbarShell>
        <ToolbarRow
          className={cn(
            'justify-between gap-3 border-b border-slate-100 bg-slate-50/40',
            compact ? 'py-1.5' : 'py-2',
          )}
        >
          <div className="min-w-0 flex-1 sm:flex-none sm:max-w-[12rem]">
            <TipTapBlockTypeSelect size={controlSize} />
          </div>

          <ToolbarGroup surface>
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
          </ToolbarGroup>
        </ToolbarRow>

        <ToolbarRow
          className={cn(
            'gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            compact ? 'py-1.5' : 'py-2',
          )}
        >
          <ToolbarGroup surface>
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

          <ToolbarGroup surface>
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

          <ToolbarGroup surface>
            <TipTapInsertMenu
              editor={editor}
              size={controlSize}
              onCaptureSelection={media.captureSelectionForMediaDialog}
              onInsertLink={() => media.openMediaDialog('link')}
              onInsertImage={() => media.openMediaDialog('image')}
              onInsertYoutube={() => media.openMediaDialog('youtube')}
            />
          </ToolbarGroup>

          {toolbar.isTable ? (
            <>
              <ToolbarDivider />
              <ToolbarGroup surface>
                <TipTapTableControls size={controlSize} />
              </ToolbarGroup>
            </>
          ) : null}

          <ToolbarDivider />

          <ToolbarGroup surface>
            <TipTapMoreMenu editor={editor} size={controlSize} />
          </ToolbarGroup>
        </ToolbarRow>
      </ToolbarShell>

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
