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
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 3000,
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    optimizeDeps: {
      include: TIPTAP_DEPS,
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'tiptap', test: /node_modules[\\/](?:@tiptap|prosemirror)[\\/]/, priority: 20, maxSize: 450_000 },
              { name: 'recharts', test: /node_modules[\\/](?:recharts|d3-[^\\/]+)[\\/]/, priority: 20 },
              { name: 'query', test: /node_modules[\\/]@tanstack[\\/]react-query[\\/]/, priority: 20 },
              { name: 'router', test: /node_modules[\\/]react-router[^\\/]*[\\/]/, priority: 20 },
              { name: 'radix', test: /node_modules[\\/](?:radix-ui|@radix-ui)[\\/]/, priority: 20 },
              { name: 'icons', test: /node_modules[\\/]lucide-react[\\/]/, priority: 20 },
              { name: 'vendor', test: /node_modules[\\/]/, priority: 10, maxSize: 450_000 },
            ],
          },
        },
      },
    },
  }
})
