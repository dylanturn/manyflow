"use client"

import { useEndpoints } from "@/contexts/endpoints-context"
import { BrowserAirflowClient } from "@/lib/browser-airflow-client"
import { useQuery, useQueryClient, useQueryCache } from "@tanstack/react-query"
import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface DagDetailsProps {
  dagId: string
}

export function DagDetails({ dagId }: DagDetailsProps) {
  const { selectedEndpoint } = useEndpoints()
  const client = useMemo(() => new BrowserAirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  ), [selectedEndpoint?.id, selectedEndpoint?.username, selectedEndpoint?.password])

  const { data: dag, isLoading: isDagLoading } = useQuery({
    queryKey: ["dag", selectedEndpoint?.id, dagId],
    queryFn: () => client.getDag(dagId),
    enabled: !!selectedEndpoint?.id && !!dagId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const { data: dagRunsResponse, isLoading: isRunsLoading } = useQuery({
    queryKey: ["dag-runs", selectedEndpoint?.id, dagId],
    queryFn: () => client.getDagRuns(dagId),
    enabled: !!selectedEndpoint?.id && !!dagId,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 20000,
  })

  const dagRuns = dagRunsResponse?.dag_runs

  if (!selectedEndpoint) {
    return (
      <div className="flex items-center justify-center h-[200px]" data-kind="no-endpoint-message">
        <p className="text-muted-foreground">Please select an endpoint</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-kind="dag-details">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{dagId}</h2>
          {dag && (
            <p className="text-muted-foreground">
              {dag.description || "No description available"}
            </p>
          )}
        </div>
        <Badge variant="outline">{selectedEndpoint.name}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg space-y-2">
          <h3 className="font-medium">Schedule</h3>
          <p className="text-muted-foreground">{dag?.schedule_interval || "Not scheduled"}</p>
        </div>
        <div className="p-4 border rounded-lg space-y-2">
          <h3 className="font-medium">Status</h3>
          <Badge variant={dag?.is_active ? "default" : "secondary"}>
            {dag?.is_active ? "Active" : "Paused"}
          </Badge>
        </div>
        <div className="p-4 border rounded-lg space-y-2">
          <h3 className="font-medium">Owners</h3>
          <div className="flex flex-wrap gap-2">
            {dag?.owners?.map((owner, index) => (
              <Badge key={`${owner}-${index}`} variant="outline">
                {owner}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run ID</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isRunsLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : dagRuns?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No DAG runs found
                </TableCell>
              </TableRow>
            ) : (
              dagRuns?.map((run) => (
                <TableRow key={`${run.dag_run_id}-${run.start_date}`}>
                  <TableCell className="font-medium">{run.dag_run_id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        run.state === "success"
                          ? "default"
                          : run.state === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {run.state}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {run.start_date
                      ? new Date(run.start_date).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {run.end_date
                      ? new Date(run.end_date).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {run.start_date && run.end_date
                      ? `${((new Date(run.end_date).getTime() - new Date(run.start_date).getTime()) / 1000).toFixed(2)}s`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
