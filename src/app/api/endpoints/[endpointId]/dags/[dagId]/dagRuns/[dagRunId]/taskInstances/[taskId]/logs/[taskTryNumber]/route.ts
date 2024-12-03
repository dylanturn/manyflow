import { NextResponse } from 'next/server'
import { ServerAirflowClient } from '@/lib/server/server-airflow-client'
import { getEndpoint } from '@/lib/server/db'

export async function GET(
  request: Request,
  { params }: { params: { endpointId: string; dagId: string; dagRunId: string; taskId: string; taskTryNumber: string } }
) {
  try {
    const endpoint = await getEndpoint(params.endpointId)

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      )
    }

    const client = new ServerAirflowClient(endpoint.url, endpoint.username, endpoint.password)
    const logs = await client.getTaskLogs(
      params.dagId,
      params.dagRunId,
      params.taskId,
      parseInt(params.taskTryNumber)
    )

    return new Response(logs, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error('Failed to fetch task logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task logs' },
      { status: 500 }
    )
  }
}
