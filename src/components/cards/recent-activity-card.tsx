"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEndpoints } from "@/contexts/endpoints-context"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { BrowserAirflowClient } from "@/lib/browser-airflow-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

export function RecentActivityCard() {
  const { selectedEndpoint } = useEndpoints()
  const client = useMemo(() => new BrowserAirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  ), [selectedEndpoint?.id, selectedEndpoint?.username, selectedEndpoint?.password])

  const { data: recentDags, isLoading } = useQuery({
    queryKey: ["recent-dags", selectedEndpoint?.id],
    queryFn: async () => {
      // Get all DAG runs in a single call
      const runs = await client.getDagRuns(undefined, {
        limit: 5,  // Only get the 5 most recent runs
        orderBy: "-start_date"  // Order by start date descending
      })
      
      return runs.dag_runs.map(run => ({
        dagId: run.dag_id,
        runId: run.dag_run_id,
        startDate: run.start_date,
        state: run.state,
      }))
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: false,
    enabled: !!selectedEndpoint?.id,
    staleTime: 20000, // Consider data fresh for 20 seconds,
    retry: false, // Don't retry on failure
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-24" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "success":
        return "bg-green-500/15 text-green-500"
      case "failed":
        return "bg-red-500/15 text-red-500"
      case "running":
        return "bg-blue-500/15 text-blue-500"
      default:
        return "bg-yellow-500/15 text-yellow-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest DAG runs</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {recentDags?.map((run) => (
              <div
                key={`${run.dagId}-${run.runId}`}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary"
              >
                <div>
                  <div className="font-medium">{run.dagId}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(run.startDate), { addSuffix: true })}
                  </div>
                </div>
                <Badge className={getStateColor(run.state)}>
                  {run.state}
                </Badge>
              </div>
            ))}
            {(!recentDags || recentDags.length === 0) && (
              <div className="text-center text-muted-foreground py-8">
                No recent activity
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
