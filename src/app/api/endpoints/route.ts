import { NextResponse } from 'next/server'
import { getEndpoints, addEndpoint } from '@/lib/server/db'

// Initialize default endpoints if none exist
const defaultEndpoints = [
  {
    name: 'Local Airflow 1',
    url: 'http://0.0.0.0:8085',
    username: 'airflow',
    password: 'airflow',
  },
  {
    name: 'Local Airflow 2',
    url: 'http://0.0.0.0:8086',
    username: 'airflow',
    password: 'airflow',
  },
]

export async function GET() {
  try {
    let endpoints = await getEndpoints()

    // Initialize with default endpoints if none exist
    if (endpoints.length === 0) {
      for (const endpoint of defaultEndpoints) {
        await addEndpoint(endpoint)
      }
      endpoints = await getEndpoints()
    }

    return NextResponse.json({ endpoints })
  } catch (error) {
    console.error('Failed to fetch endpoints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch endpoints' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const endpoint = await request.json()
    const newEndpoint = await addEndpoint(endpoint)
    return NextResponse.json({ endpoint: newEndpoint })
  } catch (error) {
    console.error('Failed to add endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to add endpoint' },
      { status: 500 }
    )
  }
}
