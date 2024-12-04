'use client'

import { useEndpoints } from "@/contexts/endpoints-context"
import { BrowserAirflowClient } from "@/lib/browser-airflow-client"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { showToast } from "@/lib/toast"

export function RecentDags() {
  const { selectedEndpoint } = useEndpoints()
  const client = new BrowserAirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  )

  const { data: dagRuns, isLoading } = useQuery({
    queryKey: ["running-dags", selectedEndpoint?.id],
    queryFn: async () => {
      try {
        const response = await client.getDagRuns(undefined, {
          state: "running"
        })
        return response.dag_runs
      } catch (error) {
        showToast.error("Failed to fetch running DAGs", error as Error)
        //throw error
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: false,
    enabled: !!selectedEndpoint?.id,
    staleTime: 20000, // Consider data fresh for 20 seconds
  })

  if (!selectedEndpoint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Running DAGs</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Please select an endpoint</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Running DAGs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Running DAGs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {dagRuns && dagRuns.length > 0 ? (
            <div className="space-y-2">
              {dagRuns.map((run) => (
                <Link
                  key={run.dag_run_id}
                  href={`/dags/${run.dag_id}`}
                  className="block"
                >
                  <div className="rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{run.dag_id}</div>
                      <Badge>Running</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Started: {new Date(run.start_date).toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No running DAGs</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
