import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  plugins: [{
    name: 'test-auth-session',
    enforce: 'pre',
    transform(_code, id) {
      if (!id.endsWith('/providers/auth-provider.tsx')) return
      return `export function useAuth() { return { profile: { role: 'admin' } } }
        export function isAuthTokenExpired() { return false }`
    },
  }, {
    name: 'test-course-hooks',
    enforce: 'pre',
    transform(_code, id) {
      if (!id.endsWith('/hooks/use-course.ts')) return
      return `export function useInfiniteCourses() { return { courses: [], isLoading: false } }
        export function useCourseDetail() { return { data: undefined, isLoading: false } }`
    },
  }, {
    name: 'test-redeem-hooks',
    enforce: 'pre',
    transform(_code, id) {
      if (!id.endsWith('/hooks/use-redeem-codes.ts')) return
      return `export function useGenerateRedeemCode() { return { mutateAsync: async () => ({}) } }
        export function useRedeemCandidateStudents() { return { data: undefined } }`
    },
  }],
})
after(() => server.close())

test('expiry datetime input stays visible and keyboard accessible in Firefox', async () => {
  const { GenerateRedeemCodeDialog } = await server.ssrLoadModule(
    '/src/components/admin/redeem/GenerateRedeemCodeDialog.tsx',
  )
  const html = renderToString(createElement(GenerateRedeemCodeDialog, { open: true, initialCourseUid: 'course-uid' }))
  const input = html.match(/<input[^>]*id="expires-at"[^>]*>/)?.[0]

  assert.ok(input, 'datetime-local field must render')
  assert.match(input, /type="datetime-local"/)
  assert.doesNotMatch(input, /tabindex="-1"|aria-hidden="true"|pointer-events-none|opacity-0|size-px/)
  assert.match(input, /focus-visible:/, 'date field must show keyboard focus')
})
