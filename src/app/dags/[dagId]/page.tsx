"use client"

import { DagDetails } from "@/components/dags/dag-details"
import { use } from "react"

export default function DagPage({ params }: { params: Promise<{ dagId: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <div data-kind="dag-details-page">
      <DagDetails dagId={resolvedParams.dagId} />
    </div>
  )
}
