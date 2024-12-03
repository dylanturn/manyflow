import { NextRequest } from 'next/server'
import { ElasticsearchService } from '@/lib/server/services/elasticsearch'
import config from '@/lib/server/config'
import { authenticateRequest } from '@/lib/server/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    // Set CORS headers for SSE
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers })
    }

    // Authenticate request
    const authResult = await authenticateRequest(req)
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse query parameters
    const searchParams = new URL(req.url).searchParams
    const query = searchParams.get('query') || '*'
    const level = searchParams.get('level')
    const dagId = searchParams.get('dagId')
    const taskId = searchParams.get('taskId')
    const endpointId = searchParams.get('endpointId')

    // Create SSE response
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start streaming
    let lastTimestamp = new Date().toISOString()

    const streamLogs = async () => {
      try {
        // Build search query
        const must: any[] = [
          { range: { '@timestamp': { gt: lastTimestamp } } },
          { query_string: { query } }
        ]
        if (level) must.push({ term: { 'level.keyword': level } })
        if (dagId) must.push({ term: { 'dagId.keyword': dagId } })
        if (taskId) must.push({ term: { 'taskId.keyword': taskId } })
        if (endpointId) must.push({ term: { 'endpointId.keyword': endpointId } })

        // Search for new logs
        const results = await ElasticsearchService.search(config.elasticsearch.indices.logs, {
          query: { bool: { must } },
          sort: [{ '@timestamp': 'asc' }],
          size: 100
        })

        // Send new logs
        if (results.hits.length > 0) {
          lastTimestamp = results.hits[results.hits.length - 1]['@timestamp']
          const data = `data: ${JSON.stringify(results.hits)}\n\n`
          await writer.write(encoder.encode(data))
        }

        // Keep connection alive with a heartbeat
        await writer.write(encoder.encode(': heartbeat\n\n'))
      } catch (error) {
        console.error('Error streaming logs:', error)
        const errorData = `data: ${JSON.stringify({ error: 'Error streaming logs' })}\n\n`
        await writer.write(encoder.encode(errorData))
      }
    }

    // Initial stream
    await streamLogs()

    // Set up interval for continuous streaming
    const intervalId = setInterval(streamLogs, 2000)

    // Clean up on disconnect
    req.signal.addEventListener('abort', () => {
      clearInterval(intervalId)
      writer.close()
    })

    return new Response(stream.readable, { headers })
  } catch (error) {
    console.error('Error setting up log stream:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}
