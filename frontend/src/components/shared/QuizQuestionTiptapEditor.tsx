'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Code, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

import { toRichTextEnvelope } from '@/lib/rich-text'
import type { IRichTextEnvelope } from '@/lib/types/rich-text'
import { uploadLessonAssignmentImage } from '@/services/lesson-assignment'
import { cn } from '@/lib/utils'

type QuizQuestionTiptapEditorProps = {
  value: string | IRichTextEnvelope
  onChange: (envelope: IRichTextEnvelope) => void
  placeholder?: string
  className?: string
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export function QuizQuestionTiptapEditor({
  value,
  onChange,
  placeholder = 'Tulis pertanyaan...',
  className,
}: QuizQuestionTiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialHtml = useMemo(() => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value.contentHtml ?? ''
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TiptapImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image max-h-48 rounded-md object-contain mb-2 mt-0.5',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialHtml || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      onChange(toRichTextEnvelope(html))
    },
  })

  // Sync external changes if not currently focused
  useEffect(() => {
    if (!editor || editor.isFocused) return
    const currentHtml = typeof value === 'string' ? value : value?.contentHtml ?? ''
    const currentEditorHtml = editor.getHTML()
    if (currentHtml && currentHtml !== currentEditorHtml && currentEditorHtml !== `<p>${currentHtml}</p>`) {
      editor.commands.setContent(currentHtml || '<p></p>')
    }
  }, [editor, value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Ukuran gambar maksimal 5MB')
      e.target.value = ''
      return
    }

    try {
      const url = await uploadLessonAssignmentImage(file)
      editor.chain().focus().setImage({ src: url }).run()
      toast.success('Gambar berhasil diunggah')
    } catch {
      // Fallback ke data URL base64 jika service upload storage tidak tersedia
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        editor.chain().focus().setImage({ src: dataUrl }).run()
      }
      reader.readAsDataURL(file)
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-line-light bg-paper-white transition-all focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30',
        className,
      )}
    >
      {/* Hidden local image file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Compact Single-Row Toolbar */}
      <div className="flex items-center border-b border-line-light/60 bg-paper-paper/40 px-2.5 py-1 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={cn(
              'rounded p-1 text-ink-500 transition-colors hover:bg-paper-paper hover:text-ink-800',
              editor?.isActive('bold') && 'bg-paper-paper font-bold text-primary',
            )}
            title="Tebal (Ctrl+B)"
          >
            <Bold className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={cn(
              'rounded p-1 text-ink-500 transition-colors hover:bg-paper-paper hover:text-ink-800',
              editor?.isActive('italic') && 'bg-paper-paper italic text-primary',
            )}
            title="Miring (Ctrl+I)"
          >
            <Italic className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className={cn(
              'rounded p-1 text-ink-500 transition-colors hover:bg-paper-paper hover:text-ink-800',
              editor?.isActive('code') && 'bg-paper-paper font-mono text-primary',
            )}
            title="Kode (Ctrl+E)"
          >
            <Code className="size-3.5" />
          </button>

          <div className="mx-1 h-3.5 w-px bg-line-light" />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-600 transition-colors hover:bg-paper-paper hover:text-primary"
            title="Pilih gambar dari komputer"
          >
            <ImageIcon className="size-3.5 text-primary" />
            <span>Gambar</span>
          </button>
        </div>
      </div>

      {/* Inline Editor Input Area */}
      <div className="quiz-prompt-editor min-h-[38px] px-3 py-1.5 text-sm text-ink-800">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
