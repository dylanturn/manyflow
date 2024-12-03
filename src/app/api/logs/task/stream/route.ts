import { NextRequest } from 'next/server'
import { withMiddleware, AuthenticatedRequest } from '@/lib/server/auth/middleware'
import { LogService } from '@/lib/server/services/logs'
import { getDb } from '@/lib/server/db'

async function handler(req: AuthenticatedRequest) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const url = new URL(req.url)
    const endpointId = url.searchParams.get('endpointId')
    const dagId = url.searchParams.get('dagId')
    const taskId = url.searchParams.get('taskId')
    const dagRunId = url.searchParams.get('dagRunId')
    const tryNumber = parseInt(url.searchParams.get('tryNumber') || '1')

    if (!endpointId || !dagId || !taskId || !dagRunId) {
      return new Response('Missing required parameters', { status: 400 })
    }

    // Get endpoint URL
    const db = await getDb()
    const endpoint = await db.get('SELECT url FROM endpoints WHERE id = ?', endpointId)
    
    if (!endpoint) {
      return new Response('Endpoint not found', { status: 404 })
    }

    // Set up SSE
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start streaming logs
    const logStream = LogService.streamTaskLogs(endpoint.url, dagId, taskId, dagRunId, tryNumber)
    
    // Process logs in the background
    (async () => {
      try {
        for await (const log of logStream) {
          const data = `data: ${JSON.stringify(log)}\n\n`
          await writer.write(encoder.encode(data))
        }
      } catch (error) {
        console.error('Streaming error:', error)
      } finally {
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    return new Response(error.message, { status: 500 })
  }
}

export const GET = withMiddleware(handler)
