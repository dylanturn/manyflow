import { NextResponse } from 'next/server'
import { withMiddleware, AuthenticatedRequest } from '@/lib/server/auth/middleware'
import { ElasticsearchService } from '@/lib/server/services/elasticsearch'
import { Cache } from '@/lib/server/cache'
import config from '@/lib/server/config'

const CACHE_TTL = 60 * 5 // 5 minutes

async function handler(req: AuthenticatedRequest) {
  if (req.method !== 'GET') {
    return new NextResponse('Method not allowed', { status: 405 })
  }

  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    const index = url.searchParams.get('index')
    const from = parseInt(url.searchParams.get('from') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const sort = url.searchParams.get('sort')
    const filters = url.searchParams.get('filters')

    if (!query || !index) {
      return new NextResponse('Missing required parameters', { status: 400 })
    }

    // Validate index
    const validIndices = Object.values(config.elasticsearch.indices)
    if (!validIndices.includes(index)) {
      return new NextResponse('Invalid index', { status: 400 })
    }

    // Create cache key
    const cacheKey = `search:${index}:${query}:${from}:${size}:${sort}:${filters}`

    // Try to get from cache
    const cachedResult = await Cache.getDagList(cacheKey)
    if (cachedResult) {
      return NextResponse.json(JSON.parse(cachedResult))
    }

    // Parse sort parameter
    let sortObj: Record<string, 'asc' | 'desc'> | undefined
    if (sort) {
      try {
        sortObj = JSON.parse(sort)
      } catch {
        return new NextResponse('Invalid sort parameter', { status: 400 })
      }
    }

    // Parse filters parameter
    let filtersObj: Record<string, any> = {}
    if (filters) {
      try {
        filtersObj = JSON.parse(filters)
      } catch {
        return new NextResponse('Invalid filters parameter', { status: 400 })
      }
    }

    // Add endpointId filter if not admin
    if (req.user?.role !== 'admin') {
      filtersObj.endpointId = req.user?.id
    }

    // Perform search
    const results = await ElasticsearchService.search({
      index,
      query,
      filters: filtersObj,
      from,
      size,
      sort: sortObj
    })

    // Cache results
    await Cache.setDagList(cacheKey, JSON.stringify(results))

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Search error:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}

export const GET = withMiddleware(handler)
