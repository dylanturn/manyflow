import { useState, useEffect, useRef } from 'react'

interface Log {
  timestamp: string
  level: string
  message: string
  dagId?: string
  taskId?: string
  endpointId?: string
}

interface LogStreamOptions {
  query?: string
  level?: string
  dagId?: string
  taskId?: string
  endpointId?: string
  maxLogs?: number
}

export function useLogStream({
  query = '*',
  level,
  dagId,
  taskId,
  endpointId,
  maxLogs = 1000,
}: LogStreamOptions = {}) {
  const [logs, setLogs] = useState<Log[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Build URL with query parameters
    const params = new URLSearchParams({ query })
    if (level) params.append('level', level)
    if (dagId) params.append('dagId', dagId)
    if (taskId) params.append('taskId', taskId)
    if (endpointId) params.append('endpointId', endpointId)

    // Create EventSource
    const eventSource = new EventSource(`/api/logs/stream?${params}`)
    eventSourceRef.current = eventSource

    // Set up event handlers
    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const newLogs = JSON.parse(event.data)
        setLogs((currentLogs) => {
          const updatedLogs = [...currentLogs, ...newLogs]
          // Keep only the most recent logs if we exceed maxLogs
          return updatedLogs.slice(-maxLogs)
        })
      } catch (error) {
        console.error('Error parsing log data:', error)
      }
    }

    eventSource.onerror = (error) => {
      setError('Error connecting to log stream')
      setIsConnected(false)
      eventSource.close()
    }

    // Clean up on unmount
    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [query, level, dagId, taskId, endpointId, maxLogs])

  // Function to manually disconnect
  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      setIsConnected(false)
    }
  }

  // Function to manually reconnect
  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    setLogs([]) // Clear existing logs
    setError(null)
    // The useEffect will automatically create a new connection
  }

  return {
    logs,
    error,
    isConnected,
    disconnect,
    reconnect,
  }
}
