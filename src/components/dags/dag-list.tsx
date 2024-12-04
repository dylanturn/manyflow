'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEndpoints } from "@/contexts/endpoints-context"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowUpDown, Search } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type SortField = "dag_id" | "owners" | "is_active" | "cluster"

export function DagList() {
  const { endpoints } = useEndpoints()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("dag_id")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const endpointQueries = useQuery({
    queryKey: ["all-dags"],
    queryFn: async () => {
      const allDags = await Promise.all(
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
      return allDags.flat()
    },
    enabled: endpoints.length > 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 20000,
  })

  const toggleDagMutation = useMutation({
    mutationFn: async ({ dagId, clusterId, isActive }: { dagId: string, clusterId: string, isActive: boolean }) => {
      // Find the endpoint by cluster name to get its ID
      const endpoint = endpoints.find(e => e.name === clusterId)
      if (!endpoint) {
        throw new Error(`Endpoint not found for cluster: ${clusterId}`)
      }

      const response = await fetch(`/api/endpoints/${endpoint.id}/dags/${dagId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_paused: !isActive
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to toggle DAG state: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "DAG state updated successfully",
      })
      // Refresh the DAGs list
      endpointQueries.refetch()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update DAG state",
        variant: "destructive",
      })
      console.error('Error toggling DAG state:', error)
    },
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const filteredAndSortedDags = endpointQueries.data
    ?.filter((dag) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        dag.dag_id.toLowerCase().includes(searchLower) ||
        dag.owners.some((owner) => owner.toLowerCase().includes(searchLower)) ||
        (dag.tags ?? []).some((tag) => 
          typeof tag === 'string' 
            ? tag.toLowerCase().includes(searchLower)
            : tag.name?.toLowerCase().includes(searchLower)
        ) ||
        dag.cluster.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortField === "cluster") {
        comparison = a.cluster.localeCompare(b.cluster)
      } else if (sortField === "dag_id") {
        comparison = a.dag_id.localeCompare(b.dag_id)
      } else if (sortField === "owners") {
        comparison = (a.owners[0] || "").localeCompare(b.owners[0] || "")
      } else if (sortField === "is_active") {
        comparison = (a.is_active === b.is_active) ? 0 : a.is_active ? -1 : 1
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  if (endpoints.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please add an endpoint to view DAGs
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search DAGs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("dag_id")}
                  className="flex items-center gap-2 font-medium"
                >
                  DAG ID
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("owners")}
                  className="flex items-center gap-2 font-medium"
                >
                  Owners
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("cluster")}
                  className="flex items-center gap-1"
                >
                  Cluster <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("is_active")}
                  className="flex items-center gap-2 font-medium"
                >
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">Enable/Disable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpointQueries.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[250px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[40px] mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAndSortedDags?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No DAGs found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedDags?.map((dag) => (
                <TableRow key={`${dag.cluster}-${dag.dag_id}`} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link href={`/dags/${dag.dag_id}`} className="hover:underline">
                      {dag.dag_id}
                    </Link>
                  </TableCell>
                  <TableCell>{dag.owners.join(", ")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {dag.tags?.map((tag) => (
                        <Badge
                          key={typeof tag === 'string' ? tag : tag.name}
                          variant="secondary"
                        >
                          {typeof tag === 'string' ? tag : tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{dag.cluster}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={dag.is_active ? "default" : "secondary"}
                    >
                      {dag.is_active ? "Active" : "Paused"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Switch
                              checked={dag.is_active}
                              disabled={toggleDagMutation.isPending}
                              onCheckedChange={() => {
                                toggleDagMutation.mutate({
                                  dagId: dag.dag_id,
                                  clusterId: dag.cluster,
                                  isActive: dag.is_active
                                })
                              }}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Toggle ${dag.dag_id}`}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dag.is_active ? 'Pause DAG' : 'Unpause DAG'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
