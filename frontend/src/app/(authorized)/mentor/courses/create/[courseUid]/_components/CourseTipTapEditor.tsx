'use client'

import { useCallback, useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import YoutubeExtension from '@tiptap/extension-youtube'
import TiptapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Youtube,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import '@/styles/tiptap-editor.css'

function normalizeYoutubeUrl(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  try {
    const u = new URL(s)
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '')
      return id ? `https://www.youtube.com/watch?v=${id}` : null
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/watch?v=${v}`
      const shorts = u.pathname.match(/\/shorts\/([^/?]+)/)
      if (shorts?.[1]) return `https://www.youtube.com/watch?v=${shorts[1]}`
    }
    return s
  } catch {
    return null
  }
}

type CourseTipTapEditorProps = {
  initialContent: string
  onChange: (html: string) => void
}

export function CourseTipTapEditor({ initialContent, onChange }: CourseTipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      TiptapImage.configure({ inline: false, allowBase64: true }),
      YoutubeExtension.configure({
        width: 640,
        height: 360,
        nocookie: true,
        HTMLAttributes: { class: 'rounded-lg overflow-hidden max-w-full' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'Tulis modul dan konten kursus di sini. Gunakan toolbar untuk format dan sisipkan video YouTube.',
      }),
    ],
    content: initialContent || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-root max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  const addYoutube = useCallback(() => {
    if (!editor) return
    const raw = window.prompt('Tempel URL video YouTube (watch, youtu.be, atau Shorts):')
    if (raw == null) return
    const normalized = normalizeYoutubeUrl(raw)
    if (!normalized) {
      window.alert('URL YouTube tidak valid.')
      return
    }
    editor.chain().focus().setYoutubeVideo({ src: normalized }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const raw = window.prompt('URL gambar (https):')
    if (!raw?.trim()) return
    try {
      const u = new URL(raw.trim())
      if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error()
    } catch {
      window.alert('Masukkan URL gambar yang valid (http/https).')
      return
    }
    editor.chain().focus().setImage({ src: raw.trim() }).run()
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const next = window.prompt('URL tautan:', prev ?? 'https://')
    if (next === null) return
    if (next === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: next }).run()
  }, [editor])

  if (!editor) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        Memuat editor…
      </div>
    )
  }

  const barBtn = (active?: boolean) =>
    cn(
      'h-9 w-9 shrink-0 rounded-lg p-0 shadow-none',
      active ? 'bg-primary/15 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    )

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/90 px-2 py-2">
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} aria-label="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Heading 3">
          <Heading3 className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('paragraph'))} onClick={() => editor.chain().focus().setParagraph().run()} aria-label="Paragraf">
          <Pilcrow className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()} aria-label="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()} aria-label="Inline code">
          <Code className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Ordered list">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="Quote">
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} aria-label="Code block">
          <Braces className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()} aria-label="Horizontal rule">
          <Minus className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive({ textAlign: 'left' }))} onClick={() => editor.chain().focus().setTextAlign('left').run()} aria-label="Align left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive({ textAlign: 'center' }))} onClick={() => editor.chain().focus().setTextAlign('center').run()} aria-label="Align center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive({ textAlign: 'right' }))} onClick={() => editor.chain().focus().setTextAlign('right').run()} aria-label="Align right">
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive({ textAlign: 'justify' }))} onClick={() => editor.chain().focus().setTextAlign('justify').run()} aria-label="Justify">
          <AlignJustify className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <input
          type="color"
          className="h-9 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
          aria-label="Warna teks"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
        <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('highlight'))} onClick={() => editor.chain().focus().toggleHighlight().run()} aria-label="Sorot">
          <Highlighter className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={setLink} aria-label="Tautan">
          <Link2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={addImage} aria-label="Gambar dari URL">
          <ImagePlus className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={addYoutube} aria-label="YouTube">
          <Youtube className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} aria-label="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} aria-label="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="tiptap-editor-root bg-white" />
    </div>
  )
}
