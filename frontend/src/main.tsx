import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MotionProvider from './providers/motion-provider.tsx'
import { QueryProvider } from './providers/query-providers.tsx'
import { AuthProvider } from './providers/auth-provider.tsx'
import { Toaster } from './components/ui/sonner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <MotionProvider>
          <App />
        </MotionProvider>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
)
