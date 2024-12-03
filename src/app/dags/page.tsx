"use client"

import { DagList } from "@/components/dags/dag-list"

export default function DagsPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">DAGs</h1>
      </div>
      <DagList />
    </div>
  )
}
