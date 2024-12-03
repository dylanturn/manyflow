import { Redis } from 'ioredis'
import { DagRun, Endpoint } from './validation'
import config from './config'

const redis = new Redis(config.redis.url)

const CACHE_TTL = {
  ENDPOINT: 60 * 5, // 5 minutes
  DAG_RUN: 60 * 2, // 2 minutes
  DAG_LIST: 60 * 1, // 1 minute
}

export class Cache {
  static async getEndpoint(id: string): Promise<Endpoint | null> {
    const cached = await redis.get(`endpoint:${id}`)
    return cached ? JSON.parse(cached) : null
  }

  static async setEndpoint(id: string, endpoint: Endpoint): Promise<void> {
    await redis.setex(`endpoint:${id}`, CACHE_TTL.ENDPOINT, JSON.stringify(endpoint))
  }

  static async getDagRun(endpointId: string, dagId: string, runId: string): Promise<DagRun | null> {
    const cached = await redis.get(`dag_run:${endpointId}:${dagId}:${runId}`)
    return cached ? JSON.parse(cached) : null
  }

  static async setDagRun(endpointId: string, dagId: string, runId: string, dagRun: DagRun): Promise<void> {
    await redis.setex(
      `dag_run:${endpointId}:${dagId}:${runId}`,
      CACHE_TTL.DAG_RUN,
      JSON.stringify(dagRun)
    )
  }

  static async getDagList(endpointId: string): Promise<string[] | null> {
    const cached = await redis.get(`dag_list:${endpointId}`)
    return cached ? JSON.parse(cached) : null
  }

  static async setDagList(endpointId: string, dagList: string[]): Promise<void> {
    await redis.setex(`dag_list:${endpointId}`, CACHE_TTL.DAG_LIST, JSON.stringify(dagList))
  }

  static async invalidateEndpoint(id: string): Promise<void> {
    await redis.del(`endpoint:${id}`)
  }

  static async invalidateDagRun(endpointId: string, dagId: string, runId: string): Promise<void> {
    await redis.del(`dag_run:${endpointId}:${dagId}:${runId}`)
  }

  static async invalidateDagList(endpointId: string): Promise<void> {
    await redis.del(`dag_list:${endpointId}`)
  }

  static async close(): Promise<void> {
    await redis.quit()
  }
}
