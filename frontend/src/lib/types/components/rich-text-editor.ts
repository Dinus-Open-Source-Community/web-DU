export type TiptapEditorVariant = 'default' | 'compact'
export type TiptapEditorTheme = 'light' | 'dark'

export interface ITiptapEditorProps {
  initialContent: string
  onChange: (html: string) => void
  placeholder?: string
  variant?: TiptapEditorVariant
  theme?: TiptapEditorTheme
}

/** Alias backward-compat. */
export type TiptapEditorProps = ITiptapEditorProps
