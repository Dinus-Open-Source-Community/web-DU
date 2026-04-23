'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { ConfirmProvider } from '@/components/feedback/ConfirmProvider'
import { AuthProvider } from '@/providers/auth-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConfirmProvider>
        {children}
        <Toaster
          richColors
          position="top-center"
          closeButton
          toastOptions={{
            classNames: {
              toast: 'font-sans rounded-xl border border-border shadow-none',
              title: 'font-medium tracking-tight',
              description: 'text-muted-foreground',
            },
          }}
        />
      </ConfirmProvider>
    </AuthProvider>
  )
}
