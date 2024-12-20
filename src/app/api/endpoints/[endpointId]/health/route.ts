import { NextResponse } from 'next/server'
import { ServerAirflowClient } from '@/lib/server/server-airflow-client'
import { getEndpoint } from '@/lib/server/db'

export async function GET(
  request: Request,
  context: { params: { endpointId: string } }
) {
  const { endpointId } = context.params
  console.log(`[Health Check] Getting health for endpoint: ${endpointId}`)
  
  try {
    const endpoint = await getEndpoint(endpointId)

    if (!endpoint) {
      console.log(`[Health Check] Endpoint not found: ${endpointId}`)
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      )
    }

    console.log(`[Health Check] Found endpoint:`, {
      id: endpoint.id,
      name: endpoint.name,
      url: endpoint.url
    })

    const client = new ServerAirflowClient(endpoint.url, endpoint.username, endpoint.password)
    const health = await client.getHealth()

    console.log(`[Health Check] Health check result:`, health)
    return NextResponse.json(health)
  } catch (error) {
    console.error('[Health Check] Failed to fetch health:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health' },
      { status: 500 }
    )
  }
}
