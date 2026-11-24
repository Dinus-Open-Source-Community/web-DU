import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  plugins: [{
    name: 'test-auth-session',
    enforce: 'pre',
    transform(_code, id) {
      if (!id.endsWith('/providers/auth-provider.tsx')) return
      return `export function useAuth() { return globalThis.__redeemTestAuth }
        export function isAuthTokenExpired() { return false }`
    },
  }],
})
after(() => {
  delete globalThis.__redeemTestAuth
  return server.close()
})

const gateways = await server.ssrLoadModule('/src/pages/dashboard/Gateways.tsx')
const { redeemCodeKeys, courseKeys } = await server.ssrLoadModule('/src/hooks/query-keys.ts')

function session(role) {
  const user = { uid: 'mentor-uid', name: 'Mentor', email: 'mentor@example.com', role }
  globalThis.__redeemTestAuth = {
    role, user, profile: user, isLoading: false, isAuthenticated: true, signOut() {},
  }
}

function renderMentor({ items = [], error = false, loading = false } = {}) {
  session('mentor')
  assert.equal(typeof gateways.DashboardRedeemCodesGateway, 'function',
    'redeem route must dispatch mentor to mentor page rather than admin page')
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
  const params = { page: 1, per_page: 10, course_uid: undefined, is_active: undefined }
  if (!loading) {
    client.setQueryData(redeemCodeKeys.list(params), {
      items, meta: { current_page: 1, per_page: 10, total: items.length, total_pages: 1 },
    })
  }
  if (error) {
    client.getQueryCache().find({ queryKey: redeemCodeKeys.list(params) }).setState({
      status: 'error', error: new Error('Redeem API unavailable'),
    })
  }
  client.setQueryData(courseKeys.adminList({ mentor_id: 'mentor-uid' }), {
    courses: [],
  })
  try {
    return renderToString(createElement(MemoryRouter, { initialEntries: ['/dashboard/redeem-codes'] },
      createElement(QueryClientProvider, { client },
        createElement(gateways.DashboardRedeemCodesGateway),
      ),
    ))
  } finally {
    client.clear()
  }
}

test('mentor redeem route renders mentor navigation and creation without admin deletion', () => {
  const html = renderMentor({ items: [{
    uid: 'code-uid', code: 'MENTOR-CODE', course_uid: 'course-uid', course_title: 'Assigned course',
    max_uses: 2, used_count: 1, is_active: true, created_by_uid: 'mentor-uid',
    created_at: '2026-11-17T10:00:00Z',
  }] })
  assert.match(html, /Kode Redeem/)
  assert.match(html, /Buat Kode Redeem/)
  assert.match(html, /MENTOR-CODE/)
  assert.match(html, /Assigned course/)
  assert.doesNotMatch(html, /Administrator|Manajemen Pengguna/)
  assert.match(html, /Hapus kode/)
})

test('mentor sees actionable empty state', () => {
  assert.match(renderMentor(), /Belum ada kode redeem/)
})

test('mentor sees loading state while codes load', () => {
  assert.match(renderMentor({ loading: true }), /Memuat kode redeem/)
})

test('mentor sees API failure with retry instead of empty state', () => {
  const html = renderMentor({ error: true })
  assert.match(html, /Redeem API unavailable/)
  assert.match(html, /Coba lagi/)
  assert.doesNotMatch(html, /Belum ada kode redeem/)
})

test('admin and super admin retain admin page; students cannot enter management', () => {
  assert.equal(typeof gateways.DashboardRedeemCodesGateway, 'function')
  for (const role of ['admin', 'super_admin']) {
    session(role)
    assert.equal(gateways.DashboardRedeemCodesGateway().type.name, 'AdminRedeemCodesPage')
  }
  session('student')
  assert.equal(gateways.DashboardRedeemCodesGateway().props.to, '/dashboard')
})
