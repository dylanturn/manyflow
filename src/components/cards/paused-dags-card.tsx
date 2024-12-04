"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEndpoints } from "@/contexts/endpoints-context"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { BrowserAirflowClient } from "@/lib/browser-airflow-client"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, PauseCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function PausedDagsCard() {
  const router = useRouter()
  const { selectedEndpoint } = useEndpoints()
  const client = useMemo(() => new BrowserAirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  ), [selectedEndpoint?.id, selectedEndpoint?.username, selectedEndpoint?.password])

  const { data: currentDags, isLoading, error } = useQuery({
    queryKey: ["dags", selectedEndpoint?.id],
    queryFn: () => client.getDags(),
    enabled: !!selectedEndpoint?.id,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 20000,
    retry: false,
  })

  // Query for previous period data (24h ago)
  const { data: previousDags } = useQuery({
    queryKey: ["dags-previous", selectedEndpoint?.id],
    queryFn: () => client.getDags({ referenceDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }),
    enabled: !!selectedEndpoint?.id,
    staleTime: 20000,
    retry: false,
  })

  if (isLoading) {
    return (
      <Card className="hover:bg-accent/50 transition-colors">
        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tracking-tight text-sm font-medium">Paused DAGs</CardTitle>
          <PauseCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="hover:bg-accent/50 transition-colors border-destructive">
        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tracking-tight text-sm font-medium">Paused DAGs</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-2xl font-bold text-destructive">Error</div>
          <p className="text-xs text-muted-foreground">Failed to fetch DAG data</p>
        </CardContent>
      </Card>
    )
  }

  const pausedDags = currentDags?.dags.filter(dag => !dag.is_active) ?? []
  const pausedDagsCount = pausedDags.length
  const previousPausedCount = previousDags?.dags.filter(dag => !dag.is_active).length ?? 0
  const percentageChange = previousPausedCount ? 
    ((pausedDagsCount - previousPausedCount) / previousPausedCount) * 100 : 0

  const handleClick = () => {
    router.push('/dags?filter=paused')
  }

  return (
    <Button
      variant="ghost"
      className="p-0 h-auto w-full"
      onClick={handleClick}
    >
      <Card className="w-full hover:bg-accent/50 transition-colors">
        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="tracking-tight text-sm font-medium">Paused DAGs</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <PauseCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view all paused DAGs</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{pausedDagsCount}</div>
            {percentageChange !== 0 && (
              <span className={`text-xs ${percentageChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {percentageChange > 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {pausedDags.length > 0 
              ? `${pausedDags.length} DAG${pausedDags.length === 1 ? '' : 's'} currently paused`
              : 'No paused DAGs'}
          </p>
        </CardContent>
      </Card>
    </Button>
  )
}
