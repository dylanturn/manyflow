"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEndpoints } from "@/contexts/endpoints-context"
import { useQuery } from "@tanstack/react-query"
import { AirflowClient } from "@/lib/airflow-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity } from "lucide-react"

export function ActiveDagsCard() {
  const { selectedEndpoint } = useEndpoints()
  const client = new AirflowClient(
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
          <CardTitle className="tracking-tight text-sm font-medium">Active DAGs</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardContent>
      </Card>
    )
  }

  const activeDags = dags?.dags.filter(dag => dag.is_active).length ?? 0

  return (
    <Card>
      <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tracking-tight text-sm font-medium">Active DAGs</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-2xl font-bold">{activeDags}</div>
        <p className="text-xs text-muted-foreground">Number of active DAGs</p>
      </CardContent>
    </Card>
  )
}
