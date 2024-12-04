import { ClusterStats } from "@/components/overview/cluster-stats"
import { RecentDags } from "@/components/overview/recent-dags"
import { DagExecutionsHeatmap } from "@/components/overview/dag-executions-heatmap"

export default function HomePage() {
  return (
    <div className="space-y-4 p-4">
      <ClusterStats />
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <RecentDags />
        </div>
        <div className="col-span-3">
          <DagExecutionsHeatmap />
        </div>
      </div>
    </div>
  )
}
