"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEndpoints } from "@/contexts/endpoints-context"
import { useQuery } from "@tanstack/react-query"
import { BrowserAirflowClient } from "@/lib/browser-airflow-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"

export function DagStatusCard() {
  const { selectedEndpoint } = useEndpoints()
  const client = new BrowserAirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  )

  const { data: dags, isLoading } = useQuery({
    queryKey: ["dags", selectedEndpoint?.id],
    queryFn: () => client.getDags(),
    enabled: !!selectedEndpoint,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tracking-tight text-sm font-medium">Total DAGs</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardContent>
      </Card>
    )
  }

  const totalDags = dags?.dags.length ?? 0

  return (
    <Card>
      <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tracking-tight text-sm font-medium">Total DAGs</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-2xl font-bold">{totalDags}</div>
        <p className="text-xs text-muted-foreground">Total number of DAGs in the cluster</p>
      </CardContent>
    </Card>
  )
}
