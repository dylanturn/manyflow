import { Endpoint } from '@/contexts/endpoints-context'
import { getDb } from './db'

const ENDPOINTS_KEY = 'airflow:endpoints'

export async function getEndpoints(): Promise<Endpoint[]> {
  const db = await getDb()
  const endpoints = await db.all('SELECT * FROM endpoints WHERE isActive = 1')
  return endpoints
}

export async function getEndpoint(id: string): Promise<Endpoint | null> {
  const db = await getDb()
  const endpoint = await db.get('SELECT * FROM endpoints WHERE id = ? AND isActive = 1', id)
  return endpoint || null
}

export async function addEndpoint(endpoint: Omit<Endpoint, 'id' | 'isActive'>): Promise<Endpoint> {
  const db = await getDb()
  const id = crypto.randomUUID()
  
  await db.run(
    'INSERT INTO endpoints (id, name, url, username, password, isActive) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    endpoint.name,
    endpoint.url,
    endpoint.username,
    endpoint.password,
    true
  )

  return {
    ...endpoint,
    id,
    isActive: true,
  }
}

export async function updateEndpoint(id: string, update: Partial<Endpoint>): Promise<void> {
  const db = await getDb()
  const updates: string[] = []
  const values: any[] = []

  if (update.name !== undefined) {
    updates.push('name = ?')
    values.push(update.name)
  }
  if (update.url !== undefined) {
    updates.push('url = ?')
    values.push(update.url)
  }
  if (update.username !== undefined) {
    updates.push('username = ?')
    values.push(update.username)
  }
  if (update.password !== undefined) {
    updates.push('password = ?')
    values.push(update.password)
  }
  if (update.isActive !== undefined) {
    updates.push('isActive = ?')
    values.push(update.isActive)
  }

  if (updates.length > 0) {
    values.push(id)
    await db.run(
      `UPDATE endpoints SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    )
  }
}

export async function deleteEndpoint(id: string): Promise<void> {
  const db = await getDb()
  await db.run('UPDATE endpoints SET isActive = 0 WHERE id = ?', id)
}
