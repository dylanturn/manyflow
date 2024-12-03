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
    const timeRange = searchParams.get('timeRange') || '24h'
    const cacheKey = `analytics:logs:${timeRange}`

    // Try to get from cache first
    const cachedAnalytics = await Cache.getDagList(cacheKey)
    if (cachedAnalytics) {
      return NextResponse.json(JSON.parse(cachedAnalytics))
    }

    // Calculate time range
    const now = new Date()
    const gte = new Date(now.getTime() - parseTimeRange(timeRange))

    // Get analytics data
    const [
      logLevelStats,
      topErrors,
      logVolumeOverTime,
      topDags,
      topEndpoints
    ] = await Promise.all([
      getLogLevelStats(gte),
      getTopErrors(gte),
      getLogVolumeOverTime(gte, timeRange),
      getTopDags(gte),
      getTopEndpoints(gte)
    ])

    const analytics = {
      logLevelStats,
      topErrors,
      logVolumeOverTime,
      topDags,
      topEndpoints,
      timeRange
    }

    // Cache analytics for 5 minutes
    await Cache.setDagList(cacheKey, JSON.stringify(analytics), 300)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error getting log analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function parseTimeRange(timeRange: string): number {
  const value = parseInt(timeRange)
  const unit = timeRange.slice(-1)
  switch (unit) {
    case 'h':
      return value * 60 * 60 * 1000
    case 'd':
      return value * 24 * 60 * 60 * 1000
    case 'w':
      return value * 7 * 24 * 60 * 60 * 1000
    default:
      return 24 * 60 * 60 * 1000 // Default to 24h
  }
}

async function getLogLevelStats(gte: Date) {
  const result = await ElasticsearchService.search(config.elasticsearch.indices.logs, {
    query: {
      range: {
        '@timestamp': { gte: gte.toISOString() }
      }
    },
    aggs: {
      log_levels: {
        terms: { field: 'level.keyword' }
      }
    },
    size: 0
  })

  return result.aggregations.log_levels.buckets
}

async function getTopErrors(gte: Date) {
  const result = await ElasticsearchService.search(config.elasticsearch.indices.logs, {
    query: {
      bool: {
        must: [
          { term: { 'level.keyword': 'error' } },
          { range: { '@timestamp': { gte: gte.toISOString() } } }
        ]
      }
    },
    aggs: {
      error_messages: {
        terms: {
          field: 'message.keyword',
          size: 10
        }
      }
    },
    size: 0
  })

  return result.aggregations.error_messages.buckets
}

async function getLogVolumeOverTime(gte: Date, timeRange: string) {
  const interval = timeRange.endsWith('h') ? '5m' : '1h'
  
  const result = await ElasticsearchService.search(config.elasticsearch.indices.logs, {
    query: {
      range: {
        '@timestamp': { gte: gte.toISOString() }
      }
    },
    aggs: {
      logs_over_time: {
        date_histogram: {
          field: '@timestamp',
          fixed_interval: interval
        },
        aggs: {
          by_level: {
            terms: { field: 'level.keyword' }
          }
        }
      }
    },
    size: 0
  })

  return result.aggregations.logs_over_time.buckets
}

async function getTopDags(gte: Date) {
  const result = await ElasticsearchService.search(config.elasticsearch.indices.logs, {
    query: {
      range: {
        '@timestamp': { gte: gte.toISOString() }
      }
    },
    aggs: {
      top_dags: {
        terms: {
          field: 'dagId.keyword',
          size: 10
        },
        aggs: {
          error_count: {
            filter: { term: { 'level.keyword': 'error' } }
          }
        }
      }
    },
    size: 0
  })

  return result.aggregations.top_dags.buckets
}

async function getTopEndpoints(gte: Date) {
  const result = await ElasticsearchService.search(config.elasticsearch.indices.logs, {
    query: {
      range: {
        '@timestamp': { gte: gte.toISOString() }
      }
    },
    aggs: {
      top_endpoints: {
        terms: {
          field: 'endpointId.keyword',
          size: 10
        },
        aggs: {
          error_count: {
            filter: { term: { 'level.keyword': 'error' } }
          }
        }
      }
    },
    size: 0
  })

  return result.aggregations.top_endpoints.buckets
}
