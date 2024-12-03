'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEndpoints } from "@/contexts/endpoints-context"
import { AirflowClient } from "@/lib/airflow-client"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpDown, Search } from "lucide-react"
import { useState } from "react"

type SortField = "dag_id" | "owners" | "is_active"
type SortOrder = "asc" | "desc"

export function DagList() {
  const { selectedEndpoint } = useEndpoints()
  const client = new AirflowClient(
    selectedEndpoint?.id ?? "",
    selectedEndpoint?.username ?? "",
    selectedEndpoint?.password ?? ""
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("dag_id")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const { data: dags, isLoading } = useQuery({
    queryKey: ["dags", selectedEndpoint?.id],
    queryFn: () => client.getDags(),
    enabled: !!selectedEndpoint,
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const filteredAndSortedDags = dags?.dags
    ?.filter((dag) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        dag.dag_id.toLowerCase().includes(searchLower) ||
        dag.owners.some((owner) => owner.toLowerCase().includes(searchLower)) ||
        (dag.tags ?? []).some((tag) => 
          typeof tag === 'string' 
            ? tag.toLowerCase().includes(searchLower)
            : tag.name.toLowerCase().includes(searchLower)
        )
      )
    })
    .sort((a, b) => {
      if (sortField === "dag_id") {
        return sortOrder === "asc"
          ? a.dag_id.localeCompare(b.dag_id)
          : b.dag_id.localeCompare(a.dag_id)
      }
      if (sortField === "owners") {
        const ownerA = a.owners[0] || ""
        const ownerB = b.owners[0] || ""
        return sortOrder === "asc"
          ? ownerA.localeCompare(ownerB)
          : ownerB.localeCompare(ownerA)
      }
      if (sortField === "is_active") {
        return sortOrder === "asc"
          ? Number(a.is_active) - Number(b.is_active)
          : Number(b.is_active) - Number(a.is_active)
      }
      return 0
    })

  if (!selectedEndpoint) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please select an endpoint to view DAGs
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
                  onClick={() => handleSort("is_active")}
                  className="flex items-center gap-2 font-medium"
                >
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
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
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAndSortedDags?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No DAGs found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedDags?.map((dag) => (
                <TableRow key={dag.dag_id}>
                  <TableCell className="font-medium">{dag.dag_id}</TableCell>
                  <TableCell>{dag.owners.join(", ")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {dag.tags?.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                        >
                          {typeof tag === 'string' ? tag : tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dag.is_active ? "default" : "secondary"}>
                      {dag.is_active ? "Active" : "Paused"}
                    </Badge>
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
