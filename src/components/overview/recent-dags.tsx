'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEndpoints } from "@/contexts/endpoints-context"
import { AirflowClient } from "@/lib/airflow-client"
import { useQuery } from "@tanstack/react-query"
import { CalendarDays } from "lucide-react"
import Link from "next/link"

export function RecentDags() {
  const { selectedEndpoint } = useEndpoints()
  const client = new AirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  )

  const { data: dagsData } = useQuery({
    queryKey: ["recent-dags", selectedEndpoint?.id],
    queryFn: () => client.getDags(5, 0),
    enabled: !!selectedEndpoint,
  })

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent DAGs</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!selectedEndpoint ? (
          <p className="text-sm text-muted-foreground">Please select an endpoint to view DAGs</p>
        ) : dagsData?.dags?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No DAGs found</p>
        ) : (
          <div className="space-y-4">
            {dagsData?.dags?.slice(0, 5).map((dag) => (
              <div key={dag.dag_id} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    <Link href="/dags" className="hover:underline">
                      {dag.dag_id}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Owners: {dag.owners.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
