'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEndpoints } from "@/contexts/endpoints-context"
import { BrowserAirflowClient } from "@/lib/browser-airflow-client"
import { useQuery } from "@tanstack/react-query"
import { CalendarDays } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export function RecentDags() {
  const { endpoints } = useEndpoints()

  const { data: allDags, isLoading } = useQuery({
    queryKey: ["recent-dags-all"],
    queryFn: async () => {
      const allDagsData = await Promise.all(
        endpoints.map(async (endpoint) => {
          const client = new BrowserAirflowClient(
            endpoint.id,
            endpoint.username,
            endpoint.password
          )
          try {
            const dags = await client.getDags()
            return dags.dags.map(dag => ({
              ...dag,
              cluster: endpoint.name
            }))
          } catch (error) {
            console.error(`Failed to fetch DAGs from ${endpoint.name}:`, error)
            return []
          }
        })
      )
      return allDagsData.flat()
    },
    enabled: endpoints.length > 0
  })

  if (endpoints.length === 0) {
    return (
      <Card className="col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent DAGs</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please add an endpoint to view DAGs</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent DAGs</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent DAGs</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {allDags?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No DAGs found</p>
        ) : (
          <div className="space-y-4">
            {allDags?.slice(0, 5).map((dag) => (
              <div key={`${dag.cluster}-${dag.dag_id}`} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    <Link href="/dags" className="hover:underline">
                      {dag.dag_id}
                    </Link>
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Owners: {dag.owners.join(", ")}
                    </p>
                    <Badge variant="outline">{dag.cluster}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
