'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { EndpointsProvider } from '@/contexts/endpoints-context'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <EndpointsProvider>
        {children}
        <Toaster />
      </EndpointsProvider>
    </QueryClientProvider>
  )
}
