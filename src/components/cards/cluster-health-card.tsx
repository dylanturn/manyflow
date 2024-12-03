"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEndpoints } from "@/contexts/endpoints-context"
import { useQuery } from "@tanstack/react-query"
import { BrowserAirflowClient } from "@/lib/browser-airflow-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Database, Calendar, Zap } from "lucide-react"

export function ClusterHealthCard() {
  const { selectedEndpoint } = useEndpoints()
  const client = new BrowserAirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  )

  const { data: health, isLoading } = useQuery({
    queryKey: ["health", selectedEndpoint?.id],
    queryFn: () => client.getHealth(),
    enabled: !!selectedEndpoint,
    refetchInterval: 30000, // Refresh every 30 seconds
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
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
        return "bg-green-500/15 text-green-500"
      case "unhealthy":
        return "bg-red-500/15 text-red-500"
      default:
        return "bg-yellow-500/15 text-yellow-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cluster Health</CardTitle>
        <CardDescription>Current status of cluster components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5" />
              <div>
                <div className="font-medium">Metadata Database</div>
                <div className="text-sm text-muted-foreground">
                  {health?.metadatabase.error || "No issues reported"}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(health?.metadatabase.status ?? "unknown")}>
              {health?.metadatabase.status ?? "Unknown"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <div>
                <div className="font-medium">Scheduler</div>
                <div className="text-sm text-muted-foreground">
                  {health?.scheduler.error || "Last heartbeat: " + (health?.scheduler.latest_scheduler_heartbeat ?? "N/A")}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(health?.scheduler.status ?? "unknown")}>
              {health?.scheduler.status ?? "Unknown"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5" />
              <div>
                <div className="font-medium">Triggerer</div>
                <div className="text-sm text-muted-foreground">
                  {health?.triggerer.error || "Last heartbeat: " + (health?.triggerer.latest_triggerer_heartbeat ?? "N/A")}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(health?.triggerer.status ?? "unknown")}>
              {health?.triggerer.status ?? "Unknown"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
