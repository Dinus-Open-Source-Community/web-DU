import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true } })
after(() => server.close())
const { useMentorDashboard } = await server.ssrLoadModule('/src/hooks/use-mentor-dashboard.ts')

test('uncached calendar range keeps loaded schedules so first view change does not unmount calendar', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })
  const month = { from: '2026-11-01', to: '2026-12-12' }
  const week = { from: '2026-11-15', to: '2026-11-21' }
  const monthSchedules = [{ uid: 'month-session' }]
  const weekSchedules = [{ uid: 'week-session' }]

  function DashboardQuery({ range }) {
    useMentorDashboard(range)
    return null
  }

  function getScheduleOptions(range) {
    renderToString(createElement(QueryClientProvider, { client },
      createElement(DashboardQuery, { range }),
    ))
    return client.getQueryCache().getAll().find((query) =>
      query.queryKey.some((part) => part?.from === range.from && part?.to === range.to),
    ).options
  }

  const monthOptions = getScheduleOptions(month)
  client.setQueryData(monthOptions.queryKey, monthSchedules)
  const observer = new QueryObserver(client, monthOptions)
  const unsubscribe = observer.subscribe(() => {})

  let finishFetch
  const response = new Promise((resolve) => { finishFetch = resolve })
  try {
    observer.setOptions({ ...getScheduleOptions(week), queryFn: () => response })
    const fetching = observer.getCurrentResult()
    assert.equal(fetching.isFetching, true)
    assert.equal(fetching.isLoading, false, 'range fetch must not replace calendar with skeleton')
    assert.deepEqual(fetching.data, monthSchedules)

    finishFetch(weekSchedules)
    await response
    await new Promise((resolve) => setImmediate(resolve))
    assert.deepEqual(observer.getCurrentResult().data, weekSchedules)
    assert.equal(observer.getCurrentResult().isPlaceholderData, false)
  } finally {
    finishFetch(weekSchedules)
    unsubscribe()
    client.clear()
  }
})
