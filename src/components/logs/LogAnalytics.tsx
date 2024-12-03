"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, LineChart, PieChart } from '@/components/ui/charts'

interface LogAnalytics {
  logLevelStats: Array<{ key: string; doc_count: number }>
  topErrors: Array<{ key: string; doc_count: number }>
  logVolumeOverTime: Array<{
    key_as_string: string
    doc_count: number
    by_level: { buckets: Array<{ key: string; doc_count: number }> }
  }>
  topDags: Array<{
    key: string
    doc_count: number
    error_count: { doc_count: number }
  }>
  topEndpoints: Array<{
    key: string
    doc_count: number
    error_count: { doc_count: number }
  }>
  timeRange: string
}

export function LogAnalytics() {
  const [timeRange, setTimeRange] = useState('24h')
  const [analytics, setAnalytics] = useState<LogAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/logs/analytics?timeRange=${timeRange}`)
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading || !analytics) {
    return <div>Loading analytics...</div>
  }

  const logVolumeData = analytics.logVolumeOverTime.map((point) => ({
    timestamp: new Date(point.key_as_string).toLocaleString(),
    total: point.doc_count,
    ...Object.fromEntries(
      point.by_level.buckets.map((bucket) => [bucket.key, bucket.doc_count])
    ),
  }))

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last hour</SelectItem>
            <SelectItem value="6h">Last 6 hours</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Log Levels Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={analytics.logLevelStats.map((stat) => ({
                name: stat.key,
                value: stat.doc_count,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analytics.topErrors.map((error) => ({
                name: error.key,
                value: error.doc_count,
              }))}
              layout="vertical"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top DAGs by Error Count</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analytics.topDags.map((dag) => ({
                name: dag.key,
                total: dag.doc_count,
                errors: dag.error_count.doc_count,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Volume Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={logVolumeData}
            categories={['total', 'error', 'warn', 'info', 'debug']}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={analytics.topEndpoints.map((endpoint) => ({
              name: endpoint.key,
              total: endpoint.doc_count,
              errors: endpoint.error_count.doc_count,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
