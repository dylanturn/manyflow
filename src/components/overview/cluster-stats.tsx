'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrowserAirflowClient } from "@/lib/browser-airflow-client"
import { useEndpoints } from "@/contexts/endpoints-context"
import { useQuery, useQueryClient, useQueryCache } from "@tanstack/react-query"
import { useMemo } from "react"
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react"

export function ClusterStats() {
  const { endpoints } = useEndpoints()
  const queryClient = useQueryClient()

  // Memoize clients for each endpoint
  const clients = useMemo(() => 
    endpoints.reduce((acc, endpoint) => ({
      ...acc,
      [endpoint.id]: new BrowserAirflowClient(
        endpoint.id,
        endpoint.username,
        endpoint.password
      )
    }), {} as Record<string, BrowserAirflowClient>),
    [endpoints]
  )

  const endpointQueries = useQuery({
    queryKey: ["all-clusters-stats", endpoints.map(e => e.id)],
    queryFn: async () => {
      const allStats = await Promise.all(
        endpoints.map(async (endpoint) => {
          const client = clients[endpoint.id]
          try {
            const [healthData, dagsData] = await Promise.all([
              client.getHealth(),
              client.getDags()
            ])
            return {
              dags: dagsData.dags,
              health: healthData,
              name: endpoint.name
            }
          } catch (error) {
            console.error(`Failed to fetch stats from ${endpoint.name}:`, error)
            return {
              dags: [],
              health: null,
              name: endpoint.name
            }
          }
        })
      )
      return allStats
    },
    enabled: endpoints.length > 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 20000,
    retry: false,
    gcTime: 0, // Don't keep old data in cache
  })

  const stats = {
    totalDags: endpointQueries.data?.reduce((sum, endpoint) => sum + endpoint.dags.length, 0) ?? 0,
    activeDags: endpointQueries.data?.reduce((sum, endpoint) => 
      sum + endpoint.dags.filter(dag => dag.is_active).length, 0) ?? 0,
    pausedDags: endpointQueries.data?.reduce((sum, endpoint) => 
      sum + endpoint.dags.filter(dag => !dag.is_active).length, 0) ?? 0,
    healthyEndpoints: endpointQueries.data?.filter(endpoint => 
      endpoint.health?.metadatabase?.status === "healthy").length ?? 0,
    totalEndpoints: endpoints.length
  }

  if (endpoints.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DAGs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Add an endpoint to view stats
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
              Add an endpoint to view stats
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
              Add an endpoint to view stats
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
              Add an endpoint to view stats
            </p>
          </CardContent>
        </Card>
      </div>
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
            Total number of DAGs across all clusters
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
            Number of active DAGs across all clusters
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
            Number of paused DAGs across all clusters
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cluster Health</CardTitle>
          <CheckCircle2 className={`h-4 w-4 ${stats.healthyEndpoints === stats.totalEndpoints ? "text-green-500" : "text-red-500"}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.healthyEndpoints}/{stats.totalEndpoints}</div>
          <p className="text-xs text-muted-foreground">
            Number of healthy clusters
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
