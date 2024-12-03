import { NextRequest, NextResponse } from 'next/server'
import { getEndpoints } from '@/lib/server/db'

// For now, we'll just check if there are any endpoints configured
// Later, we can add proper authentication with JWT or session-based auth
export async function authenticateRequest(req: NextRequest) {
  try {
    // Check if there are any endpoints configured
    const endpoints = await getEndpoints()
    if (endpoints.length === 0) {
      return NextResponse.json(
        { error: 'No endpoints configured' },
        { status: 401 }
      )
    }

    // For now, we'll allow all requests if there are endpoints configured
    return NextResponse.next()
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

// Middleware to check if a specific endpoint exists and is active
export async function validateEndpoint(endpointId: string) {
  try {
    const endpoints = await getEndpoints()
    const endpoint = endpoints.find(e => e.id === endpointId)

    if (!endpoint) {
      return {
        error: 'Endpoint not found',
        status: 404
      }
    }

    if (!endpoint.isActive) {
      return {
        error: 'Endpoint is not active',
        status: 403
      }
    }

    return {
      endpoint,
      status: 200
    }
  } catch (error) {
    console.error('Endpoint validation error:', error)
    return {
      error: 'Failed to validate endpoint',
      status: 500
    }
  }
}
