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
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    const { dags } = await client.getDags(limit, offset)

    return NextResponse.json({ dags })
  } catch (error) {
    console.error('Failed to fetch DAGs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DAGs' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { endpointId: string } }
) {
  try {
    const { dagId, action } = await request.json()
    const endpoint = await getEndpoint(params.endpointId)

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      )
    }

    const client = new AirflowClient(endpoint.url, endpoint.username, endpoint.password)

    switch (action) {
      case 'pause':
        await client.pauseDag(dagId)
        break
      case 'unpause':
        await client.unpauseDag(dagId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
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
