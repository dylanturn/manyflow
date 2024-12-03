import { NextResponse } from 'next/server'
import { AirflowClient } from '@/lib/server/airflow-client'
import { getEndpoint } from '@/lib/server/db'

export async function GET(
  request: Request,
  { params }: { params: { endpointId: string } }
) {
  try {
    const endpoint = await getEndpoint(params.endpointId)

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      )
    }

    const client = new AirflowClient(endpoint.url, endpoint.username, endpoint.password)
    const health = await client.getHealth()

    return NextResponse.json(health)
  } catch (error) {
    console.error('Failed to fetch health:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health' },
      { status: 500 }
    )
  }
}
