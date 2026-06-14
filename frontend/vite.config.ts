import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const TIPTAP_DEPS = [
  '@tiptap/react',
  '@tiptap/starter-kit',
  '@tiptap/extension-color',
  '@tiptap/extension-highlight',
  '@tiptap/extension-image',
  '@tiptap/extension-placeholder',
  '@tiptap/extension-subscript',
  '@tiptap/extension-superscript',
  '@tiptap/extension-table',
  '@tiptap/extension-table-row',
  '@tiptap/extension-table-cell',
  '@tiptap/extension-table-header',
  '@tiptap/extension-task-list',
  '@tiptap/extension-task-item',
  '@tiptap/extension-text-align',
  '@tiptap/extension-text-style',
  '@tiptap/extension-typography',
  '@tiptap/extension-character-count',
  '@tiptap/extension-youtube',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: TIPTAP_DEPS,
  },
})
