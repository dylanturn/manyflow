import { NextResponse } from 'next/server'
import { ServerAirflowClient } from '@/lib/server/server-airflow-client'
import { getEndpoint } from '@/lib/server/db'

export async function PATCH(
  request: Request,
  context: { params: { endpointId: string; dagId: string } }
) {
  const { endpointId, dagId } = context.params

  try {
    const endpoint = await getEndpoint(endpointId)
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      )
    }

    const client = new ServerAirflowClient(endpoint.url, endpoint.username, endpoint.password)
    const body = await request.json()
    
    if (body.is_paused) {
      await client.pauseDag(dagId)
    } else {
      await client.unpauseDag(dagId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update DAG:', error)
    return NextResponse.json(
      { error: 'Failed to update DAG' },
      { status: 500 }
    )
  }
}
