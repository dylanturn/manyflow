import { Database } from 'sqlite3'
import { open } from 'sqlite'
import { Endpoint } from '@/contexts/endpoints-context'

let db: any = null

async function getDb() {
  if (!db) {
    db = await open({
      filename: './data.db',
      driver: Database
    })

    await db.exec(`
      CREATE TABLE IF NOT EXISTS endpoints (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        isActive BOOLEAN NOT NULL DEFAULT 1
      )
    `)
  }

  return db
}

export async function getEndpoints(): Promise<Endpoint[]> {
  const db = await getDb()
  return db.all('SELECT * FROM endpoints')
}

export async function getEndpoint(id: string): Promise<Endpoint | undefined> {
  const db = await getDb()
  return db.get('SELECT * FROM endpoints WHERE id = ?', id)
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
  const sets: string[] = []
  const values: any[] = []

  Object.entries(update).forEach(([key, value]) => {
    sets.push(`${key} = ?`)
    values.push(value)
  })

  if (sets.length > 0) {
    values.push(id)
    await db.run(
      `UPDATE endpoints SET ${sets.join(', ')} WHERE id = ?`,
      ...values
    )
  }
}

export async function deleteEndpoint(id: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM endpoints WHERE id = ?', id)
}
