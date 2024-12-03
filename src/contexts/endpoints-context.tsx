"use client"

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { AirflowHealth } from "@/types/airflow"

export interface Endpoint {
  id: string
  name: string
  url: string
  username: string
  password: string
  isActive: boolean
  health?: AirflowHealth
}

interface EndpointsContextType {
  endpoints: Endpoint[]
  selectedEndpoint: Endpoint | null
  addEndpoint: (endpoint: Omit<Endpoint, "id" | "isActive">) => Promise<void>
  updateEndpoint: (id: string, endpoint: Partial<Endpoint>) => Promise<void>
  deleteEndpoint: (id: string) => Promise<void>
  refreshHealth: (id: string) => Promise<void>
  selectEndpoint: (id: string) => void
}

const EndpointsContext = createContext<EndpointsContextType | undefined>(undefined)

export function EndpointsProvider({ children }: { children: ReactNode }) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)

  const fetchEndpoints = useCallback(async () => {
    try {
      const response = await fetch('/api/endpoints')
      if (!response.ok) {
        throw new Error('Failed to fetch endpoints')
      }
      const data = await response.json()
      setEndpoints(data.endpoints)
      
      // Select the first active endpoint if none is selected
      if (!selectedEndpoint && data.endpoints.length > 0) {
        const activeEndpoint = data.endpoints.find((e: Endpoint) => e.isActive)
        if (activeEndpoint) {
          setSelectedEndpoint(activeEndpoint)
        }
      }
    } catch (error) {
      console.error('Failed to fetch endpoints:', error)
      toast.error('Failed to fetch endpoints')
    }
  }, [selectedEndpoint])

  const addEndpoint = useCallback(async (endpoint: Omit<Endpoint, "id" | "isActive">) => {
    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endpoint),
      })

      if (!response.ok) {
        throw new Error('Failed to add endpoint')
      }

      const data = await response.json()
      setEndpoints((prev) => [...prev, data.endpoint])
      toast.success('Endpoint added successfully')
    } catch (error) {
      console.error('Failed to add endpoint:', error)
      toast.error('Failed to add endpoint')
      throw error
    }
  }, [])

  const updateEndpoint = useCallback(async (id: string, update: Partial<Endpoint>) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      })

      if (!response.ok) {
        throw new Error('Failed to update endpoint')
      }

      setEndpoints((prev) =>
        prev.map((endpoint) =>
          endpoint.id === id ? { ...endpoint, ...update } : endpoint
        )
      )
      toast.success('Endpoint updated successfully')
    } catch (error) {
      console.error('Failed to update endpoint:', error)
      toast.error('Failed to update endpoint')
      throw error
    }
  }, [])

  const deleteEndpoint = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete endpoint')
      }

      setEndpoints((prev) => prev.filter((endpoint) => endpoint.id !== id))
      toast.success('Endpoint deleted successfully')
    } catch (error) {
      console.error('Failed to delete endpoint:', error)
      toast.error('Failed to delete endpoint')
      throw error
    }
  }, [])

  const refreshHealth = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/endpoints/${id}/health`)
      if (!response.ok) {
        throw new Error('Failed to fetch health')
      }

      const health = await response.json()
      setEndpoints((prev) =>
        prev.map((endpoint) =>
          endpoint.id === id
            ? {
                ...endpoint,
                isActive: true,
                health,
              }
            : endpoint
        )
      )
    } catch (error) {
      console.error('Failed to refresh health:', error)
      setEndpoints((prev) =>
        prev.map((endpoint) =>
          endpoint.id === id
            ? {
                ...endpoint,
                isActive: false,
                health: undefined,
              }
            : endpoint
        )
      )
    }
  }, [])

  const selectEndpoint = useCallback((id: string) => {
    const endpoint = endpoints.find(e => e.id === id)
    if (endpoint) {
      setSelectedEndpoint(endpoint)
    }
  }, [endpoints])

  useEffect(() => {
    fetchEndpoints()
  }, [fetchEndpoints])

  // Refresh health status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      endpoints.forEach((endpoint) => refreshHealth(endpoint.id))
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [endpoints, refreshHealth])

  return (
    <EndpointsContext.Provider
      value={{
        endpoints,
        selectedEndpoint,
        addEndpoint,
        updateEndpoint,
        deleteEndpoint,
        refreshHealth,
        selectEndpoint,
      }}
    >
      {children}
    </EndpointsContext.Provider>
  )
}

export function useEndpoints() {
  const context = useContext(EndpointsContext)
  if (context === undefined) {
    throw new Error('useEndpoints must be used within an EndpointsProvider')
  }
  return context
}
