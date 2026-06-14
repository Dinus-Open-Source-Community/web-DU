import type { Editor } from '@tiptap/core'

import type { TiptapToolbarState } from './tiptap-toolbar-state'

export function applyTiptapBlockType(
  editor: Editor,
  blockType: TiptapToolbarState['blockType'],
): void {
  const chain = editor.chain().focus()

  switch (blockType) {
    case 'h1':
      chain.toggleHeading({ level: 1 }).run()
      break
    case 'h2':
      chain.toggleHeading({ level: 2 }).run()
      break
    case 'h3':
      chain.toggleHeading({ level: 3 }).run()
      break
    case 'h4':
      chain.toggleHeading({ level: 4 }).run()
      break
    default:
      chain.setParagraph().run()
  }
}

export function shouldShowTiptapBubbleMenu({
  editor,
  from,
  to,
}: {
  editor: Editor
  from: number
  to: number
}): boolean {
  if (!editor.isEditable || from === to) {
    return false
  }

  if (editor.isActive('codeBlock') || editor.isActive('image')) {
    return false
  }

  return true
}
