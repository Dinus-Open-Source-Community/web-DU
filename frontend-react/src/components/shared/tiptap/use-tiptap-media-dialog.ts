import { useCallback, useState } from 'react'
import type { Editor } from '@tiptap/core'

import { normalizeYoutubeWatchUrl, type TiptapMediaKind } from '@/lib/tiptap-media'

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

  const openMediaDialog = useCallback(
    (kind: TiptapMediaKind) => {
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
    setMediaDialog((prev) => ({ ...prev, open }))
  }, [])

  const confirmMediaDialog = useCallback(
    (url: string) => {
      switch (mediaDialog.kind) {
        case 'link':
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          break
        case 'image':
          editor.chain().focus().setImage({ src: url }).run()
          break
        case 'youtube': {
          const normalized = normalizeYoutubeWatchUrl(url)
          if (normalized) editor.chain().focus().setYoutubeVideo({ src: normalized }).run()
          break
        }
      }
    },
    [editor, mediaDialog.kind],
  )

  const removeLink = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }, [editor])

  return {
    mediaDialog,
    openMediaDialog,
    closeMediaDialog,
    confirmMediaDialog,
    removeLink,
  }
}
