import type { MouseEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTiptap, useTiptapState } from '@tiptap/react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { applyTiptapBlockType } from '@/lib/tiptap-toolbar-actions'
import {
  selectTiptapToolbarState,
  TIPTAP_BLOCK_TYPE_LABELS,
  type TiptapToolbarState,
} from '@/lib/tiptap-toolbar-state'
import { cn } from '@/lib/utils'

import type { ToolbarControlSize } from './toolbar-primitives'

type TipTapBlockTypeSelectProps = {
  size?: ToolbarControlSize
}

function preventEditorBlur(event: MouseEvent) {
  event.preventDefault()
}

export function TipTapBlockTypeSelect({ size = 'default' }: TipTapBlockTypeSelectProps) {
  const { editor } = useTiptap()
  const { blockType } = useTiptapState(selectTiptapToolbarState)

  const label =
    size === 'bubble'
      ? blockType === 'paragraph'
        ? 'P'
        : blockType.replace('h', 'H')
      : TIPTAP_BLOCK_TYPE_LABELS[blockType]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={preventEditorBlur}
          className={cn(
            'w-full justify-between gap-2 rounded-full border-slate-200/90 bg-slate-50/80 font-medium text-slate-700 shadow-none hover:bg-slate-100/90 data-[state=open]:bg-slate-100',
            size === 'bubble' && 'h-8 min-w-[2.75rem] px-2 text-xs',
            size === 'compact' && 'h-8 min-w-[8.5rem] max-w-[10rem] px-3 text-xs',
            size === 'default' && 'h-9 min-w-[9rem] max-w-[11rem] px-3.5 text-sm',
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-50" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10.5rem]">
        <DropdownMenuLabel className="text-xs font-normal text-slate-500">
          Tipe blok
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={blockType}
          onValueChange={(value) =>
            applyTiptapBlockType(editor, value as TiptapToolbarState['blockType'])
          }
        >
          {(Object.keys(TIPTAP_BLOCK_TYPE_LABELS) as TiptapToolbarState['blockType'][]).map(
            (type) => (
              <DropdownMenuRadioItem
                key={type}
                value={type}
                className="text-sm"
                onMouseDown={preventEditorBlur}
              >
                {TIPTAP_BLOCK_TYPE_LABELS[type]}
              </DropdownMenuRadioItem>
            ),
          )}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
