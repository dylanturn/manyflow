export interface DAG {
  dag_id: string
  is_paused: boolean
  is_active: boolean
  last_parsed_time: string
  last_pickled: string
  last_expired: string
  scheduler_lock: boolean
  file_token: string
  fileloc: string
  owners: string[]
  description: string
  schedule_interval: {
    __type: string
    value: string
  }
  tags: Array<string | { name: string }>
}

export interface DAGRun {
  dag_id: string
  dag_run_id: string
  execution_date: string
  start_date: string
  end_date: string
  state: string
  external_trigger: boolean
  conf: Record<string, any>
}

export interface TaskInstance {
  task_id: string
  dag_id: string
  execution_date: string
  start_date: string
  end_date: string
  duration: number
  state: string
  try_number: number
  max_tries: number
  hostname: string
  unixname: string
  pool: string
  queue: string
  priority_weight: number
  operator: string
  queued_dttm: string
  pid: number
}

export interface AirflowHealth {
  metadatabase: {
    status: string
    error: string | null
  }
  scheduler: {
    status: string
    latest_scheduler_heartbeat: string | null
    error: string | null
  }
  triggerer: {
    status: string
    latest_triggerer_heartbeat: string | null
    error: string | null
  }
}
