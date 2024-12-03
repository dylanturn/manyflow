import { ClusterStats } from "@/components/overview/cluster-stats"
import { RecentDags } from "@/components/overview/recent-dags"

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>
      <ClusterStats />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentDags />
      </div>
    </div>
  )
}
