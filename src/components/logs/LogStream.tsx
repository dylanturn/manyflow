"use client"

import { useEffect, useRef } from 'react'
import { useLogStream } from '@/hooks/use-log-stream'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlayIcon, PauseIcon, TrashIcon } from '@radix-ui/react-icons'
import { showToast } from '@/lib/toast'

interface LogStreamProps {
  initialQuery?: string
  initialLevel?: string
  dagId?: string
  taskId?: string
  endpointId?: string
}

export function LogStream({
  initialQuery = '*',
  initialLevel,
  dagId,
  taskId,
  endpointId,
}: LogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const {
    logs,
    error,
    isConnected,
    disconnect,
    reconnect,
  } = useLogStream({
    query: initialQuery,
    level: initialLevel,
    dagId,
    taskId,
    endpointId,
    onConnect: () => {
      showToast.success('Connected to log stream')
    },
    onDisconnect: () => {
      showToast.error('Disconnected from log stream')
    },
    onError: (error) => {
      showToast.error('Log stream error', error as Error)
    }
  })

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'destructive'
      case 'warn':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? 'success' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          {error && (
            <Badge variant="destructive">
              {error}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => isConnected ? disconnect() : reconnect()}
          >
            {isConnected ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              disconnect()
              reconnect()
            }}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px] rounded-md border" ref={scrollRef}>
        <div className="space-y-2 p-4">
          {logs.map((log, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm">{log.message}</p>
                  {log.dagId && (
                    <div className="flex space-x-2 text-xs text-muted-foreground">
                      <span>DAG: {log.dagId}</span>
                      {log.taskId && <span>Task: {log.taskId}</span>}
                    </div>
                  )}
                </div>
                <Badge variant={getLevelColor(log.level)}>
                  {log.level}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
