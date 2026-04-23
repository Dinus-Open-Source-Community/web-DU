'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Suspense dipakai lewat useSuspenseQuery/useSuspenseInfiniteQuery di level hook.
            staleTime: 60 * 1000 * 15,
            gcTime: 60 * 1000 * 30,
            retry: 2,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
