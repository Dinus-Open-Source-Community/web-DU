import { useCallback, useRef, useState } from 'react'
import type { Editor } from '@tiptap/core'

import {
  insertTiptapImage,
  insertTiptapLink,
  insertTiptapYoutube,
  normalizeTiptapMediaUrl,
  type TiptapMediaKind,
} from '@/lib/tiptap-media'
import { getSavedTextSelection, type SavedTextSelection } from '@/lib/tiptap-selection'

type MediaDialogState = {
  open: boolean
  kind: TiptapMediaKind
  initialUrl: string
  allowRemove: boolean
}

const CLOSED_STATE: MediaDialogState = {
  open: false,
  kind: 'link',
  initialUrl: '',
  allowRemove: false,
}

export function useTiptapMediaDialog(editor: Editor) {
  const [mediaDialog, setMediaDialog] = useState<MediaDialogState>(CLOSED_STATE)
  const savedSelectionRef = useRef<SavedTextSelection | null>(null)

  const captureSelectionForMediaDialog = useCallback(() => {
    const current = getSavedTextSelection(editor)
    if (current) savedSelectionRef.current = current
  }, [editor])

  const openMediaDialog = useCallback(
    (kind: TiptapMediaKind) => {
      const current = getSavedTextSelection(editor)
      savedSelectionRef.current = current ?? savedSelectionRef.current

      if (kind === 'link') {
        setMediaDialog({
          open: true,
          kind: 'link',
          initialUrl: (editor.getAttributes('link').href as string | undefined) ?? 'https://',
          allowRemove: editor.isActive('link'),
        })
        return
      }

      setMediaDialog({ open: true, kind, initialUrl: '', allowRemove: false })
    },
    [editor],
  )

  const closeMediaDialog = useCallback((open: boolean) => {
    if (!open) {
      savedSelectionRef.current = null
    }
    setMediaDialog((prev) => ({ ...prev, open }))
  }, [])

  const confirmMediaDialog = useCallback(
    (url: string) => {
      const normalized = normalizeTiptapMediaUrl(url)
      const savedSelection = savedSelectionRef.current
      let inserted = false

      switch (mediaDialog.kind) {
        case 'link':
          inserted = insertTiptapLink(editor, normalized, savedSelection)
          break
        case 'image':
          inserted = insertTiptapImage(editor, normalized)
          break
        case 'youtube':
          inserted = insertTiptapYoutube(editor, normalized)
          break
      }

      if (inserted) {
        savedSelectionRef.current = null
        setMediaDialog(CLOSED_STATE)
      }

      return inserted
    },
    [editor, mediaDialog.kind],
  )

  const removeLink = useCallback(() => {
    const savedSelection = savedSelectionRef.current
    if (savedSelection) {
      editor.chain().focus().setTextSelection(savedSelection).run()
    }
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    savedSelectionRef.current = null
  }, [editor])

  return {
    mediaDialog,
    openMediaDialog,
    captureSelectionForMediaDialog,
    closeMediaDialog,
    confirmMediaDialog,
    removeLink,
  }
}
