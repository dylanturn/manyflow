"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDebounce } from '@/hooks/use-debounce'

interface Log {
  _id?: string
  timestamp: string
  level: string
  message: string
  dagId?: string
  taskId?: string
  endpointId?: string
}

export function LogSearch() {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const debouncedQuery = useDebounce(query, 500)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        query: debouncedQuery || '*',
        from: String(page * 50),
        size: '50',
      })

      if (level && level !== 'all') params.append('level', level)
      if (dateRange?.from) params.append('startTime', dateRange.from.toISOString())
      if (dateRange?.to) params.append('endTime', dateRange.to.toISOString())

      const response = await fetch(`/api/logs/search?${params}`)
      const data = await response.json()
      setLogs(data?.hits || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [debouncedQuery, level, dateRange, page])

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
    <div className="space-y-4 p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <Input
            placeholder="Search logs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerWithRange
          date={dateRange}
          setDate={setDateRange}
        />
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log._id || `${log.timestamp}-${log.dagId}-${log.taskId}-${Math.random()}`} className="p-4">
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

      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={logs.length < 50}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
