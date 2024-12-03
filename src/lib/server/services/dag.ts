import { getDb } from '../db'
import { Cache } from '../cache'
import { DagRun } from '../validation'
import axios from 'axios'

interface DagState {
  dagId: string
  state: string
  lastRunId?: string
  nextRunTime?: string
  isPaused: boolean
}

export class DagService {
  static async getDagState(endpointUrl: string, dagId: string): Promise<DagState> {
    try {
      const response = await axios.get(`${endpointUrl}/api/v1/dags/${dagId}`)
      return {
        dagId,
        state: response.data.state,
        lastRunId: response.data.last_run_id,
        nextRunTime: response.data.next_run_time,
        isPaused: response.data.is_paused
      }
    } catch (error) {
      throw new Error(`Failed to get DAG state: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  static async toggleDagState(endpointUrl: string, dagId: string, isPaused: boolean): Promise<void> {
    try {
      await axios.patch(`${endpointUrl}/api/v1/dags/${dagId}`, {
        is_paused: isPaused
      })
    } catch (error) {
      throw new Error(`Failed to toggle DAG state: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  static async batchToggleDagState(
    endpointUrl: string,
    dagIds: string[],
    isPaused: boolean
  ): Promise<{ success: string[]; failed: { dagId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { dagId: string; error: string }[]
    }

    await Promise.all(
      dagIds.map(async (dagId) => {
        try {
          await this.toggleDagState(endpointUrl, dagId, isPaused)
          results.success.push(dagId)
        } catch (error) {
          results.failed.push({ dagId, error: error instanceof Error ? error.message : String(error) })
        }
      })
    )

    return results
  }

  static async triggerDag(endpointUrl: string, dagId: string, conf?: Record<string, any>): Promise<string> {
    try {
      const response = await axios.post(`${endpointUrl}/api/v1/dags/${dagId}/dagRuns`, {
        conf: conf || {}
      })
      return response.data.dag_run_id
    } catch (error) {
      throw new Error(`Failed to trigger DAG: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  static async batchTriggerDags(
    endpointUrl: string,
    dagIds: string[],
    conf?: Record<string, any>
  ): Promise<{ success: { dagId: string; runId: string }[]; failed: { dagId: string; error: string }[] }> {
    const results = {
      success: [] as { dagId: string; runId: string }[],
      failed: [] as { dagId: string; error: string }[]
    }

    await Promise.all(
      dagIds.map(async (dagId) => {
        try {
          const runId = await this.triggerDag(endpointUrl, dagId, conf)
          results.success.push({ dagId, runId })
        } catch (error) {
          results.failed.push({ dagId, error: error instanceof Error ? error.message : String(error) })
        }
      })
    )

    return results
  }

  static async getDagRuns(
    endpointUrl: string,
    dagId: string,
    limit: number = 100
  ): Promise<DagRun[]> {
    try {
      const response = await axios.get(`${endpointUrl}/api/v1/dags/${dagId}/dagRuns`, {
        params: { limit }
      })
      return response.data.dag_runs
    } catch (error) {
      throw new Error(`Failed to get DAG runs: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  static async clearDagRuns(
    endpointUrl: string,
    dagId: string,
    endDate?: string
  ): Promise<void> {
    try {
      await axios.delete(`${endpointUrl}/api/v1/dags/${dagId}/dagRuns`, {
        params: { end_date: endDate }
      })
    } catch (error) {
      throw new Error(`Failed to clear DAG runs: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  static async batchClearDagRuns(
    endpointUrl: string,
    dagIds: string[],
    endDate?: string
  ): Promise<{ success: string[]; failed: { dagId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { dagId: string; error: string }[]
    }

    await Promise.all(
      dagIds.map(async (dagId) => {
        try {
          await this.clearDagRuns(endpointUrl, dagId, endDate)
          results.success.push(dagId)
        } catch (error) {
          results.failed.push({ dagId, error: error instanceof Error ? error.message : String(error) })
        }
      })
    )

    return results
  }
}
