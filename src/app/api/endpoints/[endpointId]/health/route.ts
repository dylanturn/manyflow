import { NextResponse } from 'next/server'
import { AirflowClient } from '@/lib/server/airflow-client'
import { getEndpoint } from '@/lib/server/db'

export async function GET(
  request: Request,
  { params }: { params: { endpointId: string } }
) {
  console.log(`[Health Check] Getting health for endpoint: ${params.endpointId}`)
  
  try {
    const endpoint = await getEndpoint(params.endpointId)

    if (!endpoint) {
      console.log(`[Health Check] Endpoint not found: ${params.endpointId}`)
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

    const client = new AirflowClient(endpoint.url, endpoint.username, endpoint.password)
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
