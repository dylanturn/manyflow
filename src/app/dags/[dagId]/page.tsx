"use client"

import { DagDetails } from "@/components/dags/dag-details"

export default function DagPage({ params }: { params: { dagId: string } }) {
  return (
    <div data-kind="dag-details-page">
      <DagDetails dagId={params.dagId} />
    </div>
  )
}
