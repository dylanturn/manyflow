import { Client } from '@elastic/elasticsearch'
import config from '../config'

// Initialize Elasticsearch client
const client = new Client({
  node: config.elasticsearch.node,
  auth: {
    username: config.elasticsearch.auth.username,
    password: config.elasticsearch.auth.password
  }
})

interface SearchOptions {
  index: string
  query: string
  filters?: Record<string, any>
  from?: number
  size?: number
  sort?: Record<string, 'asc' | 'desc'>
}

interface SearchResult<T> {
  total: number
  hits: Array<{
    _id: string
    _score: number
    _source: T
  }>
  aggregations?: Record<string, any>
}

export class ElasticsearchService {
  static async createIndices(): Promise<void> {
    const indices = [
      {
        name: config.elasticsearch.indices.logs,
        mappings: {
          properties: {
            timestamp: { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text' },
            dagId: { type: 'keyword' },
            taskId: { type: 'keyword' },
            tryNumber: { type: 'integer' },
            endpointId: { type: 'keyword' }
          }
        }
      },
      {
        name: config.elasticsearch.indices.dags,
        mappings: {
          properties: {
            dagId: { type: 'keyword' },
            description: { type: 'text' },
            schedule: { type: 'keyword' },
            tags: { type: 'keyword' },
            lastRunTime: { type: 'date' },
            nextRunTime: { type: 'date' },
            isPaused: { type: 'boolean' },
            endpointId: { type: 'keyword' }
          }
        }
      },
      {
        name: config.elasticsearch.indices.tasks,
        mappings: {
          properties: {
            taskId: { type: 'keyword' },
            dagId: { type: 'keyword' },
            state: { type: 'keyword' },
            startDate: { type: 'date' },
            endDate: { type: 'date' },
            duration: { type: 'float' },
            operator: { type: 'keyword' },
            retries: { type: 'integer' },
            endpointId: { type: 'keyword' }
          }
        }
      }
    ]

    for (const { name, mappings } of indices) {
      const exists = await client.indices.exists({ index: name })
      
      if (!exists) {
        await client.indices.create({
          index: name,
          mappings
        })
      }
    }
  }

  static async search<T>({
    index,
    query,
    filters = {},
    from = 0,
    size = 10,
    sort
  }: SearchOptions): Promise<SearchResult<T>> {
    const searchQuery = {
      bool: {
        must: [
          {
            query_string: {
              query,
              fields: ['*']
            }
          }
        ],
        filter: Object.entries(filters).map(([field, value]) => ({
          term: { [field]: value }
        }))
      }
    }

    const response = await client.search({
      index,
      from,
      size,
      sort,
      query: searchQuery,
      track_total_hits: true
    })

    return {
      total: response.hits.total as number,
      hits: response.hits.hits.map(hit => ({
        _id: hit._id,
        _score: hit._score || 0,
        _source: hit._source as T
      })),
      aggregations: response.aggregations
    }
  }

  static async index(index: string, document: Record<string, any>): Promise<string> {
    const response = await client.index({
      index,
      document,
      refresh: true
    })

    return response._id
  }

  static async bulkIndex(index: string, documents: Record<string, any>[]): Promise<void> {
    const operations = documents.flatMap(doc => [
      { index: { _index: index } },
      doc
    ])

    await client.bulk({
      refresh: true,
      operations
    })
  }

  static async delete(index: string, id: string): Promise<void> {
    await client.delete({
      index,
      id,
      refresh: true
    })
  }

  static async update(index: string, id: string, document: Record<string, any>): Promise<void> {
    await client.update({
      index,
      id,
      doc: document,
      refresh: true
    })
  }
}
