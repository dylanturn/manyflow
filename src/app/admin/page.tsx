import { AirflowEndpointList } from "@/components/admin/airflow-endpoint-list"
import { AddEndpointDialog } from "@/components/admin/add-endpoint-dialog"

export default function AdminPage() {
  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Airflow Endpoints</h1>
        <AddEndpointDialog />
      </div>
      <AirflowEndpointList />
    </main>
  )
}
