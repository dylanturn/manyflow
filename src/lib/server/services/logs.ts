import axios from 'axios'
import { Cache } from '../cache'
import { ElasticsearchService } from './elasticsearch'
import config from '../config'

interface LogLine {
  timestamp: string
  level: string
  message: string
  taskId?: string
  dagId?: string
  tryNumber?: number
  endpointId?: string
}

export class LogService {
  static async getTaskLogs(
    endpointUrl: string,
    dagId: string,
    taskId: string,
    dagRunId: string,
    tryNumber: number = 1,
    endpointId: string
  ): Promise<LogLine[]> {
    try {
      const cacheKey = `logs:${dagId}:${taskId}:${dagRunId}:${tryNumber}`
      
      // Try to get from cache first
      const cachedLogs = await Cache.getDagList(cacheKey)
      if (cachedLogs) {
        return JSON.parse(cachedLogs)
      }

      const response = await axios.get(
        `${endpointUrl}/api/v1/dags/${dagId}/dagRuns/${dagRunId}/taskInstances/${taskId}/logs/${tryNumber}`
      )

      const logs = this.parseLogs(response.data, { dagId, taskId, tryNumber, endpointId })
      
      // Cache logs for 5 minutes
      await Cache.setDagList(cacheKey, JSON.stringify(logs))
      
      // Index logs in Elasticsearch
      await ElasticsearchService.bulkIndex(
        config.elasticsearch.indices.logs,
        logs.map(log => ({
          ...log,
          '@timestamp': new Date(log.timestamp).toISOString()
        }))
      )
      
      return logs
    } catch (error) {
      throw new Error(`Failed to get task logs: ${error.message}`)
    }
  }

  static async getDagProcessorLogs(endpointUrl: string, endpointId: string): Promise<LogLine[]> {
    try {
      const response = await axios.get(`${endpointUrl}/api/v1/dagProcessor/logs`)
      const logs = this.parseLogs(response.data, { endpointId })
      
      // Index logs in Elasticsearch
      await ElasticsearchService.bulkIndex(
        config.elasticsearch.indices.logs,
        logs.map(log => ({
          ...log,
          '@timestamp': new Date(log.timestamp).toISOString()
        }))
      )
      
      return logs
    } catch (error) {
      throw new Error(`Failed to get DAG processor logs: ${error.message}`)
    }
  }

  static async getSchedulerLogs(endpointUrl: string, endpointId: string): Promise<LogLine[]> {
    try {
      const response = await axios.get(`${endpointUrl}/api/v1/scheduler/logs`)
      const logs = this.parseLogs(response.data, { endpointId })
      
      // Index logs in Elasticsearch
      await ElasticsearchService.bulkIndex(
        config.elasticsearch.indices.logs,
        logs.map(log => ({
          ...log,
          '@timestamp': new Date(log.timestamp).toISOString()
        }))
      )
      
      return logs
    } catch (error) {
      throw new Error(`Failed to get scheduler logs: ${error.message}`)
    }
  }

  private static parseLogs(rawLogs: string, metadata: Partial<LogLine> = {}): LogLine[] {
    return rawLogs
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/\[(.*?)\] \{(.*?)\} (.*)/)
        if (match) {
          const [, timestamp, level, message] = match
          return {
            timestamp,
            level: level.toLowerCase(),
            message,
            ...metadata
          }
        }
        return {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: line,
          ...metadata
        }
      })
  }

  // Stream logs using Server-Sent Events
  static async *streamTaskLogs(
    endpointUrl: string,
    dagId: string,
    taskId: string,
    dagRunId: string,
    tryNumber: number = 1,
    endpointId: string
  ): AsyncGenerator<LogLine, void, unknown> {
    let lastTimestamp: string | null = null
    
    while (true) {
      try {
        const logs = await this.getTaskLogs(endpointUrl, dagId, taskId, dagRunId, tryNumber, endpointId)
        
        // Filter and yield only new logs
        for (const log of logs) {
          if (!lastTimestamp || log.timestamp > lastTimestamp) {
            yield log
            lastTimestamp = log.timestamp
          }
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Error streaming logs:', error)
        break
      }
    }
  }
}
