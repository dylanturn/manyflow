import { type AirflowHealth, type DAG, type DAGRun, type TaskInstance } from '@/types/airflow'

/**
 * Client-side Airflow API client that communicates through Next.js API routes.
 * This client is safe to use in browser environments as it doesn't contain sensitive credentials.
 */
export class BrowserAirflowClient {
  private endpointId: string
  private username: string
  private password: string

  constructor(endpointId: string, username: string, password: string) {
    this.endpointId = endpointId
    this.username = username
    this.password = password
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`/api/endpoints/${this.endpointId}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Airflow API error: ${error}`)
    }

    return response.json()
  }

  async getHealth(): Promise<any> {
    const response = await fetch(`/api/endpoints/${this.endpointId}/health`)
    if (!response.ok) {
      throw new Error('Failed to fetch health status')
    }
    return response.json()
  }

  async getDags(limit = 100, offset = 0): Promise<{ dags: DAG[], total_entries: number }> {
    return this.fetch<{ dags: DAG[], total_entries: number }>(`/dags?limit=${limit}&offset=${offset}`)
  }

  async getDagRuns(dagId: string, limit = 100, offset = 0): Promise<{ dag_runs: DAGRun[], total_entries: number }> {
    return this.fetch<{ dag_runs: DAGRun[], total_entries: number }>(
      `/dags/${dagId}/dagRuns?limit=${limit}&offset=${offset}`
    )
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
      `/api/endpoints/${this.endpointId}/dags/${dagId}/dagRuns/${dagRunId}/taskInstances/${taskId}/logs/${taskTryNumber}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch task logs')
    }

    return response.text()
  }
}
