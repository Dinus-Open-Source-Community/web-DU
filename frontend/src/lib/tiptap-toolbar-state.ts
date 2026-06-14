import type { Editor } from '@tiptap/core'

export type TiptapToolbarState = {
  blockType: 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4'
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  isStrike: boolean
  isCode: boolean
  isSubscript: boolean
  isSuperscript: boolean
  isBulletList: boolean
  isOrderedList: boolean
  isTaskList: boolean
  isBlockquote: boolean
  isCodeBlock: boolean
  isAlignLeft: boolean
  isAlignCenter: boolean
  isAlignRight: boolean
  isAlignJustify: boolean
  isHighlight: boolean
  isLink: boolean
  isTable: boolean
  canUndo: boolean
  canRedo: boolean
  highlightColor: string | null
  fontFamily: string
}

function resolveBlockType(editor: Editor): TiptapToolbarState['blockType'] {
  if (editor.isActive('heading', { level: 1 })) return 'h1'
  if (editor.isActive('heading', { level: 2 })) return 'h2'
  if (editor.isActive('heading', { level: 3 })) return 'h3'
  if (editor.isActive('heading', { level: 4 })) return 'h4'
  return 'paragraph'
}

export function selectTiptapToolbarState({ editor }: { editor: Editor }): TiptapToolbarState {
  return {
    blockType: resolveBlockType(editor),
    isBold: editor.isActive('bold'),
    isItalic: editor.isActive('italic'),
    isUnderline: editor.isActive('underline'),
    isStrike: editor.isActive('strike'),
    isCode: editor.isActive('code'),
    isSubscript: editor.isActive('subscript'),
    isSuperscript: editor.isActive('superscript'),
    isBulletList: editor.isActive('bulletList'),
    isOrderedList: editor.isActive('orderedList'),
    isTaskList: editor.isActive('taskList'),
    isBlockquote: editor.isActive('blockquote'),
    isCodeBlock: editor.isActive('codeBlock'),
    isAlignLeft: editor.isActive({ textAlign: 'left' }),
    isAlignCenter: editor.isActive({ textAlign: 'center' }),
    isAlignRight: editor.isActive({ textAlign: 'right' }),
    isAlignJustify: editor.isActive({ textAlign: 'justify' }),
    isHighlight: editor.isActive('highlight'),
    isLink: editor.isActive('link'),
    isTable: editor.isActive('table'),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
    highlightColor: (editor.getAttributes('highlight').color as string | undefined) ?? null,
    fontFamily: (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? '',
  }
}

export const TIPTAP_BLOCK_TYPE_LABELS: Record<TiptapToolbarState['blockType'], string> = {
  paragraph: 'Paragraf',
  h1: 'Judul 1',
  h2: 'Judul 2',
  h3: 'Judul 3',
  h4: 'Judul 4',
}
