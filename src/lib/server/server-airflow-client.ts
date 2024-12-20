import { type AirflowHealth, type DAG, type DAGRun, type TaskInstance } from '@/types/airflow'

/**
 * Server-side Airflow API client that directly communicates with Airflow instances.
 * This client handles authentication and should only be used in server-side contexts.
 */
export class ServerAirflowClient {
  private baseUrl: string
  private username: string
  private password: string

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    this.username = username
    this.password = password
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint === '/health' 
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/api/v1${endpoint}`
    const headers = new Headers(options.headers)
    options.cache = 'no-cache'
    headers.set('Authorization', 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'))
    headers.set('Content-Type', 'application/json')

    console.log(`[Airflow Client] Making request to: ${url}`)
    console.log(`[Airflow Client] Headers:`, Object.fromEntries(headers.entries()))

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      console.log(`[Airflow Client] Response status:`, response.status)
      
      if (!response.ok) {
        const error = await response.text()
        console.error(`[Airflow Client] Error response:`, error)
        throw new Error(`Airflow API error: ${error}`)
      }

      const data = await response.json()
      console.log(`[Airflow Client] Response data:`, data)
      return data
    } catch (error) {
      console.error(`[Airflow Client] Request failed:`, error)
      throw error
    }
  }

  async getHealth(): Promise<AirflowHealth> {
    return this.fetch<AirflowHealth>('/health')
  }

  async getDags(limit = 100, offset = 0): Promise<{ dags: DAG[], total_entries: number }> {
    return this.fetch<{ dags: DAG[], total_entries: number }>(`/dags?limit=${limit}&offset=${offset}`)
  }

  async getDagRuns(
    dagId?: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{ dag_runs: DAGRun[]; total_entries: number }> {
    const { limit = 100, offset = 0, startDate, endDate } = options;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(startDate && { start_date_gte: startDate }),
      ...(endDate && { end_date_lte: endDate }),
    });

    const endpoint = dagId 
      ? `/dags/${dagId}/dagRuns?${queryParams}`
      : `/dags/~/dagRuns?${queryParams}`;

    return this.fetch<{ dag_runs: DAGRun[]; total_entries: number }>(endpoint);
  }

  async getTaskInstances(
    dagId: string,
    dagRunId: string,
    limit = 100,
    offset = 0
  ): Promise<{ task_instances: TaskInstance[], total_entries: number }> {
    return this.fetch<{ task_instances: TaskInstance[], total_entries: number }>(
      `/dags/${dagId}/dagRuns/${dagRunId}/taskInstances?limit=${limit}&offset=${offset}`
    )
  }

  async pauseDag(dagId: string): Promise<void> {
    await this.fetch(`/dags/${dagId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_paused: true }),
    })
  }

  async unpauseDag(dagId: string): Promise<void> {
    await this.fetch(`/dags/${dagId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_paused: false }),
    })
  }

  async triggerDag(dagId: string, conf?: Record<string, any>): Promise<DAGRun> {
    return this.fetch<DAGRun>(`/dags/${dagId}/dagRuns`, {
      method: 'POST',
      body: JSON.stringify({ conf: conf || {} }),
    })
  }

  async getTaskLogs(
    dagId: string,
    dagRunId: string,
    taskId: string,
    taskTryNumber: number
  ): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/dags/${dagId}/dagRuns/${dagRunId}/taskInstances/${taskId}/logs/${taskTryNumber}`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'),
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch task logs')
    }

    return response.text()
  }
}
