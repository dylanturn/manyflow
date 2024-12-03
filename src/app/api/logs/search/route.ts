import { NextRequest, NextResponse } from 'next/server'
import { ElasticsearchService } from '@/lib/server/services/elasticsearch'
import config from '@/lib/server/config'
import { Cache } from '@/lib/server/cache'
import { authenticateRequest } from '@/lib/server/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = new URL(req.url).searchParams
    const query = searchParams.get('query') || '*'
    const from = parseInt(searchParams.get('from') || '0')
    const size = parseInt(searchParams.get('size') || '50')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')
    const level = searchParams.get('level')
    const dagId = searchParams.get('dagId')
    const taskId = searchParams.get('taskId')
    const endpointId = searchParams.get('endpointId')

    // Build search query
    const must: any[] = [{ query_string: { query } }]
    if (startTime || endTime) {
      const range: any = { '@timestamp': {} }
      if (startTime) range['@timestamp'].gte = startTime
      if (endTime) range['@timestamp'].lte = endTime
      must.push({ range })
    }
    if (level) must.push({ term: { level } })
    if (dagId) must.push({ term: { dagId } })
    if (taskId) must.push({ term: { taskId } })
    if (endpointId) must.push({ term: { endpointId } })

    // Try to get from cache first
    const cacheKey = `search:logs:${JSON.stringify({ query, from, size, startTime, endTime, level, dagId, taskId, endpointId })}`
    const cachedResults = await Cache.getDagList(cacheKey)
    if (cachedResults) {
      return NextResponse.json(JSON.parse(cachedResults))
    }

    // Search Elasticsearch
    const results = await ElasticsearchService.search(config.elasticsearch.indices.logs, {
      query: { bool: { must } },
      sort: [{ '@timestamp': 'desc' }],
      from,
      size
    })

    const response = {
      hits: results?.hits?.map(hit => ({
        _id: hit._id,
        ...hit._source
      })) || [],
      total: results?.total || 0
    }

    // Cache results for 1 minute
    await Cache.setDagList(cacheKey, JSON.stringify(response), 60)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error searching logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
