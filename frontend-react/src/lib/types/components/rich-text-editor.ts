export type TiptapEditorVariant = 'default' | 'compact'

export interface ITiptapEditorProps {
  initialContent: string
  onChange: (html: string) => void
  placeholder?: string
  variant?: TiptapEditorVariant
}

/** Alias backward-compat. */
export type TiptapEditorProps = ITiptapEditorProps
