import { getEndpoint } from '@/lib/server/endpoints'
import { ServerAirflowClient } from '@/lib/server/server-airflow-client'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ endpointId: string; dagId: string }> }
) {
  const { endpointId, dagId } = await context.params

  try {
    const endpoint = await getEndpoint(endpointId)
    if (!endpoint) {
      return new NextResponse('Endpoint not found', { status: 404 })
    }

    const searchParams = new URL(request.url).searchParams
    const options = {
      limit: parseInt(searchParams.get('limit') ?? '100'),
      offset: parseInt(searchParams.get('offset') ?? '0'),
      startDate: searchParams.get('start_date_gte') ?? undefined,
      endDate: searchParams.get('end_date_lte') ?? undefined,
    }

    const client = new ServerAirflowClient(endpoint.url, endpoint.username, endpoint.password)
    const response = await client.getDagRuns(dagId === '~' ? undefined : dagId, options)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching DAG runs:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ endpointId: string; dagId: string }> }
) {
  const { endpointId, dagId } = await context.params

  try {
    const endpoint = await getEndpoint(endpointId)
    if (!endpoint) {
      return new NextResponse('Endpoint not found', { status: 404 })
    }

    const body = await request.json()
    const client = new ServerAirflowClient(endpoint.url, endpoint.username, endpoint.password)
    const response = await client.triggerDag(dagId, body.conf)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error triggering DAG:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
