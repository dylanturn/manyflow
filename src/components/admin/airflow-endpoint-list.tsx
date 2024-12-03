"use client"

import { useState, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"
import { useEndpoints } from "@/contexts/endpoints-context"

interface AirflowEndpoint {
  id: string
  name: string
  url: string
  isActive: boolean
  health: {
    metadatabase: {
      status: string
    }
    scheduler: {
      status: string
    }
    triggerer: {
      status: string
    }
  }
}

export function AirflowEndpointList() {
  const { endpoints, deleteEndpoint, refreshHealth } = useEndpoints()
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})

  const handleRefresh = useCallback(async (id: string) => {
    setRefreshing((prev) => ({ ...prev, [id]: true }))
    try {
      await refreshHealth(id)
    } finally {
      setRefreshing((prev) => ({ ...prev, [id]: false }))
    }
  }, [refreshHealth])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints.map((endpoint) => (
            <TableRow key={endpoint.id}>
              <TableCell>{endpoint.name}</TableCell>
              <TableCell>{endpoint.url}</TableCell>
              <TableCell>
                <Badge variant={endpoint.isActive ? "default" : "destructive"}>
                  {endpoint.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {endpoint.health ? (
                  <div className="flex flex-col gap-1">
                    <Badge variant={endpoint.health.metadatabase.status === "healthy" ? "default" : "destructive"}>
                      DB: {endpoint.health.metadatabase.status}
                    </Badge>
                    <Badge variant={endpoint.health.scheduler.status === "healthy" ? "default" : "destructive"}>
                      Scheduler: {endpoint.health.scheduler.status}
                    </Badge>
                    <Badge variant={endpoint.health.triggerer.status === "healthy" ? "default" : "destructive"}>
                      Triggerer: {endpoint.health.triggerer.status}
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="secondary">Unknown</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRefresh(endpoint.id)}
                    disabled={refreshing[endpoint.id]}
                  >
                    {refreshing[endpoint.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEndpoint(endpoint.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
