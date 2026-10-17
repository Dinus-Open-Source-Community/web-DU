import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { bootstrapTheme } from './lib/theme/app-theme'
import MotionProvider from './providers/motion-provider.tsx'
import { QueryProvider } from './providers/query-providers.tsx'
import { AuthProvider } from './providers/auth-provider.tsx'
import { ThemeProvider } from './providers/theme-provider.tsx'
import { Toaster } from './components/ui/sonner.tsx'

bootstrapTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <MotionProvider>
            <App />
          </MotionProvider>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>,
)
