"use client"

import { EndpointsProvider } from "@/contexts/endpoints-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EndpointsProvider>{children}</EndpointsProvider>
}
