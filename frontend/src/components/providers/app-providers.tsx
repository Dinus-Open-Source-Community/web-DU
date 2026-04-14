"use client"

import type { ReactNode } from "react"
import { Toaster } from "sonner"
import { ConfirmProvider } from "@/components/feedback/ConfirmProvider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      {children}
      <Toaster
        richColors
        position="top-center"
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-sans rounded-xl border border-border shadow-none",
            title: "font-medium tracking-tight",
            description: "text-muted-foreground",
          },
        }}
      />
    </ConfirmProvider>
  )
}
