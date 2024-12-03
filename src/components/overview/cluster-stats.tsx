'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AirflowClient } from "@/lib/airflow-client"
import { useEndpoints } from "@/contexts/endpoints-context"
import { useQuery } from "@tanstack/react-query"
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react"

export function ClusterStats() {
  const { selectedEndpoint } = useEndpoints()
  const client = new AirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  )

  const { data: healthData } = useQuery({
    queryKey: ["health", selectedEndpoint?.id],
    queryFn: () => client.getHealth(),
    enabled: !!selectedEndpoint,
  })

  const { data: dagsData } = useQuery({
    queryKey: ["dags", selectedEndpoint?.id],
    queryFn: () => client.getDags(),
    enabled: !!selectedEndpoint,
  })

  const stats = {
    totalDags: dagsData?.dags?.length ?? 0,
    activeDags: dagsData?.dags?.filter((dag) => dag.is_active).length ?? 0,
    pausedDags: dagsData?.dags?.filter((dag) => !dag.is_active).length ?? 0,
    clusterHealth: healthData?.metadatabase?.status === "healthy" ? "Healthy" : "Unhealthy",
  }

  if (!selectedEndpoint) {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DAGs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Select an endpoint to view stats
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active DAGs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Select an endpoint to view stats
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused DAGs</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Select an endpoint to view stats
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cluster Health</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Select an endpoint to view stats
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total DAGs</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDags}</div>
          <p className="text-xs text-muted-foreground">
            Total number of DAGs in the cluster
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active DAGs</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeDags}</div>
          <p className="text-xs text-muted-foreground">
            Number of active DAGs
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paused DAGs</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pausedDags}</div>
          <p className="text-xs text-muted-foreground">
            Number of paused DAGs
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cluster Health</CardTitle>
          <CheckCircle2 className={`h-4 w-4 ${stats.clusterHealth === "Healthy" ? "text-green-500" : "text-red-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.clusterHealth === "Healthy" ? "text-green-500" : "text-red-500"}`}>
            {stats.clusterHealth}
          </div>
          <p className="text-xs text-muted-foreground">
            Current cluster health status
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
