"use client"

import { DagStatusCard } from "@/components/cards/dag-status-card"
import { ActiveDagsCard } from "@/components/cards/active-dags-card"
import { PausedDagsCard } from "@/components/cards/paused-dags-card"
import { ClusterHealthCard } from "@/components/cards/cluster-health-card"
import { RecentActivityCard } from "@/components/cards/recent-activity-card"

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DagStatusCard />
      <ActiveDagsCard />
      <PausedDagsCard />
      <ClusterHealthCard />
      <div className="md:col-span-2 lg:col-span-4">
        <RecentActivityCard />
      </div>
    </div>
  )
}
