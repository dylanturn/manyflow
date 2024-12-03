import { Database } from 'sqlite3'
import { open } from 'sqlite'
import * as initialSchema from './001_initial_schema'

interface Migration {
  up: (db: Database) => Promise<void>
  down: (db: Database) => Promise<void>
}

const migrations: Migration[] = [
  initialSchema,
]

export async function runMigrations(): Promise<void> {
  const db = await open({
    filename: './data.db',
    driver: Database
  })

  // Create migrations table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Get applied migrations
  const appliedMigrations = await db.all('SELECT name FROM migrations')
  const appliedMigrationNames = new Set(appliedMigrations.map(m => m.name))

  // Run pending migrations
  for (const [index, migration] of migrations.entries()) {
    const migrationName = `migration_${index + 1}`
    
    if (!appliedMigrationNames.has(migrationName)) {
      console.log(`Running migration: ${migrationName}`)
      await migration.up(db)
      await db.run('INSERT INTO migrations (name) VALUES (?)', migrationName)
      console.log(`Completed migration: ${migrationName}`)
    }
  }

  await db.close()
}
