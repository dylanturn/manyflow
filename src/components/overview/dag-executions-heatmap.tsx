'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEndpoints } from '@/contexts/endpoints-context'
import { BrowserAirflowClient } from '@/lib/browser-airflow-client'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { showToast } from '@/lib/toast'
import { subDays, format, eachDayOfInterval, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface DagExecution {
  date: string
  total: number
  success: number
  failed: number
  running: number
}

const stateColors = {
  success: 'rgb(34, 197, 94)', // green
  failed: 'rgb(239, 68, 68)',  // red
  running: 'rgb(59, 130, 246)', // blue
}

export function DagExecutionsHeatmap() {
  const { selectedEndpoint } = useEndpoints()
  const client = useMemo(() => new BrowserAirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  ), [selectedEndpoint?.id, selectedEndpoint?.username, selectedEndpoint?.password])

  const dateRange = useMemo(() => {
    const endDate = new Date()
    const startDate = subDays(endDate, 30)
    return { startDate, endDate }
  }, [])

  const { data: executionData, isLoading, isFetching } = useQuery({
    queryKey: ['dag-executions', selectedEndpoint?.id, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      try {
        // Fetch all DAG runs in the date range
        const response = await client.getDagRuns(undefined, {
          limit: 1000,  // Increased limit to get more runs
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        })

        // Create a map of dates to execution counts
        const executionsByDate = new Map<string, DagExecution>()
        
        // Initialize all dates in the range
        eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate }).forEach(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          executionsByDate.set(dateStr, {
            date: dateStr,
            total: 0,
            success: 0,
            failed: 0,
            running: 0
          })
        })

        // Count executions by date and state
        response.dag_runs.forEach(run => {
          const date = format(new Date(run.start_date), 'yyyy-MM-dd')
          const execution = executionsByDate.get(date) || {
            date,
            total: 0,
            success: 0,
            failed: 0,
            running: 0
          }

          execution.total++
          if (run.state === 'success') execution.success++
          else if (run.state === 'failed') execution.failed++
          else if (run.state === 'running') execution.running++

          executionsByDate.set(date, execution)
        })

        return Array.from(executionsByDate.values())
      } catch (error) {
        showToast.error('Failed to fetch DAG executions', error as Error)
        return []
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    enabled: !!selectedEndpoint?.id,
    staleTime: 20000,
    retry: false,
  })

  if (!selectedEndpoint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DAG Executions</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Please select an endpoint</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DAG Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const maxExecutions = Math.max(...(executionData?.map(d => d.total) || [0]))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>DAG Executions</CardTitle>
          {isFetching && <span className="text-sm text-muted-foreground">(Refreshing...)</span>}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-500/10">Success</Badge>
          <Badge variant="outline" className="bg-red-500/10">Failed</Badge>
          <Badge variant="outline" className="bg-blue-500/10">Running</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 p-2">
          {executionData?.map((day) => {
            const date = parseISO(day.date)
            return (
              <div
                key={day.date}
                className="aspect-square rounded-sm flex items-center justify-center text-xs relative overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb'
                }}
                title={`${format(date, 'PPP')}
Total Executions: ${day.total}
Successful: ${day.success}
Failed: ${day.failed}
Running: ${day.running}`}
              >
                {day.total > 0 && (
                  <>
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top,
                          ${stateColors.success} ${(day.success / day.total) * 100}%,
                          ${stateColors.failed} ${(day.success / day.total) * 100}% ${((day.success + day.failed) / day.total) * 100}%,
                          ${stateColors.running} ${((day.success + day.failed) / day.total) * 100}% ${((day.success + day.failed + day.running) / day.total) * 100}%,
                          transparent ${((day.success + day.failed + day.running) / day.total) * 100}%
                        )`,
                        opacity: day.total / maxExecutions
                      }}
                    />
                    <span className="z-10 text-white font-medium drop-shadow-sm">
                      {day.total}
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
