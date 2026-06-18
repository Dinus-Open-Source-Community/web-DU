/**
 * Extensions Tiptap untuk editor WYSIWYG.
 * Output HTML disimpan di envelope `content` dengan `contentType: "tiptap"`.
 * Lihat `LessonDeliveryType` (`content_type`) vs `RichTextContentFormat` di types.
 */
import StarterKit from '@tiptap/starter-kit'
import YoutubeExtension from '@tiptap/extension-youtube'
import TiptapImage from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle, FontFamily } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import type { Extensions } from '@tiptap/core'

import { resolveSafeExternalHref } from '@/lib/security/safe-external-url'

const DEFAULT_PLACEHOLDER =
  'Tulis modul dan konten kursus di sini. Gunakan toolbar untuk format dan sisipkan video YouTube.'

export const TIPTAP_FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
] as const

export const TIPTAP_HIGHLIGHT_COLORS = [
  { label: 'Kuning', value: '#fef08a' },
  { label: 'Hijau', value: '#bbf7d0' },
  { label: 'Biru', value: '#bfdbfe' },
  { label: 'Merah muda', value: '#fbcfe8' },
] as const

export function createTiptapExtensions(placeholder = DEFAULT_PLACEHOLDER): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      bulletList: { keepMarks: true, keepAttributes: true },
      orderedList: { keepMarks: true, keepAttributes: true },
      codeBlock: { HTMLAttributes: { class: 'tiptap-code-block' } },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        isAllowedUri: (url, ctx) => {
          if (resolveSafeExternalHref(url) !== null) return true
          return ctx.defaultValidate(url)
        },
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'tiptap-link',
        },
      },
      underline: {},
    }),
    TiptapImage.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: 'tiptap-image rounded-lg max-w-full h-auto',
      },
    }),
    YoutubeExtension.configure({
      width: 640,
      height: 360,
      nocookie: true,
      HTMLAttributes: {
        class: 'tiptap-youtube rounded-lg overflow-hidden max-w-full',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
    }),
    TextStyle,
    FontFamily,
    Color,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: 'tiptap-table' },
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList.configure({ HTMLAttributes: { class: 'tiptap-task-list' } }),
    TaskItem.configure({ nested: true, HTMLAttributes: { class: 'tiptap-task-item' } }),
    Typography,
    CharacterCount,
    Placeholder.configure({ placeholder }),
  ]
}
