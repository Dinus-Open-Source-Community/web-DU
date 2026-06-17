import { defineConfig, loadEnv } from 'vite'
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

function manualVendorChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined

  if (id.includes('@tiptap') || id.includes('prosemirror')) return 'tiptap'
  if (id.includes('recharts') || id.includes('d3-')) return 'recharts'
  if (id.includes('@lottiefiles')) return 'lottie'
  if (id.includes('@tanstack/react-query')) return 'query'
  if (id.includes('react-router')) return 'router'
  if (id.includes('radix-ui') || id.includes('@radix-ui')) return 'radix'
  if (id.includes('lucide-react')) return 'icons'

  return 'vendor'
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiOrigin = new URL(env.VITE_BACKEND_URL || 'http://localhost:8080').origin

  return {
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'html-preconnect-api',
        transformIndexHtml(html) {
          return html.replace(
            '</head>',
            `    <link rel="preconnect" href="${apiOrigin}" crossorigin />\n    <link rel="dns-prefetch" href="${apiOrigin}" />\n    <script type="speculationrules">\n      {\n        "prerender": [{\n          "where": { "href_matches": "/courses*" },\n          "eagerness": "moderate"\n        }]\n      }\n    </script>\n  </head>`,
          )
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: TIPTAP_DEPS,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: manualVendorChunk,
        },
      },
    },
  }
})
