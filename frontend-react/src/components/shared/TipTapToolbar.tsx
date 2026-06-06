'use client'

import { useCallback, useState } from 'react'
import { useTiptap, useTiptapState } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  Code,
  Columns2,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows2,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Video,
} from 'lucide-react'
import { normalizeYoutubeWatchUrl, type TiptapMediaKind } from '../../lib/tiptap-media'
import { cn } from '../../lib/utils'
import { TIPTAP_FONT_FAMILIES, TIPTAP_HIGHLIGHT_COLORS } from '../../lib/tiptap-extensions'
import type { TiptapEditorVariant } from '../../lib/types/rich-text'
import { Button } from '../ui/button'
import { TipTapMediaDialog } from './TipTapMediaDialog'

type ToolbarState = {
  isH1: boolean
  isH2: boolean
  isH3: boolean
  isH4: boolean
  isParagraph: boolean
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

function selectToolbarState({ editor }: { editor: NonNullable<ReturnType<typeof import('@tiptap/react').useEditor>> }): ToolbarState {
  return {
    isH1: editor.isActive('heading', { level: 1 }),
    isH2: editor.isActive('heading', { level: 2 }),
    isH3: editor.isActive('heading', { level: 3 }),
    isH4: editor.isActive('heading', { level: 4 }),
    isParagraph: editor.isActive('paragraph'),
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

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden />
}

type TipTapToolbarProps = {
  variant: TiptapEditorVariant
}

export function TipTapToolbar({ variant }: TipTapToolbarProps) {
  const { editor } = useTiptap()
  const toolbar = useTiptapState(selectToolbarState)
  const [mediaDialog, setMediaDialog] = useState<{
    open: boolean
    kind: TiptapMediaKind
    initialUrl: string
    allowRemove: boolean
  }>({ open: false, kind: 'link', initialUrl: '', allowRemove: false })

  const barBtn = (active?: boolean) =>
    cn('h-9 w-9 shrink-0 rounded-lg p-0 shadow-none', active ? 'bg-primary/15 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')

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

  const handleMediaConfirm = useCallback(
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

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  return (
    <>
    <div className={cn('flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/90 px-2', variant === 'compact' ? 'py-1.5' : 'py-2')}>
      {/* Headings */}
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isH1)} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} aria-label="Heading 1">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isH2)} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isH3)} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Heading 3">
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isH4)} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} aria-label="Heading 4">
        <Heading4 className="h-4 w-4" />
      </Button>
      <ToolbarDivider />

      {/* Inline format */}
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isParagraph)} onClick={() => editor.chain().focus().setParagraph().run()} aria-label="Paragraf">
        <Pilcrow className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isBold)} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isItalic)} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isUnderline)} onClick={() => editor.chain().focus().toggleUnderline().run()} aria-label="Underline">
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isStrike)} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isCode)} onClick={() => editor.chain().focus().toggleCode().run()} aria-label="Inline code">
        <Code className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isSubscript)} onClick={() => editor.chain().focus().toggleSubscript().run()} aria-label="Subscript">
        <Subscript className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isSuperscript)} onClick={() => editor.chain().focus().toggleSuperscript().run()} aria-label="Superscript">
        <Superscript className="h-4 w-4" />
      </Button>
      <ToolbarDivider />

      {/* Lists & blocks */}
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isBulletList)} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list">
        <List className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isOrderedList)} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Ordered list">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isTaskList)} onClick={() => editor.chain().focus().toggleTaskList().run()} aria-label="Task list">
        <ListTodo className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isBlockquote)} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="Quote">
        <Quote className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isCodeBlock)} onClick={() => editor.chain().focus().toggleCodeBlock().run()} aria-label="Code block">
        <Braces className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()} aria-label="Horizontal rule">
        <Minus className="h-4 w-4" />
      </Button>
      <ToolbarDivider />

      {/* Alignment */}
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isAlignLeft)} onClick={() => editor.chain().focus().setTextAlign('left').run()} aria-label="Align left">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isAlignCenter)} onClick={() => editor.chain().focus().setTextAlign('center').run()} aria-label="Align center">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isAlignRight)} onClick={() => editor.chain().focus().setTextAlign('right').run()} aria-label="Align right">
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isAlignJustify)} onClick={() => editor.chain().focus().setTextAlign('justify').run()} aria-label="Justify">
        <AlignJustify className="h-4 w-4" />
      </Button>
      <ToolbarDivider />

      {/* Font & color */}
      <select
        className="h-9 max-w-[120px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
        aria-label="Font family"
        value={toolbar.fontFamily}
        onChange={(e) => {
          const value = e.target.value
          if (!value) editor.chain().focus().unsetFontFamily().run()
          else editor.chain().focus().setFontFamily(value).run()
        }}>
        {TIPTAP_FONT_FAMILIES.map((font) => (
          <option key={font.label} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      <input
        type="color"
        className="h-9 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
        aria-label="Warna teks"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
      />
      <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().unsetColor().run()} aria-label="Hapus warna teks">
        <Eraser className="h-4 w-4" />
      </Button>
      {TIPTAP_HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          aria-label={`Sorot ${color.label}`}
          className={cn(
            'h-7 w-7 shrink-0 rounded-md border border-slate-200',
            toolbar.isHighlight && toolbar.highlightColor === color.value && 'ring-2 ring-primary ring-offset-1',
          )}
          style={{ backgroundColor: color.value }}
          onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
        />
      ))}
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isHighlight)} onClick={() => editor.chain().focus().unsetHighlight().run()} aria-label="Hapus sorotan">
        <Highlighter className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} aria-label="Hapus format">
        <RemoveFormatting className="h-4 w-4" />
      </Button>
      <ToolbarDivider />

      {/* Media */}
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isLink)} onClick={() => openMediaDialog('link')} aria-label="Tautan">
        <Link2 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => openMediaDialog('image')} aria-label="Gambar dari URL">
        <ImagePlus className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => openMediaDialog('youtube')} aria-label="YouTube">
        <Video className="h-4 w-4" />
      </Button>
      <ToolbarDivider />

      {/* Table */}
      <Button type="button" variant="ghost" size="sm" className={barBtn(toolbar.isTable)} onClick={insertTable} aria-label="Sisipkan tabel">
        <Table2 className="h-4 w-4" />
      </Button>
      {toolbar.isTable && (
        <>
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().addRowAfter().run()} aria-label="Tambah baris">
            <Rows2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().addColumnAfter().run()} aria-label="Tambah kolom">
            <Columns2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().deleteTable().run()} aria-label="Hapus tabel">
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
      <ToolbarDivider />

      {/* History */}
      <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().undo().run()} disabled={!toolbar.canUndo} aria-label="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().redo().run()} disabled={!toolbar.canRedo} aria-label="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>

    <TipTapMediaDialog
      open={mediaDialog.open}
      kind={mediaDialog.kind}
      initialUrl={mediaDialog.initialUrl}
      allowRemove={mediaDialog.allowRemove}
      onOpenChange={(open) => setMediaDialog((prev) => ({ ...prev, open }))}
      onConfirm={handleMediaConfirm}
      onRemove={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
    />
    </>
  )
}
