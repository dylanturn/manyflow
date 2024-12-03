import { getEndpoint } from '@/lib/server/endpoints'
import { ServerAirflowClient } from '@/lib/server/server-airflow-client'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { endpointId: string; dagId: string } }
) {
  try {
    const endpoint = await getEndpoint(params.endpointId)
    if (!endpoint) {
      return new NextResponse('Endpoint not found', { status: 404 })
    }

    const searchParams = new URL(request.url).searchParams
    const limit = parseInt(searchParams.get('limit') ?? '100')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const client = new ServerAirflowClient(endpoint.url, endpoint.username, endpoint.password)
    const response = await client.getDagRuns(params.dagId, limit, offset)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching DAG runs:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { endpointId: string; dagId: string } }
) {
  try {
    const endpoint = await getEndpoint(params.endpointId)
    if (!endpoint) {
      return new NextResponse('Endpoint not found', { status: 404 })
    }

    const body = await request.json()
    const client = new ServerAirflowClient(endpoint.url, endpoint.username, endpoint.password)
    const response = await client.triggerDag(params.dagId, body.conf)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error triggering DAG:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
