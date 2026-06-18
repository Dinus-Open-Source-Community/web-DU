import type { Editor } from '@tiptap/core'

export type SavedTextSelection = {
  from: number
  to: number
}

export function getSavedTextSelection(editor: Editor): SavedTextSelection | null {
  const { from, to, empty } = editor.state.selection
  if (empty || from === to) return null
  return { from, to }
}

export function restoreTextSelection(
  editor: Editor,
  selection: SavedTextSelection | null | undefined,
): boolean {
  if (!selection) return false
  return editor.chain().focus().setTextSelection(selection).run()
}

/** Restore saved range, then run a formatting command on the current selection. */
export function runTiptapCommandWithSelection(
  editor: Editor,
  selection: SavedTextSelection | null | undefined,
  command: () => boolean,
): boolean {
  if (selection) {
    editor.chain().focus().setTextSelection(selection).run()
  } else {
    editor.chain().focus().run()
  }
  return command()
}
