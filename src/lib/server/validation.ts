import { z } from 'zod'

// User validation schema
export const UserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).default('user'),
})

// Endpoint validation schema
export const EndpointSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1),
  isActive: z.boolean().default(true),
  metadata: z.record(z.string(), z.any()).optional(),
})

// DAG run validation schema
export const DagRunSchema = z.object({
  endpoint_id: z.string().uuid(),
  dag_id: z.string(),
  run_id: z.string(),
  state: z.enum(['running', 'success', 'failed', 'queued']),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
})

// System log validation schema
export const SystemLogSchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'debug']),
  message: z.string(),
  context: z.record(z.string(), z.any()).optional(),
})

export type User = z.infer<typeof UserSchema>
export type Endpoint = z.infer<typeof EndpointSchema>
export type DagRun = z.infer<typeof DagRunSchema>
export type SystemLog = z.infer<typeof SystemLogSchema>

// Validation error handler
export class ValidationError extends Error {
  constructor(public errors: z.ZodError) {
    super('Validation Error')
    this.name = 'ValidationError'
  }
}

// Validation helper functions
export function validateUser(data: unknown): User {
  return UserSchema.parse(data)
}

export function validateEndpoint(data: unknown): Endpoint {
  return EndpointSchema.parse(data)
}

export function validateDagRun(data: unknown): DagRun {
  return DagRunSchema.parse(data)
}

export function validateSystemLog(data: unknown): SystemLog {
  return SystemLogSchema.parse(data)
}
