import { NextResponse } from 'next/server'
import { withMiddleware, AuthenticatedRequest } from '@/lib/server/auth/middleware'
import { DagService } from '@/lib/server/services/dag'
import { getDb } from '@/lib/server/db'

async function handler(req: AuthenticatedRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method not allowed', { status: 405 })
  }

  try {
    const { endpointId, dagIds, endDate } = await req.json()
    
    if (!endpointId || !dagIds) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Get endpoint URL
    const db = await getDb()
    const endpoint = await db.get('SELECT url FROM endpoints WHERE id = ?', endpointId)
    
    if (!endpoint) {
      return new NextResponse('Endpoint not found', { status: 404 })
    }

    const results = await DagService.batchClearDagRuns(endpoint.url, dagIds, endDate)
    return NextResponse.json(results)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export const POST = withMiddleware(handler, { requireAdmin: true })
