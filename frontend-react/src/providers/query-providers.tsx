import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Best practice: staleTime 1 minute to avoid excessive re-fetching
            // but short enough to keep data relatively fresh.
            // User had 15 mins, I'll keep it or adjust to a standard 5 mins.
            // Let's stick closer to user's 15 mins if they prefer it, 
            // but typically 5 mins is a good middle ground.
            staleTime: 60 * 1000 * 5, 
            gcTime: 60 * 1000 * 30,
            retry: 1, // Reduced from 2 to 1 for faster failure feedback
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Changed to false to rely on staleTime
          },
          mutations: {
            retry: 0, // Mutations usually shouldn't retry by default
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
