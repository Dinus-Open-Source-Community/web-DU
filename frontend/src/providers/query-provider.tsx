'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Dengan ini, secara default, query akan di-cache selama 15 menit
                        staleTime: 60 * 1000 * 15, // 15 menit
                        retry: 3, // Retry jika gagal, max 3 kali
                        refetchOnWindowFocus: false, // Jangan refetch saat window focus di production (optional, bisa disesuaikan)
                        refetchOnMount: true, // Refetch on mount jika data sudah stale
                    },
                    mutations: {
                        retry: 1,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
